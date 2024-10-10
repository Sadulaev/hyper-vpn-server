import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectBot } from 'nestjs-telegraf';
import { CustomContext } from 'src/types/context';
import { User } from 'src/user/user.entity';
import { Context, Telegraf } from 'telegraf';
import { Repository } from 'typeorm';
import callbackToObj from 'utils/callbackToObj';
import { joinRequestsButtons } from './admin.buttons';
import { UserRole } from 'src/enums/roles.enum';
import requestMessage from 'src/messages/request.message';
import { requestControlButtons } from 'src/auth/main.buttons';

@Injectable()
export class AdminService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async getJoinRequests(ctx: CustomContext) {
    const params = callbackToObj(ctx.update.callback_query.data) as {
      page: string;
    };

    console.log(params);

    const usersByPagination = await this.usersRepository.find({
      where: { role: UserRole.Unknown },
      skip: (+params.page - 1) * 10,
      take: 10,
    });

    ctx.reply(
      'Выберите из списка заявку',
      joinRequestsButtons(usersByPagination, +params.page),
    );
  }

  async getOneJoinRequest(ctx: CustomContext) {
    const params = callbackToObj(ctx.update.callback_query.data) as {
      id: string;
    };

    console.log(params);

    const joinRequestUser = await this.usersRepository.findOne({
      where: { id: +params.id },
    });

    if (joinRequestUser) {
      ctx.reply(requestMessage(joinRequestUser), requestControlButtons());
    } else {
      ctx.reply('Произошла ошибка. Пожалуйста попробуйте снова');
    }
  }
}
