import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BotUpdate } from "./bot.update";
import { BotService } from "./bot.service";

@Module({
    imports: [ConfigModule],
    providers: [BotUpdate, BotService],
    exports: [BotUpdate],
})
export class BotModule { }