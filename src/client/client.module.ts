import { Module } from "@nestjs/common";
import { ClientService } from "./client.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Client } from "./client.entity";
import { User } from "src/user/user.entity";
import { ClientUpdate } from "./client.update";

@Module({
    imports: [TypeOrmModule.forFeature([Client, User])],
    providers: [ClientService, ClientUpdate],
})
export class ClientModule {}