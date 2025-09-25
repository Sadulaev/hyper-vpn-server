import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import * as LocalSession from 'telegraf-session-local';
import { ConfigModule } from '@nestjs/config';
import configuration from './config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotModule } from './bot/bot.module';
import { TelegrafErrorInterceptor } from './app.interceptor';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PaymentSession } from '../entities/payment-session.entity';
import { PaymentsModule } from './payments/payments.module';
import { GoogleSheetsModule } from './integrations/google-sheets/google-sheets.module';
import { AdminBotModule } from './adminBot/adminBot.module';
import { HttpService } from '@nestjs/axios';
import { TgUsers } from 'entities/tg-user.entity';

const sessions = new LocalSession({ database: 'session_db.json' })
const adminSessions = new LocalSession({ database: 'admin_session_db.json' })

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'pages'), // Путь к папке с вашими статическими файлами
    }),
    ConfigModule.forRoot({
      load: [configuration],
    }),
// Обычный бот
    TelegrafModule.forRoot({
      botName: 'userBot',
      token: configuration().tg.token, // токен основного бота
      middlewares: [sessions.middleware()],
      include: [BotModule],            // хэндлеры только из BotModule
    }),

    // Админ-бот
    TelegrafModule.forRoot({
      botName: 'adminBot',
      token: configuration().tgAmdin.token, // токен админ-бота
      middlewares: [adminSessions.middleware()],            // при необходимости — свои
      include: [AdminBotModule],            // хэндлеры только из AdminBotModule
    }),
     TypeOrmModule.forRoot({
      type: 'postgres',
      host: configuration().database.host,
      port: configuration().database.port,
      username: configuration().database.username,
      password: configuration().database.password,
      database: configuration().database.database,
      entities: [PaymentSession, TgUsers],
      synchronize: true,
      autoLoadEntities: true,
    }),
    BotModule,
    AdminBotModule,
    PaymentsModule,
    GoogleSheetsModule
  ],
  
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TelegrafErrorInterceptor,
    }
  ],
})
export class AppModule { }
