import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserUpdate } from './user.update';
import { UserService } from './user.service';
import { Client } from '../client/client.entity';
import { Plan } from '../plan/plan.entity';
import { PlanService } from 'src/plan/plan.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Client, Plan])],
  providers: [UserUpdate, UserService, PlanService],
  // exports: [UserModule],
})
export class UserModule {}
