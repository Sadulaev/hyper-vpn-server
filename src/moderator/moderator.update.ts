import { Action, Ctx, Update } from "nestjs-telegraf";
import { AdminService } from "src/admin/admin.service";
import { ModeratorCallbacks } from "enums/callbacks.enum";
import { CustomContext } from "types/context";

@Update()
export class ModeratorUpdate {
    constructor(
        private readonly adminsService: AdminService,
    ) { }

    // Join requests feature
    // ---------------------
    @Action(new RegExp(ModeratorCallbacks.GetJoinRequests))
    async getJoinRequests(@Ctx() ctx: CustomContext) {
        this.adminsService.getJoinRequests(ctx);
    }

    @Action(new RegExp(ModeratorCallbacks.GetOneJoinRequest))
    async getOneJoinRequest(@Ctx() ctx: CustomContext) {
        this.adminsService.getOneJoinRequest(ctx);
    }

    @Action(new RegExp(ModeratorCallbacks.AcceptJoinRequest))
    async acceptJoinRequest(@Ctx() ctx: CustomContext) {
        this.adminsService.acceptJoinRequest(ctx);
    }

    @Action(new RegExp(ModeratorCallbacks.DeclineJoinRequest))
    async declineJoinRequest(@Ctx() ctx: CustomContext) {
        this.adminsService.declineJoinRequest(ctx);
    }

    @Action(new RegExp(ModeratorCallbacks.DeclineAndBanJoinRequest))
    async declineAndBanJoinRequest(@Ctx() ctx: CustomContext) {
        this.adminsService.declineAndBanJoinRequest(ctx);
    }

    @Action(new RegExp(ModeratorCallbacks.BanUser))
    async banUser(@Ctx() ctx: CustomContext) {
        this.adminsService.declineAndBanJoinRequest(ctx);
    }

    // Users feature
    // -------------
    @Action(ModeratorCallbacks.ControlUsers)
    async controlUsers(@Ctx() ctx: CustomContext) {
        this.adminsService.controlUsers(ctx)
    }

    @Action(new RegExp(ModeratorCallbacks.GetUsersList))
    async getUsersList(@Ctx() ctx: CustomContext) {
        this.adminsService.getUsersList(ctx);
    }

    @Action(new RegExp(ModeratorCallbacks.GetUser))
    async getUser(@Ctx() ctx: CustomContext) {
        this.adminsService.getUser(ctx);
    }


    @Action(new RegExp(ModeratorCallbacks.GetBansList))
    async getBansList(@Ctx() ctx: CustomContext) {
        this.adminsService.getBansList(ctx);
    }

    @Action(new RegExp(ModeratorCallbacks.GetBannedUser))
    async getBannedUser(@Ctx() ctx: CustomContext) {
        this.adminsService.getBannedUser(ctx);
    }

    @Action(new RegExp(ModeratorCallbacks.UnbanUser))
    async unbanUser(@Ctx() ctx: CustomContext) {
        this.adminsService.unbanUser(ctx);
    }

}