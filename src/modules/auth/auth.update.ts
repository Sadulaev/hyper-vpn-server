import { Ctx, InjectBot, On, Start, Update } from "nestjs-telegraf";
import { Context, Telegraf } from "telegraf";
import { AuthService } from "./auth.service";
import { Roles } from "src/decorators/roles.decorator";
import { UserRole } from "enums/roles.enum";
import { CustomContext } from "types/context";
import { ConfigService } from "@nestjs/config";

@Update()
export class AuthUpdate {
    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) { }

    @Start()
    @Roles(UserRole.User)
    async startCommand(@Ctx() ctx: CustomContext) {
        const adminId = this.configService.get<string>('tg.admin');

        console.log(ctx)
    }

    @On('text')
    async textCallback(@Ctx() ctx: CustomContext) {
        console.log(ctx)
    }
}