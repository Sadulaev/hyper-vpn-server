import { Command, Ctx, InjectBot, On, Start, Update } from "nestjs-telegraf";
import { AdminService } from "src/admin/admin.service";
import { AuthService } from "src/auth/auth.service";
import { UserRole } from "src/enums/roles.enum";
import { CustomContext } from "src/types/context";
import { UserService } from "src/user/user.service";
import { Context, Telegraf } from "telegraf";

@Update()
export class BotUpdate {
    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
        private readonly adminService: AdminService,
        private readonly authService: AuthService,
        private readonly userService: UserService,
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
            this.adminService.findModeratorByName(ctx);
            this.adminService.onSearchUser(ctx);
        }
        if (ctx.session.role === UserRole.Moderator) {
            this.adminService.onSearchUser(ctx);
        }
        if (ctx.session.role === UserRole.User) {
            // some action of user
        }
        if (ctx.session.role === UserRole.Unknown) {
            this.authService.onFillJoinRequest(ctx);
        }
    }
}