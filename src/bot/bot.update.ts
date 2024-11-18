import { Action, Command, Ctx, InjectBot, On, Start, Update } from "nestjs-telegraf";
import { AdminService } from "src/admin/admin.service";
import { AuthService } from "src/auth/auth.service";
import config from "src/config";
import { UserRole } from "enums/roles.enum";
import { CustomContext } from "types/context";
import { UserService } from "src/user/user.service";
import { Context, Telegraf } from "telegraf";
import { BotService } from "./bot.service";
import { CommonCallbacks } from "enums/callbacks.enum";

@Update()
export class BotUpdate {
    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
        private readonly adminService: AdminService,
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly botService: BotService,
    ) { }

    @Start()
    async startCommand(@Ctx() ctx: CustomContext) {
        this.authService.onStart(ctx);
    }

    @Command('reset')
    async resetSession(@Ctx() ctx: CustomContext) {
        this.authService.onReset(ctx);
    }

    @On('text')
    async handleText(@Ctx() ctx: CustomContext) {
        if (ctx.session.role === UserRole.Admin) {
            this.adminService.onFillModeratorSearch(ctx);
            this.adminService.onFillSearchUserInfo(ctx);
        }
        if (ctx.session.role === UserRole.Moderator) {
            this.adminService.onFillSearchUserInfo(ctx);
        }
        if (ctx.session.role === UserRole.User) {
            this.botService.onFillCreateClientInfo(ctx);
            this.botService.onFillSearchClientInfo(ctx);
        }
        if (ctx.session.role === UserRole.Unknown) {
            this.authService.onFillJoinRequest(ctx);
        }
    }

    @On('photo')
    async onPhoto(@Ctx() ctx: CustomContext) {
        if (
            ctx.session.role === UserRole.Admin || 
            ctx.session.role === UserRole.Moderator ||
            ctx.session.role === UserRole.User
        ) {
            this.botService.onFillClientImages(ctx);
        }
    }

    @Action(new RegExp(CommonCallbacks.GetMyClients))
    async getMyClients(@Ctx() ctx: CustomContext) {
        await this.botService.getMyClients(ctx);
    }

    @Action(CommonCallbacks.FindClients)
    async startClientSearch(@Ctx() ctx: CustomContext) {
        await this.botService.onStartSearchClient(ctx);
    }

    @Action(CommonCallbacks.ChangeSearchClientPage)
    async changeSearchClientPage(@Ctx() ctx: CustomContext) {
        await this.botService.onChangeClientSearchPage(ctx);
    }
}