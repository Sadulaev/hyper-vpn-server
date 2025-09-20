// google-sheets.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, sheets_v4 } from 'googleapis';


function withTimeout<T>(p: Promise<T>, ms = 10000): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error(`Google API timeout after ${ms}ms`)), ms)),
  ]);
}

@Injectable()
export class GoogleSheetsService {
    private readonly logger = new Logger(GoogleSheetsService.name);
    private sheets!: sheets_v4.Sheets;

    constructor(
        private readonly configService: ConfigService
    ) {}

    async onModuleInit() {
        const auth = new google.auth.JWT(
            {
                email: this.configService.get('GOOGLE_SA_CLIENT_EMAIL'),
                key: this.configService.get('GOOGLE_SA_PRIVATE_KEY').replace(/\\n/g, '\n'),
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            }
        );
        // глобальный таймаут для всех запросов googleapis
        google.options({ timeout: 10000 }); // 10s

        // Явная авторизация на старте — поймаем проблемы сразу
        try {
            await withTimeout(auth.authorize(), 10000);
            this.logger.log('Google JWT authorized');
        } catch (err: any) {
            this.logger.error('JWT authorize failed', err?.response?.data ?? err);
            throw err;
        }

        this.sheets = google.sheets({ version: 'v4', auth });

        // опционально: проверить имя листа и доступы
        try {
            const meta = await withTimeout(
                this.sheets.spreadsheets.get({ spreadsheetId: process.env.GOOGLE_SHEETS_ID! }),
                10000
            );
            const titles = meta.data.sheets?.map(s => s.properties?.title);
            this.logger.log(`Sheets available: ${titles?.join(', ')}`);
        } catch (err: any) {
            this.logger.error('Sheets metadata read failed', err?.response?.data ?? err);
        }
    }

    async appendRow(sheetName: string, values: (string | number | boolean | null)[]) {
        const spreadsheetId = this.configService.get('GOOGLE_SHEETS_ID')!;
        await this.sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${sheetName}!A1`,
            valueInputOption: 'USER_ENTERED',   // чтобы даты/формулы распознавались
            insertDataOption: 'INSERT_ROWS',
            requestBody: { values: [values] },
        });

    }

    async readRange(range = 'Лист1!A1:D5') {
        const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;
        const res = await this.sheets.spreadsheets.values.get({ spreadsheetId, range });
        return res.data.values ?? [];
    }
}