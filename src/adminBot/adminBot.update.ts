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
            console.log('Заработало')
            this.adminBotService.sendMessageWithPhoto(ctx);
        }
    }

    @Action(AdminCallbacksEnum.SendMessage)
    async startSendMessageToAllUsers(@Ctx() ctx: CustomContext) {
        this.adminBotService.onStartSendMessageToAllUsers(ctx);
    }

}