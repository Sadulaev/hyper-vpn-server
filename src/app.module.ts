import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import * as LocalSession from 'telegraf-session-local';
import { ConfigModule } from '@nestjs/config';
import configuration from './config';
import { AppUpdate } from './app.update';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { User } from './user/user.entity';
import { AdminModule } from './admin/admin.module';

const sessions = new LocalSession({ database: 'session_db.json' });

@Module({
  imports: [
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
      entities: [User],
      synchronize: true,
    }),
    UserModule,
    AuthModule,
    AdminModule,
  ],
  providers: [AppService, AppUpdate],
})
export class AppModule {}
