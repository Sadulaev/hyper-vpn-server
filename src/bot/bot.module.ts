import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BotUpdate } from "./bot.update";
import { BotService } from "./bot.service";
import { PaymentsModule } from "src/payments/payments.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TgUsers } from "../../entities/tg-user.entity";

@Module({
    imports: [ConfigModule, PaymentsModule, TypeOrmModule.forFeature([TgUsers])],
    providers: [BotUpdate, BotService],
    exports: [BotUpdate],
})
export class BotModule { }