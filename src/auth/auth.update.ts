import {
  Action,
  Ctx,
  InjectBot,
  Update,
} from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { AuthService } from './auth.service';
import { CustomContext } from 'types/context';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { DefaultCallbacks } from 'enums/callbacks.enum';

@Update()
export class AuthUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) { }

  @Action(DefaultCallbacks.SendJoinRequest)
  async startJoinRequest(@Ctx() ctx: CustomContext) {
    this.authService.onStartJoinRequest(ctx);
  }
}
