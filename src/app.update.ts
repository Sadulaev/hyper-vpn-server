import { InjectBot, Update } from 'nestjs-telegraf';
import { Telegraf, Context } from 'telegraf';
import { AppService } from './app.service';

@Update()
export class AppUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly appService: AppService,
  ) {}
}
