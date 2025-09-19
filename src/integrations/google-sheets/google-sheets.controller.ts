import { Body, Controller, Get, Post } from '@nestjs/common';
import { GoogleSheetsService } from './google-sheets.service';
import { AddUserDto } from '../../../dto/add-user.dto';

@Controller('sheets')
export class SheetsController {
  constructor(private readonly sheets: GoogleSheetsService) {}

  // Проверка чтения (диагностика)
  @Get('ping')
  async ping() {
    const data = await this.sheets.readRange('Лист1!A1:C3');
    return { ok: true, sample: data };
  }

  @Post()
  async create(@Body() dto: AddUserDto) {
    const sheetName = 'Лист1';
    const now = new Date().toISOString();
    const result = await this.sheets.appendRow(sheetName, [dto.id, dto.name, dto.tgName, '', dto.enterDate]);
    console.log(result)
    return { ok: true };
  }
}