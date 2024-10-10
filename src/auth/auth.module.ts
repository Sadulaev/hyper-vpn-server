import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthUpdate } from './auth.update';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User])],
  providers: [AuthService, AuthUpdate],
  exports: [AuthUpdate],
})
export class AuthModule {}
