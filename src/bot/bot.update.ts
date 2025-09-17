import {
  Action,
  Command,
  Ctx,
  InjectBot,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { UserRole } from 'enums/roles.enum';
import { CustomContext } from 'types/context';
import { Context, Telegraf } from 'telegraf';
import { CommonCallbacks } from 'enums/callbacks.enum';
import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly botService: BotService
  ) { }

  @Start()
  async startCommand(@Ctx() ctx: CustomContext) {
    this.botService.getMenu(ctx);
  }

  @Command('reset')
  async resetSession(@Ctx() ctx: CustomContext) {
    this.botService.getMenu(ctx);
  }

  @Action(CommonCallbacks.GetMenu)
  async getMenu(@Ctx() ctx: CustomContext) {
    this.botService.getMenu(ctx);
  }

  @Action(CommonCallbacks.GetVPNSubscriptions)
  async getVPNSubscriptions(@Ctx() ctx: CustomContext) {
    ctx.answerCbQuery();
    this.botService.getSubscriptions(ctx);
  }

  @Action(new RegExp(CommonCallbacks.GetVPNKey))
  async buyVPN(@Ctx() ctx: CustomContext) {
    console.log('Цхьаъ хилла')
    ctx.answerCbQuery();
    this.botService.getPaymentLink(ctx);
  }
}
