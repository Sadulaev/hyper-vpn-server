import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentSession } from './entities/payment-session.entity';
import { PaymentsService } from './payments.service';
import { RobokassaController } from './robokassa.controller';
import { ConfigModule } from '@nestjs/config';
import { GoogleSheetsModule } from 'src/integrations/google-sheets/google-sheets.module';

@Module({
  imports: [ConfigModule, GoogleSheetsModule, TypeOrmModule.forFeature([PaymentSession])],
  providers: [PaymentsService],
  controllers: [RobokassaController],
  exports: [PaymentsService],
})
export class PaymentsModule {}