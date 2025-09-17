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
import { PaymentSession } from './payments/entities/payment-session.entity';
import { PaymentsModule } from './payments/payments.module';

const sessions = new LocalSession({ database: 'session_db.json' })

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'pages'), // Путь к папке с вашими статическими файлами
    }),
    ConfigModule.forRoot({
      load: [configuration],
    }),
    TelegrafModule.forRoot({
      middlewares: [sessions.middleware()],
      token: configuration().tg.token,
    }),
     TypeOrmModule.forRoot({
      type: 'postgres',
      host: configuration().database.host,
      port: configuration().database.port,
      username: configuration().database.username,
      password: configuration().database.password,
      database: configuration().database.database,
      entities: [PaymentSession],
      synchronize: true,
      autoLoadEntities: true,
    }),
    BotModule,
    PaymentsModule
  ],
  
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TelegrafErrorInterceptor,
    }
  ],
})
export class AppModule { }
