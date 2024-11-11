import { Action, Ctx, InjectBot, On, Update } from 'nestjs-telegraf';
import { AdminCallbacks } from 'src/enums/callbacks.enum';
import { CustomContext } from 'src/types/context';
import { AdminService } from './admin.service';
import { Context, Telegraf } from 'telegraf';
import { Admin } from 'typeorm';
import deleteLastMessage from 'utils/deleteLastMessage';

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
    ctx.answerCbQuery();
    // deleteLastMessage(ctx, ctx.callbackQuery.message.message_id)
    this.adminsService.getJoinRequests(ctx);
  }

  @Action(new RegExp(AdminCallbacks.GetOneJoinRequest))
  async getOneJoinRequest(@Ctx() ctx: CustomContext) {
    ctx.answerCbQuery();
    // deleteLastMessage(ctx, ctx.callbackQuery.message.message_id)
    this.adminsService.getOneJoinRequest(ctx);
  }

  @Action(new RegExp(AdminCallbacks.AcceptJoinRequest))
  async acceptJoinRequest(@Ctx() ctx: CustomContext) {
    ctx.answerCbQuery();
    // deleteLastMessage(ctx, ctx.callbackQuery.message.message_id)
    this.adminsService.acceptJoinRequest(ctx);
  }

  @Action(new RegExp(AdminCallbacks.DeclineJoinRequest))
  async declineJoinRequest(@Ctx() ctx: CustomContext) {
    ctx.answerCbQuery();
    // deleteLastMessage(ctx, ctx.callbackQuery.message.message_id)
    this.adminsService.declineJoinRequest(ctx);
  }

  @Action(new RegExp(AdminCallbacks.DeclineAndBanJoinRequest))
  async declineAndBanJoinRequest(@Ctx() ctx: CustomContext) {
    ctx.answerCbQuery();
    // deleteLastMessage(ctx, ctx.callbackQuery.message.message_id)
    this.adminsService.declineAndBanJoinRequest(ctx);
  }

  @Action(new RegExp(AdminCallbacks.BanUser))
  async banUser(@Ctx() ctx: CustomContext) {
    ctx.answerCbQuery();
    // deleteLastMessage(ctx, ctx.callbackQuery.message.message_id)
    this.adminsService.declineAndBanJoinRequest(ctx);
  }

  // Moderators actions
  // ------------------
  @Action(AdminCallbacks.ControlModerators)
  async controlModerators(@Ctx() ctx: CustomContext) {
    ctx.answerCbQuery();
    // deleteLastMessage(ctx, ctx.callbackQuery.message.message_id)
    this.adminsService.controlModerators(ctx)
  }

  @Action(new RegExp(AdminCallbacks.GetModeratorsList))
  async getModeratorsList(@Ctx() ctx: CustomContext) {
    ctx.answerCbQuery();
    // deleteLastMessage(ctx, ctx.callbackQuery.message.message_id)
    this.adminsService.getModeratorsList(ctx);
  }

  @Action(AdminCallbacks.FindModerator)
  async findModerator(@Ctx() ctx: CustomContext) {
    ctx.answerCbQuery();
    // deleteLastMessage(ctx, ctx.callbackQuery.message.message_id)
    this.adminsService.beginModeratorSearch(ctx);
  }

  // Users actions
  // -------------
  @Action(AdminCallbacks.ControlUsers)
  async controlUsers(@Ctx() ctx: CustomContext) {
    ctx.answerCbQuery();
    // deleteLastMessage(ctx, ctx.callbackQuery.message.message_id)
    this.adminsService.controlUsers(ctx)
  }

  @Action(new RegExp(AdminCallbacks.GetUsersList))
  async getUsersList(@Ctx() ctx: CustomContext) {
    ctx.answerCbQuery();
    // deleteLastMessage(ctx, ctx.callbackQuery.message.message_id)
    this.adminsService.getUsersList(ctx);
  }

  @Action(new RegExp(AdminCallbacks.GetUser))
  async getUser(@Ctx() ctx: CustomContext) {
    ctx.answerCbQuery();
    // deleteLastMessage(ctx, ctx.callbackQuery.message.message_id)
    this.adminsService.getUser(ctx);
  }

  @Action(new RegExp(AdminCallbacks.UpgradeToModerator))
  async upgradeUserToModerator(@Ctx() ctx: CustomContext) {
    ctx.answerCbQuery();
    this.adminsService.upgradeUserToModerator(ctx);
  }

  @Action(new RegExp(AdminCallbacks.FindUser))
  async beginUserSearch(@Ctx() ctx: CustomContext) {
    ctx.answerCbQuery();
    this.adminsService.beginUserSearch(ctx);
  }

  @Action(new RegExp(AdminCallbacks.GetBansList))
  async getBansList(@Ctx() ctx: CustomContext) {
    ctx.answerCbQuery();
    // deleteLastMessage(ctx, ctx.callbackQuery.message.message_id)
    this.adminsService.getBansList(ctx);
  }

  @Action(new RegExp(AdminCallbacks.GetBannedUser))
  async getBannedUser(@Ctx() ctx: CustomContext) {
    ctx.answerCbQuery();
    // deleteLastMessage(ctx, ctx.callbackQuery.message.message_id)
    this.adminsService.getBannedUser(ctx);
  }

  @Action(new RegExp(AdminCallbacks.UnbanUser))
  async unbanUser(@Ctx() ctx: CustomContext) {
    ctx.answerCbQuery();
    // deleteLastMessage(ctx, ctx.callbackQuery.message.message_id)
    this.adminsService.unbanUser(ctx);
  }
}
