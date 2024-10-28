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
  ) { }

  // Join requests actions
  @Action(new RegExp(AdminCallbacks.GetJoinRequests))
  async getJoinRequests(@Ctx() ctx: CustomContext) {
    this.adminsService.getJoinRequests(ctx);
  }

  @Action(new RegExp(AdminCallbacks.GetOneJoinRequest))
  async getOneJoinRequest(@Ctx() ctx: CustomContext) {
    this.adminsService.getOneJoinRequest(ctx);
  }

  @Action(new RegExp(AdminCallbacks.AcceptJoinRequest))
  async acceptJoinRequest(@Ctx() ctx: CustomContext) {
    this.adminsService.acceptJoinRequest(ctx);
  }

  @Action(new RegExp(AdminCallbacks.DeclineJoinRequest))
  async declineJoinRequest(@Ctx() ctx: CustomContext) {
    this.adminsService.declineJoinRequest(ctx);
  }

  @Action(new RegExp(AdminCallbacks.DeclineAndBanJoinRequest))
  async declineAndBanJoinRequest(@Ctx() ctx: CustomContext) {
    this.adminsService.declineAndBanJoinRequest(ctx);
  }

  // Moderators actions
  @Action(AdminCallbacks.ControlModerators)
  async controlModerators(@Ctx() ctx: CustomContext) {
    this.adminsService.controlModerators(ctx)
  }

  @Action(new RegExp(AdminCallbacks.GetModeratorsList))
  async getModeratorsList(@Ctx() ctx: CustomContext) {
    this.adminsService.getModeratorsList(ctx);
  }

  // Users actions
  @Action(AdminCallbacks.ControlUsers)
  async controlUsers(@Ctx() ctx: CustomContext) {
    this.adminsService.controlUsers(ctx)
  }

  @Action(new RegExp(AdminCallbacks.GetUsersList))
  async getUsersList(@Ctx() ctx: CustomContext) {
    this.adminsService.getUsersList(ctx);
  }

  // Bans actions
  @Action(new RegExp(AdminCallbacks.GetBansList))
  async getBansList(@Ctx() ctx: CustomContext) {
    this.adminsService.getBansList(ctx);
  }

  @Action(new RegExp(AdminCallbacks.GetBannedUser))
  async getBannedUser(@Ctx() ctx: CustomContext) {
    this.adminsService.getBannedUser(ctx);
  }

  @Action(new RegExp(AdminCallbacks.UnbanUser))
  async unbanUser(@Ctx() ctx: CustomContext) {
    this.adminsService.unbanUser(ctx);
  }
}
