import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserUpdate } from './user.update';
import { UserService } from './user.service';
import { Client } from '../common/client.entity';
import { Plan } from '../common/plan.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([User, Client, Plan]), ConfigModule],
  providers: [UserUpdate, UserService],
  // exports: [UserModule],
})
export class UserModule {}
