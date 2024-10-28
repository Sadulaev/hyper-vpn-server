import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectBot } from 'nestjs-telegraf';
import { CustomContext } from 'src/types/context';
import { User } from 'src/user/user.entity';
import { Context, Telegraf } from 'telegraf';
import { Repository } from 'typeorm';
import callbackToObj from 'utils/callbackToObj';
import { banControlButtons, banslistButtons, controlModeratorsButtons, controlUsersButtons, joinRequestsButtons, moderatorslistButtons, userslistButtons } from './admin.buttons';
import { UserRole } from 'src/enums/roles.enum';
import requestMessage from 'src/messages/request.message';
import { requestControlButtons } from 'src/auth/auth.buttons';

@Injectable()
export class AdminService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) { }

  // Join requests services
  async getJoinRequests(ctx: CustomContext) {
    const params = callbackToObj(ctx.update.callback_query.data) as {
      page: string;
    };

    const usersByPagination = await this.usersRepository.find({
      where: { role: UserRole.Unknown },
      skip: (+params.page - 1) * 10,
      take: 10,
    });

    if (usersByPagination.length === 0) {
      ctx.reply('⚠ Записей не найдено')
    } else {
      ctx.reply(
        'Выберите из списка заявку',
        joinRequestsButtons(usersByPagination, +params.page),
      );
    }
  }

  async getOneJoinRequest(ctx: CustomContext) {
    const params = callbackToObj(ctx.update.callback_query.data) as {
      id: string;
    };

    const joinRequestUser = await this.usersRepository.findOne({
      where: { id: +params.id },
    });

    if (joinRequestUser) {
      ctx.reply(requestMessage(joinRequestUser), requestControlButtons(+params.id));
    } else {
      ctx.reply('Произошла ошибка. Пожалуйста попробуйте снова');
    }
  }

  async acceptJoinRequest(ctx: CustomContext) {
    const params = callbackToObj(ctx.update.callback_query.data) as {
      id: string
    }

    await this.usersRepository.update(+params.id, { role: UserRole.User })

    ctx.reply('✔ Заявка одобрена')

    this.bot.telegram.sendMessage(+params.id, 'Ваша заявка была одобрена, теперь вы можете пользоваться базой.')
  }

  async declineJoinRequest(ctx: CustomContext) {
    const params = callbackToObj(ctx.update.callback_query.data) as {
      id: string;
    }

    await this.usersRepository.delete({ id: +params.id })

    ctx.reply('❌ Заявка отклонена')

    this.bot.telegram.sendMessage(+params.id, 'Ваша заявка была отклонена, исправьте данные и попробуйта снова.')
  }

  async declineAndBanJoinRequest(ctx: CustomContext) {
    const params = callbackToObj(ctx.update.callback_query.data) as {
      id: string;
    }

    await this.usersRepository.update(+params.id, { role: UserRole.Banned })

    ctx.reply('🔒 Заявка отклонена и пользователь забанен')
  }


  // Moderators services
  async controlModerators(ctx: CustomContext) {
    ctx.reply('Выберите действие', controlModeratorsButtons())
  }


  async getModeratorsList(ctx: CustomContext) {
    const params = callbackToObj(ctx.update.callback_query.data) as {
      page: string;
    };

    const moderatorsByPagination = await this.usersRepository.find({
      where: { role: UserRole.Moderator },
      skip: (+params.page - 1) * 10,
      take: 10,
    })

    if (moderatorsByPagination.length === 0) {
      ctx.reply('⚠ Записей не найдено')
    } else {
      ctx.reply('Список модераторов', moderatorslistButtons(moderatorsByPagination, +params.page))
    }
  }


  // Users services
  async controlUsers(ctx: CustomContext) {
    ctx.reply('Выберите действие', controlUsersButtons())
  }

  async getUsersList(ctx: CustomContext) {
    const params = callbackToObj(ctx.update.callback_query.data) as {
      page: string;
    };

    const usersByPagination = await this.usersRepository.find({
      where: { role: UserRole.User },
      skip: (+params.page - 1) * 10,
      take: 10,
    })

    if (usersByPagination.length === 0) {
      ctx.reply('⚠ Записей не найдено')
    } else {
      ctx.reply('Список пользователей', userslistButtons(usersByPagination, +params.page))
    }
  }

  // Banned users services
  async getBansList(ctx: CustomContext) {
    const params = callbackToObj(ctx.update.callback_query.data) as {
      page: string;
    };

    const bansByPagination = await this.usersRepository.find({
      where: { role: UserRole.Banned },
      skip: (+params.page - 1) * 10,
      take: 10,
    })

    if (bansByPagination.length === 0) {
      ctx.reply('⚠ Записей не найдено')
    } else {
      ctx.reply('Список забаненных пользователей', banslistButtons(bansByPagination, +params.page))
    }
  }

  async getBannedUser(ctx: CustomContext) {
    const params = callbackToObj(ctx.update.callback_query.data) as {
      id: string;
    };

    const bannedUser = await this.usersRepository.findOne({
      where: { id: +params.id },
    });

    if (bannedUser) {
      ctx.reply(requestMessage(bannedUser), banControlButtons(+params.id));
    } else {
      ctx.reply('Произошла ошибка. Пожалуйста попробуйте снова');
    }
  }

  async unbanUser(ctx: CustomContext) {
    const params = callbackToObj(ctx.update.callback_query.data) as {
      id: string;
    };

    await this.usersRepository.update(+params.id, { role: UserRole.User })

    ctx.reply('🔓 Пользователь был разбанен')

    this.bot.telegram.sendMessage(+params.id, 'Вы были разбанены. Теперь у вас есть полный доступ к базе')
  }
}
