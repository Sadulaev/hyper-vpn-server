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
import { deleteLastMessageIfExist } from 'utils/deleteMessage';

@Update()
export class BotUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly botService: BotService
  ) { }

  // Default actions ---------------------------------
  @Start()
  async startCommand(@Ctx() ctx: CustomContext) {
    this.botService.onStart(ctx);
  }

  @Command('menu')
  async menuCommand(@Ctx() ctx: CustomContext) {
    this.botService.onStart(ctx);
  }

  @Action(CommonCallbacks.GetMenu)
  async getMenu(@Ctx() ctx: CustomContext) {
    this.botService.getMenu(ctx);
  }

  @Action(CommonCallbacks.GetMenuNoDelete)
  async getMenuNoDelte(@Ctx() ctx: CustomContext) {
    this.botService.getMenu(ctx, true);
  }
  // End of default actions --------------------------

  // Buy VPN actions ---------------------------------

  @Action(CommonCallbacks.GetVPNSubscriptions)
  async getVPNSubscriptions(@Ctx() ctx: CustomContext) {
    this.botService.getSubscriptions(ctx);
  }

  @Action(CommonCallbacks.GetOneMonthKey)
  async buyOneMonth(@Ctx() ctx: CustomContext) {
    this.botService.getPaymentLink(ctx, 1, 189);
  }

  @Action(CommonCallbacks.GetThreeMonthKey)
  async buyThreeMonth(@Ctx() ctx: CustomContext) {
    this.botService.getPaymentLink(ctx, 3, 449);
  }

  @Action(CommonCallbacks.GetSixMonthKey)
  async buySixMonth(@Ctx() ctx: CustomContext) {
    this.botService.getPaymentLink(ctx, 6, 699);
  }

  @Action(CommonCallbacks.GetTwelweMonthKey)
  async buyTwelwe(@Ctx() ctx: CustomContext) {
    this.botService.getPaymentLink(ctx, 12, 1499);
  }

  // End of buy VPN actions ---------------------------

  // Instructions actions -----------------------------

  @Action(CommonCallbacks.GetInstructions)
  async getInstructions(@Ctx() ctx: CustomContext) {
    this.botService.getInstructions(ctx);
  }

  @Action(CommonCallbacks.GetIphoneInstructions)
  async getIphoneInstructions(@Ctx() ctx: CustomContext) {
    this.botService.getIphoneInstructions(ctx);
  }

  @Action(CommonCallbacks.GetAndroidInstructions)
  async getAndroidInstructions(@Ctx() ctx: CustomContext) {
    this.botService.getAndroidInstructions(ctx);
  }

  @Action(CommonCallbacks.GetPCInstructions)
  async getPCInstructions(@Ctx() ctx: CustomContext) {
    this.botService.getPCInstructions(ctx);
  }

  @Action(CommonCallbacks.GetTVInstructions)
  async getTVInstructions(@Ctx() ctx: CustomContext) {
  }

  // Other actions

  @Action(CommonCallbacks.GetMyKeys)
  async getMyKeys(@Ctx()  ctx: CustomContext) {
    this.botService.getMyKeys(ctx);
  }
}
