import { Action, Ctx, InjectBot, Update } from 'nestjs-telegraf';
import { AdminCallbacks } from 'src/enums/callbacks.enum';
import { CustomContext } from 'src/types/context';
import { AdminService } from './admin.service';
import { Context, Telegraf } from 'telegraf';

@Update()
export class AdminUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly adminsService: AdminService,
  ) {}

  @Action(new RegExp(AdminCallbacks.GetJoinRequests))
  async getJoinRequests(@Ctx() ctx: CustomContext) {
    this.adminsService.getJoinRequests(ctx);
  }

  @Action(new RegExp(AdminCallbacks.GetOneJoinRequest))
  async getOneJoinRequest(@Ctx() ctx: CustomContext) {
    this.adminsService.getOneJoinRequest(ctx);
  }
}
