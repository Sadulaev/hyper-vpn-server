import { Action, Ctx, Update } from "nestjs-telegraf";
import { CustomContext } from "types/context";
import { CommonCallbacks } from "enums/callbacks.enum";
import { Inject } from "@nestjs/common";
import { CommonService } from "./common.service";
import { UserService } from "src/user/user.service";

@Update()
export class CommonUpdate {
    constructor(
        @Inject() private commonService: CommonService,
        @Inject() private userService: UserService,
    ) {}

    // Common feature
    // -----------------------------------------------------------------------------------------------------
    @Action(CommonCallbacks.GetMenu)
    async getMenu(@Ctx() ctx: CustomContext) {
      await this.commonService.getMenu(ctx);
    }

    // User feature
    // -----------------------------------------------------------------------------------------------------
    @Action(new RegExp(CommonCallbacks.GetUserById))
    async getUserById(@Ctx() ctx: CustomContext) {
      await this.commonService.getUserInfo(ctx);
    }

    // Client feature
    // -----------------------------------------------------------------------------------------------------
    
    @Action(new RegExp(CommonCallbacks.GetClientsCreatedByMe))
    async getClientsCreatedByMe(@Ctx() ctx: CustomContext) {
        await this.commonService.getClientsCreatedByMe(ctx);
    }

    @Action(new RegExp(CommonCallbacks.GetMyActiveClients))
    async getMyActiveClients(@Ctx() ctx: CustomContext) {
        await this.commonService.getMyActiveClients(ctx);
    }

    @Action(CommonCallbacks.FindClients)
    async startClientSearch(@Ctx() ctx: CustomContext) {
        await this.commonService.onStartSearchClient(ctx);
    }

    @Action(CommonCallbacks.ChangeSearchClientPage)
    async changeSearchClientPage(@Ctx() ctx: CustomContext) {
        await this.commonService.onChangeClientSearchPage(ctx);
    }

    @Action(new RegExp(CommonCallbacks.GetClient))
    async getClientInfo(@Ctx() ctx: CustomContext) {
        await this.commonService.getClientInfo(ctx);
    }

    @Action(new RegExp(CommonCallbacks.GetClientsByUserId))
    async getClientsByUserId(@Ctx() ctx: CustomContext) {
        await this.commonService.getClientsByUserId(ctx);
    }

    @Action(new RegExp(CommonCallbacks.CreateClient)) 
    beginUserCreating (@Ctx() ctx: CustomContext) {
      this.commonService.beginClientCreating(ctx);
    }

    @Action(new RegExp(CommonCallbacks.GetClientPassportImages))
    async getClientPassportImages(@Ctx() ctx: CustomContext) {
      await this.commonService.getClientPassportImages(ctx);
    }
  

    // Plan features
    // ------------------------------------------------------------------------------------------------------

    @Action(new RegExp(CommonCallbacks.CreatePlanToClient))
    beginCreatingPlanToClient (@Ctx() ctx: CustomContext) {
      this.commonService.onStartCreatingPlan(ctx)
    }
  
    @Action(new RegExp(CommonCallbacks.GetMyPlansOfClient))
    async getMyPlansOfClient(@Ctx() ctx: CustomContext) {
      this.commonService.getClientPlans(ctx);
    }

    @Action(new RegExp(CommonCallbacks.GetAllClientPlans))
    async getAllClientPlans(@Ctx() ctx: CustomContext) {
        this.commonService.getClientPlans(ctx)
    }
  
    @Action(new RegExp(CommonCallbacks.GetPlan))
    async getPlanById(@Ctx() ctx: CustomContext) {
      this.commonService.getPlanById(ctx);
    }
  
    @Action(new RegExp(CommonCallbacks.CreatePlanWithActiveStatus))
    async createActivePlan(@Ctx() ctx: CustomContext) {
      this.commonService.onCreateActivePlan(ctx);
    }
    @Action(new RegExp(CommonCallbacks.CreatePlanWithExpiredStatus))
    async createExpiredPlan(@Ctx() ctx: CustomContext) {
      this.commonService.onCreateExpiredPlan(ctx);
    }
    @Action(new RegExp(CommonCallbacks.CreatePlanWithFreezedStatus))
    async createFreezedPlan(@Ctx() ctx: CustomContext) {
      this.commonService.onCreateFreezedPlan(ctx);
    }
    @Action(new RegExp(CommonCallbacks.CreatePlanWithClosedStatus))
    async createClosedPlan(@Ctx() ctx: CustomContext) {
      this.commonService.onCreateClosedPlan(ctx);
    }

    @Action(new RegExp(CommonCallbacks.GetMyPlans))
    async getMyPlans(@Ctx() ctx: CustomContext) {
      this.commonService.getMyPlans(ctx);
    }

    @Action(new RegExp(CommonCallbacks.GetPaymentStatusMenu))
    async getPaymentStatusMenu(@Ctx() ctx: CustomContext) {
      this.commonService.getPaymentStatusMenu(ctx);
    }

    @Action(new RegExp(CommonCallbacks.ChangePlanPaymentStatus))
    async changePlanPaymentStatus(@Ctx() ctx: CustomContext) {
      this.commonService.changePlanPaymentStatus(ctx);
    }
  
    // @Action(new RegExp(CommonCallbacks.DeletePlan))
    // async deletePlanById(@Ctx() ctx: CustomContext) {
    //   this.commonService.deletePlanById(ctx);
    // }
}