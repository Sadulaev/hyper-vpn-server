import { InjectBot, Start, Update } from "nestjs-telegraf";
import { Telegraf, Context } from "telegraf";
import { AppService } from "./app.service";
import { actionButtons } from "./app.buttons";

@Update()
export class AppUpdate {
    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
        private readonly appService: AppService) { }
}