import { Action, Ctx, InjectBot, On, Update } from 'nestjs-telegraf';
import { AdminCallbacks } from 'enums/callbacks.enum';
import { CustomContext } from 'types/context';
import { AdminService } from './admin.service';
import { Context, Telegraf } from 'telegraf';

@Update()
export class AdminUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly adminsService: AdminService,
  ) { }

  // Join requests actions
  // ---------------------
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

  @Action(new RegExp(AdminCallbacks.BanUser))
  async banUser(@Ctx() ctx: CustomContext) {
    this.adminsService.declineAndBanJoinRequest(ctx);
  }

  // Moderators actions
  // ------------------
  @Action(AdminCallbacks.ControlModerators)
  async controlModerators(@Ctx() ctx: CustomContext) {
    this.adminsService.controlModerators(ctx)
  }

  @Action(new RegExp(AdminCallbacks.GetModeratorsList))
  async getModeratorsList(@Ctx() ctx: CustomContext) {
    this.adminsService.getModeratorsList(ctx);
  }

  @Action(AdminCallbacks.FindModerator)
  async findModerator(@Ctx() ctx: CustomContext) {
    this.adminsService.beginModeratorSearch(ctx);
  }

  @Action(new RegExp(AdminCallbacks.GetModerator))
  async getModerator(@Ctx() ctx: CustomContext) {
    this.adminsService.getModerator(ctx);
  }

  @Action(new RegExp(AdminCallbacks.DegradeToUser))
  async degradeToUser(@Ctx() ctx: CustomContext) {
    this.adminsService.degradeModeratorToUser(ctx);
  }

  // Users actions
  // -------------
  @Action(AdminCallbacks.ControlUsers)
  async controlUsers(@Ctx() ctx: CustomContext) {
    this.adminsService.controlUsers(ctx)
  }

  @Action(new RegExp(AdminCallbacks.GetUsersList))
  async getUsersList(@Ctx() ctx: CustomContext) {
    this.adminsService.getUsersList(ctx);
  }

  @Action(new RegExp(AdminCallbacks.GetUser))
  async getUser(@Ctx() ctx: CustomContext) {
    this.adminsService.getUser(ctx);
  }

  @Action(new RegExp(AdminCallbacks.UpgradeToModerator))
  async upgradeUserToModerator(@Ctx() ctx: CustomContext) {
    this.adminsService.upgradeUserToModerator(ctx);
  }

  @Action(new RegExp(AdminCallbacks.FindUser))
  async beginUserSearch(@Ctx() ctx: CustomContext) {
    this.adminsService.beginUserSearch(ctx);
  }

  @Action(new RegExp(AdminCallbacks.ChangeUserSearchPage))
  async changeUserSearchPage(@Ctx() ctx: CustomContext) {
    this.adminsService.onChangeUserSearchPage(ctx);
  }

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
