import { Module } from "@nestjs/common";
import { CommonService } from "./common.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Client } from "./client.entity";
import { User } from "src/user/user.entity";
import { CommonUpdate } from "./common.update";
import { Plan } from "./plan.entity";
import { UserService } from "src/user/user.service";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [TypeOrmModule.forFeature([Client, User, Plan]), ConfigModule],
    providers: [CommonService, CommonUpdate, UserService],
})
export class CommonModule {}