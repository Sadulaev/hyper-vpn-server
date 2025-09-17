import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BotUpdate } from "./bot.update";
import { BotService } from "./bot.service";
import { PaymentsModule } from "src/payments/payments.module";

@Module({
    imports: [ConfigModule, PaymentsModule],
    providers: [BotUpdate, BotService],
    exports: [BotUpdate],
})
export class BotModule { }