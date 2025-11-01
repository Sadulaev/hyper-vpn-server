import { Action, Ctx, InjectBot, On, Start, Update } from "nestjs-telegraf";
import { CustomContext } from "types/context";
import { AdminBotService } from "./adminBot.service";
import { AdminCallbacksEnum } from "enums/admin-callbacks.enum";
import { Context, Telegraf } from "telegraf";

@Update()
export class AdminBotUpdate {
    constructor(
        @InjectBot('adminBot') private readonly bot: Telegraf<Context>,
        private readonly adminBotService: AdminBotService
    ) { }

    @Start()
    async startCommand(@Ctx() ctx: CustomContext) {
        this.adminBotService.onStart(ctx);
    }

    @Action(AdminCallbacksEnum.GetMenu)
    async getMenu(@Ctx() ctx: CustomContext) {
        this.adminBotService.getMenu(ctx);
    }

    @On(['photo', 'text'])
    async getResponseBySessionStatus(@Ctx() ctx: CustomContext) {
        console.log(ctx.session);
        if (ctx.session.status === 'sending_message_to_all') {
            this.adminBotService.sendMessageWithPhoto(ctx);
        }
        if (ctx.session.status === 'sending_wait-for-id') {
            this.adminBotService.saveIdAndWaitForMessage(ctx);
        }
        if (ctx.session.status === 'sending_wait-for-message') {
            this.adminBotService.sendMessageById(ctx);
        }
    }

    @Action(AdminCallbacksEnum.SendMessage)
    async startSendMessageToAllUsers(@Ctx() ctx: CustomContext) {
        this.adminBotService.onStartSendMessageToAllUsers(ctx);
    }

    @Action(AdminCallbacksEnum.StartSendMessageById)
    async startSendMessageToUserById(@Ctx() ctx: CustomContext) {
        this.adminBotService.onStartMessageToOneUser(ctx);
    }

    @Action(AdminCallbacksEnum.TurnOffBot)
    async turnOffUserBot(@Ctx() ctx: CustomContext) {
        this.adminBotService.disableUserBot(ctx);
    }

    @Action(AdminCallbacksEnum.TurnOnBot)
    async turnOnUserBot(@Ctx() ctx: CustomContext) {
        this.adminBotService.enableUserBot(ctx);
    }

    @Action(AdminCallbacksEnum.GetServers)
    async getAllServers(@Ctx() ctx: CustomContext) {
        this.adminBotService.getAllServers(ctx);
    }

    @Action(AdminCallbacksEnum.OpenGenerateKeysMenu)
    async openGenerateKeysMenu(@Ctx() ctx: CustomContext) {
        this.adminBotService.openGenerateKeysMenu(ctx);
    }

    @Action(AdminCallbacksEnum.GenerateOneMonthKey)
    async generateOneMonthKey(@Ctx() ctx: CustomContext) {
        this.adminBotService.generateKey(ctx, 1);
    }

    @Action(AdminCallbacksEnum.GenerateThreeMonthKey)
    async generateThreeMonthKey(@Ctx() ctx: CustomContext) {
        this.adminBotService.generateKey(ctx, 3);
    }

    @Action(AdminCallbacksEnum.GenerateSixMonthKey)
    async generateSixMonthKey(@Ctx() ctx: CustomContext) {
        this.adminBotService.generateKey(ctx, 6);
    }

    @Action(AdminCallbacksEnum.GenerateOneYearKey)
    async generateOneYearKey(@Ctx() ctx: CustomContext) {
        this.adminBotService.generateKey(ctx, 12);
    }
}