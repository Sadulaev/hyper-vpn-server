import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BotUpdate } from "./bot.update";
import { BotService } from "./bot.service";
import { PaymentsModule } from "src/payments/payments.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TgUsers } from "../../entities/tg-user.entity";
import { BotState } from "entities/bots-state.entity";
import { TelegrafModule } from "nestjs-telegraf";
import { BotStateService } from "src/bot-state/bot-state.service";
import configuration from '../config';
import { BotStateModule } from "src/bot-state/bot-state.module";
import { GoogleSheetsModule } from "src/integrations/google-sheets/google-sheets.module";
import { TelegrafGuardsService } from "src/telegraf-guards.service";


@Module({
    imports: [
        ConfigModule,
        PaymentsModule,
        GoogleSheetsModule,
        TypeOrmModule.forFeature([TgUsers, BotState]),
        TelegrafModule.forRootAsync({
            botName: 'userBot',
            // ВАЖНО: эти imports относятся к контексту TelegrafCoreModule
            imports: [BotStateModule, ConfigModule],
            inject: [BotStateService, ConfigService],
            useFactory: (state: BotStateService, config: ConfigService) => ({
                token: config.get<string>('TG_TOKEN')!,
                middlewares: [
                    async (ctx, next) => ((await state.isEnabled('userBot')) ? next() : undefined),
                ],
            }),
        }),
    ],
    providers: [BotUpdate, BotService, TelegrafGuardsService],
    exports: [BotUpdate],
})
export class BotModule { }