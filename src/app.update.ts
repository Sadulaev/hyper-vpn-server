import { InjectBot, Update } from 'nestjs-telegraf';
import { Telegraf, Context } from 'telegraf';

@Update()
export class AppUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
  ) { }
}
