import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TgUsers } from "entities/tg-user.entity";
import { AdminCallbacksEnum } from "enums/admin-callbacks.enum";
import { InjectBot } from "nestjs-telegraf";
import { firstValueFrom } from "rxjs";
import { GoogleSheetsService } from "src/integrations/google-sheets/google-sheets.service";
import { Context, Markup, Telegraf } from "telegraf";
import { InputFile } from "telegraf/typings/core/types/typegram";
import { Repository } from "typeorm";
import { CustomContext } from "types/context";
import { deleteLastMessageIfExist } from "utils/deleteMessage";
import { MessageBroadcastService } from "./message-broadcast.service";
import { all } from "axios";

@Injectable()
export class AdminBotService {
    constructor(
        // @InjectBot('userBot') private readonly userBot: Telegraf<Context>,
        // @InjectBot('adminBot') private readonly adminBot: Telegraf<Context>,
        @InjectRepository(TgUsers)
        private readonly repo: Repository<TgUsers>,
        private readonly sheetsService: GoogleSheetsService,
        private readonly messageBroadcastService: MessageBroadcastService,
    ) { }
    async onStart(ctx: CustomContext) {
        ctx.session.status = undefined;
        const buttons = Markup.inlineKeyboard([
            {
                text: 'Отправить сообщение всем ✉️',
                callback_data: AdminCallbacksEnum.SendMessage,
            },
            {
                text: 'Все серверы ℹ️',
                callback_data: AdminCallbacksEnum.GetServers
            },
            {
                text: 'Получить ключ 🔑',
                callback_data: AdminCallbacksEnum.GetKeys,
            },
            {
                text: 'Выключить HyperVPN бот 🔐',
                callback_data: AdminCallbacksEnum.TurnOffBot,
            },

        ], { columns: 1 });

        ctx.reply('Выбери команду', buttons)
    }

    async getMenu(ctx: CustomContext) {
        ctx.session.status = undefined;
        const buttons = Markup.inlineKeyboard([
            {
                text: 'Отправить сообщение всем ✉️',
                callback_data: AdminCallbacksEnum.SendMessage,
            },
            {
                text: 'Все серверы ℹ️',
                callback_data: AdminCallbacksEnum.GetServers
            },
            {
                text: 'Получить ключ 🔑',
                callback_data: AdminCallbacksEnum.GetKeys,
            },
            {
                text: 'Выключить HyperVPN бот 🔐',
                callback_data: AdminCallbacksEnum.TurnOffBot,
            },

        ], { columns: 1 });

        ctx.answerCbQuery();
        deleteLastMessageIfExist(ctx);
        ctx.reply('Выбери команду', buttons)
    }

    // Start message sending flow
    async onStartSendMessageToAllUsers(ctx: CustomContext) {
        ctx.session.status = 'sending_message_to_all'

        const button = Markup.inlineKeyboard([
            Markup.button.callback('Отменить ❌', AdminCallbacksEnum.GetMenu)
        ]);

        ctx.answerCbQuery();
        ctx.reply('Введите полный пост и он будет отправлен всем', button);
    }

    async sendMessageWithPhoto(ctx: CustomContext) {
        const tableIds = await this.sheetsService.getUniqueTelegramIdsFromSheet();
        const dbIds = await this.repo.find({ select: ['id'] });

        const allIds = Array.from(new Set([...tableIds, ...dbIds.map(u => u.id)]));

        // const allIds = [496437482]; // For test only

        ctx.reply('Начал отправку. Процесс уже не прервать');

        this.messageBroadcastService.broadcast(allIds, ctx.message.caption || ctx.message.text || '', {
            photo: ctx.message?.photo ? ctx.message?.photo[ctx.message?.photo?.length - 1]?.file_id : undefined,
            parseMode: 'HTML',
        });

        ctx.session.status = undefined;
        ctx.reply('Отправка завершена');
    }
}