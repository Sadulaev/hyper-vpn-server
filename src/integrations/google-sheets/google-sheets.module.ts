import { Module } from '@nestjs/common';
import { GoogleSheetsService } from './google-sheets.service';
import { ConfigModule } from '@nestjs/config';
import { SheetsController } from './google-sheets.controller';

@Module({
    imports: [ConfigModule],
    providers: [GoogleSheetsService],
    // controllers: [SheetsController],
    exports: [GoogleSheetsService],
})
export class GoogleSheetsModule { }