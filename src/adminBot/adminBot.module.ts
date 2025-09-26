import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PaymentsModule } from "src/payments/payments.module";
import { AdminBotService } from "./adminBot.service";
import { HttpModule } from "@nestjs/axios";
import { AdminBotUpdate } from "./adminBot.update";
import { GoogleSheetsModule } from "src/integrations/google-sheets/google-sheets.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TgUsers } from "entities/tg-user.entity";
import { MessageBroadcastService } from "./message-broadcast.service";
import { BotState } from "entities/bots-state.entity";
import { BotStateModule } from "src/bot-state/bot-state.module";

@Module({
    imports: [ConfigModule, PaymentsModule, HttpModule, GoogleSheetsModule, BotStateModule, TypeOrmModule.forFeature([TgUsers, BotState])],
    providers: [AdminBotService, MessageBroadcastService, AdminBotUpdate],
})
export class AdminBotModule { }