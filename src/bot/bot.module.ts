import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminModule } from "src/admin/admin.module";
import { AdminService } from "src/admin/admin.service";
import { AuthModule } from "src/auth/auth.module";
import { AuthService } from "src/auth/auth.service";
import { User } from "src/user/user.entity";
import { UserModule } from "src/user/user.module";
import { UserService } from "src/user/user.service";
import { BotUpdate } from "./bot.update";

@Module({
    imports: [AuthModule, AdminModule, UserModule, ConfigModule, TypeOrmModule.forFeature([User])],
    providers: [AuthService, AdminService, UserService, BotUpdate],
    exports: [BotUpdate],
})
export class BotModule { }