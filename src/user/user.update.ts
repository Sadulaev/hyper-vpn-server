import { Action, Ctx, InjectBot, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { UserService } from './user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonCallbacks, UserCallbacks } from 'enums/callbacks.enum';
import { CustomContext } from 'types/context';
import { PlanService } from 'src/common/plan.service';

@Update()
export class UserUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly userService: UserService,
    private readonly planService: PlanService
  ) {}

  @Action(new RegExp(CommonCallbacks.CreateClient)) 
  beginUserCreating (@Ctx() ctx: CustomContext) {
    this.userService.beginClientCreating(ctx);
  }

  @Action(new RegExp(CommonCallbacks.CreatePlanToClient))
  beginCreatingPlanToClient (@Ctx() ctx: CustomContext) {
    this.planService.onStartCreatingPlan(ctx)
  }

  @Action(new RegExp(CommonCallbacks.GetMyPlansOfClient))
  async getMyPlansOfClient(@Ctx() ctx: CustomContext) {
    this.planService.getMyPlansOfClient(ctx);
  }

  @Action(new RegExp(CommonCallbacks.GetPlan))
  async getPlanById(@Ctx() ctx: CustomContext) {
    this.planService.getPlanById(ctx);
  }

  @Action(new RegExp(CommonCallbacks.CreatePlanWithActiveStatus))
  async createActivePlan(@Ctx() ctx: CustomContext) {
    this.planService.onCreateActivePlan(ctx);
  }
  @Action(new RegExp(CommonCallbacks.CreatePlanWithExpiredStatus))
  async createExpiredPlan(@Ctx() ctx: CustomContext) {
    this.planService.onCreateExpiredPlan(ctx);
  }
  @Action(new RegExp(CommonCallbacks.CreatePlanWithFreezedStatus))
  async createFreezedPlan(@Ctx() ctx: CustomContext) {
    this.planService.onCreateFreezedPlan(ctx);
  }
  @Action(new RegExp(CommonCallbacks.CreatePlanWithClosedStatus))
  async createClosedPlan(@Ctx() ctx: CustomContext) {
    this.planService.onCreateClosedPlan(ctx);
  }

  // @Action(new RegExp(CommonCallbacks.DeletePlan))
  // async deletePlanById(@Ctx() ctx: CustomContext) {
  //   this.planService.deletePlanById(ctx);
  // }
}
