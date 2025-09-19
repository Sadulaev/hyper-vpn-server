// google-sheets.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, sheets_v4 } from 'googleapis';

@Injectable()
export class GoogleSheetsService {
    private readonly logger = new Logger(GoogleSheetsService.name);
    private sheets: sheets_v4.Sheets;

    constructor(
        private readonly configService: ConfigService,
    ) {

        const auth = new google.auth.JWT(
            {
                email: this.configService.get('GOOGLE_SA_CLIENT_EMAIL'),
                key: this.configService.get('GOOGLE_SA_PRIVATE_KEY').replace(/\\n/g, '\n'),
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            }
        );

        this.sheets = google.sheets({ version: 'v4', auth });
    }

    async appendRow(sheetName: string, values: (string | number | boolean | null)[]) {
        try {
            const spreadsheetId = this.configService.get('GOOGLE_SHEETS_ID')!;
            const result = await this.sheets.spreadsheets.values.append({
                spreadsheetId,
                range: `${sheetName}!A1`,
                valueInputOption: 'USER_ENTERED',   // чтобы даты/формулы распознавались
                insertDataOption: 'INSERT_ROWS',
                requestBody: { values: [values] },
            });
            return true
        } catch(err) {
            console.error(err);
            return false;
        }
        
    }

    async readRange(range = 'Лист1!A1:D5') {
        const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;
        const res = await this.sheets.spreadsheets.values.get({ spreadsheetId, range });
        return res.data.values ?? [];
    }
}