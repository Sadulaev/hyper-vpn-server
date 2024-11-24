import { Action, Ctx, InjectBot, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { UserService } from './user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonCallbacks, UserCallbacks } from 'enums/callbacks.enum';
import { CustomContext } from 'types/context';

@Update()
export class UserUpdate {
  // constructor(
  //   @InjectBot() private readonly bot: Telegraf<Context>,
  //   private readonly userService: UserService,
  //   private readonly planService: PlanService
  // ) {}
}
