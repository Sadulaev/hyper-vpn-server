import { Module } from "@nestjs/common";
import { ClientService } from "../common/client.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Client } from "./client.entity";
import { User } from "src/user/user.entity";
import { CommonUpdate } from "./common.update";
import { PlanService } from "./plan.service";
import { Plan } from "./plan.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Client, User, Plan])],
    providers: [ClientService, PlanService, CommonUpdate],
})
export class CommonModule {}