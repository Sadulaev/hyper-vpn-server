import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminModule } from "src/admin/admin.module";
import { AdminService } from "src/admin/admin.service";
import { User } from "src/user/user.entity";
import { ModeratorUpdate } from "./moderator.update";

@Module({
    imports: [AdminModule, TypeOrmModule.forFeature([User])],
    providers: [AdminService, ModeratorUpdate],
    exports: [ModeratorModule],
})
export class ModeratorModule { }