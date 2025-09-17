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
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

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
    BotModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TelegrafErrorInterceptor,
    }
  ],
})
export class AppModule { }
