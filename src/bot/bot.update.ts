import { Action, Command, Ctx, InjectBot, On, Start, Update } from "nestjs-telegraf";
import { AdminService } from "src/admin/admin.service";
import { AuthService } from "src/auth/auth.service";
import { UserRole } from "enums/roles.enum";
import { CustomContext } from "types/context";
import { UserService } from "src/user/user.service";
import { Context, Telegraf } from "telegraf";
import { CommonCallbacks } from "enums/callbacks.enum";
import { CommonService } from "src/common/common.service";

@Update()
export class BotUpdate {
    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
        private readonly adminService: AdminService,
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly commonService: CommonService,
    ) { }

    @Start()
    async startCommand(@Ctx() ctx: CustomContext) {
        this.authService.onStartOrReset(ctx, ctx.message.from.id, 'start');
    }

    @Command('reset')
    async resetSession(@Ctx() ctx: CustomContext) {
        this.authService.onStartOrReset(ctx, ctx.message.from.id, 'reset');

    }

    @Action(CommonCallbacks.GoToStart)
    async goToStart(@Ctx() ctx: CustomContext) {
        ctx.answerCbQuery();
        this.authService.onStartOrReset(ctx, ctx.from.id, 'start');
    }

    @On('text')
    async handleText(@Ctx() ctx: CustomContext) {
        if (ctx.session.role === UserRole.Admin) {
            this.adminService.onFillModeratorSearch(ctx);
            this.adminService.onFillSearchUserInfo(ctx);
            this.commonService.onFillCreatePlanInfo(ctx);
            this.commonService.onFillCreateClientInfo(ctx);
            this.commonService.onFillSearchClientInfo(ctx);
        }
        if (ctx.session.role === UserRole.Moderator) {
            this.adminService.onFillSearchUserInfo(ctx);
            this.commonService.onFillCreateClientInfo(ctx);
            this.commonService.onFillSearchClientInfo(ctx);
            this.commonService.onFillCreatePlanInfo(ctx);
        }
        if (ctx.session.role === UserRole.User) {
            this.commonService.onFillCreateClientInfo(ctx);
            this.commonService.onFillSearchClientInfo(ctx);
            this.commonService.onFillCreatePlanInfo(ctx);
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
            this.commonService.onFillClientImages(ctx);
        }
    }
}