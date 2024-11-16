import { Action, Ctx, InjectBot, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { UserService } from './user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCallbacks } from 'src/enums/callbacks.enum';
import { CustomContext } from 'src/types/context';

@Update()
export class UserUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly userService: UserService,
  ) {}

  @Action(new RegExp(UserCallbacks.CreateClient)) 
  beginUserCreating (@Ctx() ctx: CustomContext) {
    this.userService.beginUserCreating(ctx);
  }
}
