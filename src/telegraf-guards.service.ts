import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegrafGuardsService implements OnModuleInit {
  private readonly logger = new Logger('Telegraf');

  constructor(
    @InjectBot('userBot') private readonly userBot: Telegraf,
  ) {}

  onModuleInit() {
    [this.userBot].forEach((bot) =>
      bot.catch((err: any, ctx) => {
        const code = err?.response?.error_code ?? err?.statusCode;
        const desc = err?.response?.description ?? err?.message ?? String(err);
        this.logger.warn(`Update error [${code}] on ${ctx.updateType}: ${desc}`);
      }),
    );
  }
}