import {
  Action,
  Command,
  Ctx,
  InjectBot,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { AuthService } from './auth.service';
import { CustomContext } from 'src/types/context';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { DefaultCallbacks } from 'src/enums/callbacks.enum';

@Update()
export class AuthUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  @Start()
  async startCommand(@Ctx() ctx: CustomContext) {
    this.authService.onStart(ctx);
  }

  @Command('reset')
  async resetSession(@Ctx() ctx: CustomContext) {
    this.authService.onReset(ctx);
  }

  @Action(DefaultCallbacks.SendJoinRequest)
  async startJoinRequest(@Ctx() ctx: CustomContext) {
    this.authService.onStartJoinRequest(ctx);
  }

  @On('text')
  async fillJoinRequest(@Ctx() ctx: CustomContext) {
    this.authService.onFillJoinRequest(ctx);
  }
}
