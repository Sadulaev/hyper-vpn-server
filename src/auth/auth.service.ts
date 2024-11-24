import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { User } from '../user/user.entity';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { CustomContext } from 'types/context';
import {
  adminMainButtons,
  moderatorMainButtons,
  requestControlButtons,
  sendRequestButton,
  usersMainButtons,
} from 'src/auth/auth.buttons';
import { UserRole } from 'enums/roles.enum';
import requestMessage from 'messages/request.message';
import { validateName } from 'dto/name.dto';
import { validateRusPhoneNumber } from 'dto/phone.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly configService: ConfigService,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) { }

  async onStartOrReset(ctx: CustomContext, userId: number, type: 'start' | 'reset') {
    ctx.session = ctx.session.role ? {role: ctx.session.role} : {};


    this.bot.telegram.callApi('setMyCommands', {
      commands: [{ command: '/reset', description: 'Вернутся к началу' }],
    });

    const adminId = +this.configService.get<string>('tg.admin');

    const foundedUser = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (userId === adminId) {
      if(!foundedUser) {
        const adminRecord = new User();
        adminRecord.id = userId;
        adminRecord.name = 'Admin';
        adminRecord.role = UserRole.Admin;

        await this.usersRepository.save(adminRecord);
      }
      ctx.session.role = UserRole.Admin;
      ctx.reply(type === 'start' ? 'Вы админ. Выберите действия' : 'Сессия сброшена. Выберите действие', adminMainButtons());
    } else {

      if (foundedUser) {
        if (foundedUser.role === UserRole.Moderator) {
        ctx.session.role = UserRole.Moderator;
          ctx.reply(type === 'start' ? 'Вы модератор. Выберите действия' : 'Сессия сброшена. Выберите действие', moderatorMainButtons());
        }
        if (foundedUser.role === UserRole.User) {
          ctx.session.role = UserRole.User;
          ctx.reply(type === 'start' ? 'Выберите действия' : 'Сессия сброшена. Выберите действие', usersMainButtons());
        }
        if (foundedUser.role === UserRole.Unknown) {
          ctx.session.role = UserRole.Unknown;
          ctx.reply('Вы уже отправили заявку, дождитесь ответа модератора');
        }
        if (foundedUser.role === UserRole.Banned) {
          ctx.session.role = UserRole.Banned;
          ctx.reply("Вы были забанены");
        }
      } else {
        ctx.reply(
          'Вы не зарегистрированы, оставьте заявку на вступление',
          sendRequestButton(),
        );
      }
    }
  }

  async onStartJoinRequest(ctx: CustomContext) {
    ctx.session.joinRequestInfo = {
      step: 'name',
      id: null,
      name: null,
      organization: null,
      phone: null,
    };
    
    ctx.answerCbQuery();
    ctx.reply('Пожалуйста, введите ФИО');
  }

  async onFillJoinRequest(ctx: CustomContext) {
    if (ctx.session?.joinRequestInfo?.step === 'name' && !!(await validateName(ctx.message.text, ctx))) {
      ctx.session.joinRequestInfo.id = ctx.message.chat.id;
      ctx.session.joinRequestInfo.name = ctx.message.text;
      ctx.session.joinRequestInfo.step = 'organization';
      ctx.reply(
        'Пожалуйста, введите название организации в которой состоите (если её нет отправьте точку)',
      );
    } else if (ctx.session?.joinRequestInfo?.step === 'organization') {
      ctx.session.joinRequestInfo.organization =
        ctx.message.text === '.' ? null : ctx.message.text;
      ctx.session.joinRequestInfo.step = 'phone';
      ctx.reply('И последнее - введите номер телефона');
    } else if (ctx.session?.joinRequestInfo?.step === 'phone' && !!(await validateRusPhoneNumber(ctx.message.text, ctx))) {
      ctx.session.joinRequestInfo.phone = ctx.message.text;

      if (
        !ctx.session?.joinRequestInfo.id ||
        !ctx.session?.joinRequestInfo.name ||
        !ctx.session?.joinRequestInfo.phone
      ) {
        ctx.reply(
          'Произошла ошибка при подаче заявки. Пожалуйста попробуйте снова',
          sendRequestButton(),
        );
        ctx.session.joinRequestInfo = {
          step: 'name',
          id: null,
          name: null,
          phone: null,
        };
      } else {
        const requestFromDB = await this.usersRepository.findOne({
          where: { id: ctx.session.joinRequestInfo.id },
        });
        if (!!requestFromDB) {
          ctx.reply('Вы уже отправили заявку, дождитесь ответа модератора');
          ctx.session.joinRequestInfo = undefined;
        } else {
          const newUser = new User();
          newUser.id = ctx.session.joinRequestInfo.id;
          newUser.name = ctx.session.joinRequestInfo.name;
          newUser.organization = ctx.session.joinRequestInfo.organization;
          newUser.phone = ctx.session.joinRequestInfo.phone;

          const result = await this.usersRepository.save(newUser);
          const adminId = +this.configService.get<string>('tg.admin');

          this.bot.telegram.sendMessage(
            adminId,
            requestMessage(result),
            requestControlButtons(result.id),
          );

          if (result) {
            ctx.reply(
              'Заявка отправлена, дождитесь подтверждения модератором. \n\n Мы вас предупредим',
            );
            ctx.session.joinRequestInfo = undefined;
          }
        }
      }
    }
  }
}
