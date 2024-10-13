import { InjectBot, Update } from "nestjs-telegraf";
import { Context, Telegraf } from "telegraf";
import { UserService } from "./user.service";

@Update()
export class UserUpdate {
    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
        private readonly userService: UserService
    ) { }
}