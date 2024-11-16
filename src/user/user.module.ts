import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserUpdate } from './user.update';
import { UserService } from './user.service';
import { Client } from './client.entity';
import { Plan } from './plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Client, Plan])],
  providers: [UserUpdate, UserService],
  // exports: [UserModule],
})
export class UserModule {}
