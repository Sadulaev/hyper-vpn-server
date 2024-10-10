import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { AdminService } from './admin.service';
import { AdminUpdate } from './admin.update';

@Module({
  providers: [AdminService, AdminUpdate],
  imports: [TypeOrmModule.forFeature([User])],
})
export class AdminModule {}
