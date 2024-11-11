import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import * as LocalSession from 'telegraf-session-local';
import { ConfigModule } from '@nestjs/config';
import configuration from './config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { User } from './user/user.entity';
import { AdminModule } from './admin/admin.module';
import { RolesGuard } from './app.guard';
import { AuthService } from './auth/auth.service';
import { AdminService } from './admin/admin.service';
import { UserService } from './user/user.service';
import { BotModule } from './bot/bot.module';
import { ModeratorModule } from './moderator/moderator.module';

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
    BotModule,
    AuthModule,
    AdminModule,
    ModeratorModule,
    UserModule,
    TypeOrmModule.forFeature([User])
  ],
  providers: [{ provide: 'APP_GUARD', useClass: RolesGuard }],
})
export class AppModule { }
