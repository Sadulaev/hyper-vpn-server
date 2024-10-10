import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { User } from '../user/user.entity';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { CustomContext } from 'src/types/context';
import {
  adminMainButtons,
  moderatorMainButtons,
  requestControlButtons,
  sendRequestButton,
  usersMainButtons,
} from 'src/auth/main.buttons';
import { UserRole } from 'src/enums/roles.enum';
import requestMessage from 'src/messages/request.message';

@Injectable()
export class AuthService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly configService: ConfigService,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async onStart(ctx: CustomContext) {
    ctx.session = {};

    this.bot.telegram.callApi('setMyCommands', {
      commands: [{ command: '/reset', description: 'Сбросить сессию' }],
    });

    const adminId = +this.configService.get<string>('tg.admin');

    if (ctx.message.chat.id === adminId) {
      ctx.reply('Вы админ. Выберите действия', adminMainButtons());
    } else {
      const foundedUser = await this.usersRepository.findOne({
        where: { id: ctx.message.chat.id },
      });

      if (foundedUser) {
        if (foundedUser.role === UserRole.Moderator) {
          ctx.reply('Вы модератор. Выберите действия', moderatorMainButtons());
        }
        if (foundedUser.role === UserRole.User) {
          ctx.reply('Выберите действия', usersMainButtons());
        }
        if (foundedUser.role === UserRole.Unknown) {
          ctx.reply('Вы уже отправили заявку, дождитесь ответа модератора');
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
    ctx.reply('Пожалуйста, введите ФИО');
  }

  async onFillJoinRequest(ctx: CustomContext) {
    if (ctx.session?.joinRequestInfo?.step === 'name') {
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
    } else if (ctx.session?.joinRequestInfo?.step === 'phone') {
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
            requestControlButtons(),
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

  async onReset(ctx: CustomContext) {
    const adminId = +this.configService.get<string>('tg.admin');

    if (ctx.message.chat.id === adminId) {
      ctx.reply('Сессия сброшена. Выберите действие', adminMainButtons());
    } else {
      const foundedUser = await this.usersRepository.findOne({
        where: { id: ctx.message.chat.id },
      });

      if (foundedUser) {
        if (foundedUser.role === UserRole.Moderator) {
          ctx.reply(
            'Сессия сброшена. Выберите действие',
            moderatorMainButtons(),
          );
        }
        if (foundedUser.role === UserRole.User) {
          ctx.reply('Сессия сброшена. Выберите действие', usersMainButtons());
        }
        if (foundedUser.role === UserRole.Unknown) {
          ctx.reply('Ваша заявка на рассмотрении, дождитесь ответа модератора');
        }
      } else {
        ctx.reply(
          'Вы не зарегистрированы, оставьте заявку на вступление',
          sendRequestButton(),
        );
      }
    }
  }
}
