import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectBot } from 'nestjs-telegraf';
import { CustomContext } from 'types/context';
import { User } from 'src/user/user.entity';
import { Context, Telegraf } from 'telegraf';
import { ILike, Like, Repository } from 'typeorm';
import callbackToObj from 'utils/callbackToObj';
import { banControlButtons, bansListButtons, controlModeratorsButtons, controlUsersButtons, joinRequestsButtons, moderatorControlButtons, moderatorsListButtons, searchUsersListButtons, userControlButtons, usersListButtons } from './admin.buttons';
import { UserRole } from 'enums/roles.enum';
import requestMessage from 'messages/request.message';
import { requestControlButtons } from 'src/auth/auth.buttons';
import deleteLastMessage from 'utils/deleteLastMessage';
import userInfoMessage from 'messages/user-info.message';
import { AdminCallbacks } from 'enums/callbacks.enum';
import objToCallback from 'utils/objToCallback';

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
      name?: string
    };

    const moderatorsByPagination = await this.usersRepository.find({
      where: {
        name: params.name ? params.name : undefined,
        role: UserRole.Moderator
      },
      skip: (+params.page - 1) * 10,
      take: 10,
    })

    if (moderatorsByPagination.length === 0) {
      ctx.reply('⚠ Записей не найдено')
    } else {
      ctx.reply('Список модераторов', moderatorsListButtons(moderatorsByPagination, +params.page))
    }
  }

  async beginModeratorSearch(ctx: CustomContext) {
    ctx.session = {
      ...ctx.session,
      searchModeratorsByName: {
        step: 'name',
        name: null
      },
    }

    ctx.answerCbQuery();
    ctx.reply('Введите имя модератора для поиска')
  }

  async onFillModeratorSearch(ctx: CustomContext) {
    if (ctx.session.searchModeratorsByName) {
      if (ctx.session.searchModeratorsByName.step === 'name') {
        ctx.session.searchModeratorsByName.name === ctx.message.text;

        const moderatorsByPagination = await this.usersRepository.find({
          where: {
            name: Like(`%${ctx.message.text}%`),
            role: UserRole.Moderator
          },
          skip: 0,
          take: 10,
        })

        if (moderatorsByPagination.length === 0) {
          ctx.reply('⚠ Записей не найдено')
        } else {
          ctx.reply('Список найденных модераторов', moderatorsListButtons(moderatorsByPagination, 1))
        }
        
        ctx.session.searchModeratorsByName = undefined;
      }
    }
  }

  async onChangeModeratorSearchPage(ctx: CustomContext) {
    const params = callbackToObj(ctx.update.callback_query.data) as {
      page: string;
      name: string;
    }

    const moderatorsByPagination = await this.usersRepository.find({
      where: {
        name: params.name ? Like(`%${params.name}%`) : undefined,
        role: UserRole.Moderator
      },
      skip: (+params.page - 1) * 10,
      take: 10,
    })

    if (moderatorsByPagination.length === 0) {
      ctx.reply('⚠ Записей не найдено')
    } else {
      ctx.reply('Список найденных модераторов', moderatorsListButtons(moderatorsByPagination, +params.page))
    }
  }

  async banModerator(ctx: CustomContext) {
    const params = callbackToObj(ctx.update.callback_query.data) as {
      id: string;
    }

    await this.usersRepository.update(+params.id, { role: UserRole.Banned })

    ctx.reply('🔒 Модератор забанен')
  }

  async getModerator(ctx: CustomContext) {
    const params = callbackToObj(ctx.update.callback_query.data) as {
      id: string;
    };

    const user = await this.usersRepository.findOne({ where: { id: +params.id } })

    ctx.reply(userInfoMessage(user), moderatorControlButtons(user.id))
  }

  async degradeModeratorToUser(ctx: CustomContext) {
    const params = callbackToObj(ctx.update.callback_query.data) as {
      id: string;
    };

    try {
      await this.usersRepository.update(+params.id, { role: UserRole.User })

      ctx.reply('Модератор успешно переведен в пользователя')
    } catch (err) {
      ctx.reply('⚠ Ошибка обновления роли')
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
      ctx.reply('Список пользователей', usersListButtons(usersByPagination, +params.page))
    }
  }

  async beginUserSearch(ctx: CustomContext) {
    ctx.session.searchUserInfo = {
      step: 'name',
      name: null,
      organization: null,
      phone: null,
    }

    ctx.reply('Введите имя (или точку если поиск не по имени)')
  }

  async onFillSearchUserInfo(ctx: CustomContext) {
    if (ctx.session?.searchUserInfo?.step === 'name') {
      ctx.session.searchUserInfo.name = ctx.message.text;
      ctx.session.searchUserInfo.step = 'organization';

      ctx.reply('Введите организацию (или точку если поиск не по организации)')
    } else if (ctx.session?.searchUserInfo?.step === 'organization') {
      ctx.session.searchUserInfo.organization = ctx.message.text;
      ctx.session.searchUserInfo.step = 'phone';

      ctx.reply('Введите номер телефона (или точку если поиск не по телефону)')
    } else if (ctx.session?.searchUserInfo?.step === 'phone') {
      ctx.session.searchUserInfo.phone = ctx.message.text;

      const searchingObj = {
        name: ctx.session.searchUserInfo.name === '.' ? undefined : ctx.session.searchUserInfo.name,
        organization: ctx.session.searchUserInfo.organization === '.' ? undefined : ctx.session.searchUserInfo.organization,
        phone: ctx.session.searchUserInfo.phone === '.' ? undefined : ctx.session.searchUserInfo.phone,
      }

      console.log('searchingObj', searchingObj)

      const usersByPagination = await this.usersRepository.find({
        where: {
          name: searchingObj.name ? ILike(`%${searchingObj.name}%`) : undefined,
          organization: searchingObj.organization ? ILike(`%${searchingObj.organization}%`) : undefined,
          phone: searchingObj.phone ? ILike(`%${searchingObj.phone}%`) : undefined,
        },
        skip: 0,
        take: 10,
      })

      if (usersByPagination.length === 0) {
        ctx.reply('⚠ Записей не найдено')
      } else {
        ctx.reply('Список пользователей', searchUsersListButtons(
          usersByPagination, 
          1,
          objToCallback(searchingObj)))

      }

      ctx.session.searchUserInfo = undefined;
    }
  }

  async onChangeUserSearchPage(ctx: CustomContext) {
    const params = callbackToObj(ctx.update.callback_query.data) as { 
      page: string;
      name: string;
      organization: string;
      phone: string;
    }

    const searchingObj = {
      name: params.name,
      organization: params.organization,
      phone: params.phone,
    }

      const usersByPagination = await this.usersRepository.find({
        where: {
          name: params.name !== '.' ? ILike(`%${params.name}%`) : undefined,
          organization: params.organization !== '.' ? ILike(`%${params.organization}%`) : undefined,
          phone: params.phone !== '.' ? ILike(`%${params.phone}%`) : undefined,
        },
        skip: (+params.page - 1) * 10,
        take: 10,
      })

      if (usersByPagination.length === 0) {
        ctx.reply('⚠ Записей не найдено')
      } else {
        ctx.reply('Список пользователей', searchUsersListButtons(
          usersByPagination, 
          +params.page, 
          objToCallback(searchingObj)))
      }
  }

  async getUser(ctx: CustomContext) {
    const params = callbackToObj(ctx.update.callback_query.data) as {
      id: string;
    };

    const user = await this.usersRepository.findOne({ where: { id: +params.id } })

    ctx.reply(userInfoMessage(user), userControlButtons(user.id))
  }

  async upgradeUserToModerator(ctx: CustomContext) {
    const params = callbackToObj(ctx.update.callback_query.data) as {
      id: string;
    };

    try {
      await this.usersRepository.update(+params.id, { role: UserRole.Moderator })

      ctx.reply('Пользователь успешно переведен в модераторы')
    } catch (err) {
      ctx.reply('⚠ Ошибка обновления роли')
    }
  }

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
      ctx.reply('Список забаненных пользователей', bansListButtons(bansByPagination, +params.page))
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
