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
import { BotState } from "entities/bots-state.entity";
import { getServersLoads } from "utils/getServersLoads";
import { BotStateService } from "src/bot-state/bot-state.service";
import { getVlessKey } from "utils/getVlessKey";

@Injectable()
export class AdminBotService {
    constructor(
        // @InjectBot('userBot') private readonly userBot: Telegraf<Context>,
        // @InjectBot('adminBot') private readonly adminBot: Telegraf<Context>,
        @InjectRepository(TgUsers)
        private readonly repo: Repository<TgUsers>,
        @InjectRepository(BotState)
        private readonly botStateRepo: Repository<BotState>,
        private readonly sheetsService: GoogleSheetsService,
        private readonly messageBroadcastService: MessageBroadcastService,
        private readonly botStateService: BotStateService,
    ) { }
    async onStart(ctx: CustomContext) {
        ctx.session.status = undefined;

        const state = await this.botStateService.getBotState('userBot');

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
                callback_data: AdminCallbacksEnum.OpenGenerateKeysMenu,
            },
            {
                text: !state.enabled ? 'Включить HyperVPN бот 🔐' : 'Выключить HyperVPN бот 🔐',
                callback_data: !state.enabled ? AdminCallbacksEnum.TurnOnBot : AdminCallbacksEnum.TurnOffBot,
            },
        ], { columns: 1 });

        ctx.reply('Выбери команду', buttons)
    }

    async getMenu(ctx: CustomContext) {
        ctx.session.status = undefined;

        const state = await this.botStateService.getBotState('userBot');

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
                text: !state.enabled ? 'Включить HyperVPN бот 🔐' : 'Выключить HyperVPN бот 🔐',
                callback_data: !state.enabled ? AdminCallbacksEnum.TurnOnBot : AdminCallbacksEnum.TurnOffBot,
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

    async disableUserBot(ctx: CustomContext) {
        const state =
            (await this.botStateRepo.findOne({ where: { name: 'userBot' } })) ??
            (await this.botStateRepo.save(
                this.botStateRepo.create({ name: 'userBot', enabled: true }),
            ));

        if (state.enabled) {
            await this.botStateRepo.update(state.id, { enabled: false })
        }

        ctx.answerCbQuery();
        ctx.reply('Бот был успешно выключен')
        this.onStart(ctx);
    }

    async enableUserBot(ctx: CustomContext) {
        const state =
            (await this.botStateRepo.findOne({ where: { name: 'userBot' } })) ??
            (await this.botStateRepo.save(
                this.botStateRepo.create({ name: 'userBot', enabled: true }),
            ));

        if (!state.enabled) {
            await this.botStateRepo.update(state.id, { enabled: true })
        }

        ctx.answerCbQuery();
        ctx.reply('Бот был успешно включен')
        this.onStart(ctx);
    }

    async getAllServers(ctx: CustomContext) {
        const loads = await getServersLoads();

        console.log(loads);

        ctx.reply(JSON.stringify(loads, null, 2));
    }

    async openGenerateKeysMenu(ctx: CustomContext) {
        const buttons = Markup.inlineKeyboard([
            {
                text: '1 месяц 🔑',
                callback_data: AdminCallbacksEnum.GenerateOneMonthKey
            },
            {
                text: '3 месяца 🔑',
                callback_data: AdminCallbacksEnum.GenerateThreeMonthKey
            },
            {
                text: '6 месяцев 🔑',
                callback_data: AdminCallbacksEnum.GenerateSixMonthKey
            },
            {
                text: '1 год 🔑',
                callback_data: AdminCallbacksEnum.GenerateOneYearKey
            },
            { text: 'Назад ⬅️', callback_data: AdminCallbacksEnum.GetMenu }
        ], { columns: 1 });

        ctx.answerCbQuery();
        deleteLastMessageIfExist(ctx);
        ctx.reply('Выбери срок действия ключа', buttons)
    }

    async generateKey(ctx: CustomContext, months: number) {
        const button = Markup.inlineKeyboard([
            { text: 'Меню', callback_data: AdminCallbacksEnum.GetMenu }
        ]);
        const key = await getVlessKey(months);

        ctx.answerCbQuery();
        deleteLastMessageIfExist(ctx);
        ctx.reply(`Сгенерирован ключ на ${months} месяц(ев):\n\n<pre>${key}</pre>`, { parse_mode: 'HTML' });
    }
}