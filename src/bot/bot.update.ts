import { Action, Command, Ctx, InjectBot, On, Start, Update } from "nestjs-telegraf";
import { AdminService } from "src/admin/admin.service";
import { AuthService } from "src/auth/auth.service";
import config from "src/config";
import { UserRole } from "enums/roles.enum";
import { CustomContext } from "types/context";
import { UserService } from "src/user/user.service";
import { Context, Telegraf } from "telegraf";
import { ClientService } from "src/client/client.service";
import { PlanService } from "src/plan/plan.service";

@Update()
export class BotUpdate {
    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
        private readonly adminService: AdminService,
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly clientService: ClientService,
        private readonly planService: PlanService
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
            this.clientService.onFillCreateClientInfo(ctx);
            this.clientService.onFillSearchClientInfo(ctx);
            this.planService.onFillCreatePlanInfo(ctx);
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
            this.clientService.onFillClientImages(ctx);
        }
    }
}