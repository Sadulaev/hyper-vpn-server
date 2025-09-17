import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Markup, Telegraf } from 'telegraf';
import { CustomContext } from 'types/context';
import callbackToObj from 'utils/callbackToObj';
import { CommonCallbacks } from 'enums/callbacks.enum';
import inlineButtonsList from 'button-templates/inlineButtonsList';


import { ConfigService } from '@nestjs/config';
import getPaymentURL from 'utils/pay';
import { inlineKeyboard } from 'telegraf/typings/markup';

@Injectable()
export class BotService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly configService: ConfigService,
  ) { }

  // Common feature
  // -------------------------------------------------------------------------------------------------------
  async getMenu(ctx: CustomContext) {
    const buttons = inlineButtonsList([
      {
        text: 'Приобрести VPN',
        callback: CommonCallbacks.GetVPNSubscriptions,
      },
      // {
      //   text: '✍ Добавленные вами клиенты',
      //   callback: CommonCallbacks.GetClientsCreatedByMe,
      //   payload: { page: 1 },
      // },
      // {
      //   text: '💵 Ваши активные клиенты',
      //   callback: CommonCallbacks.GetMyActiveClients,
      //   payload: { page: 1 },
      // },
      // {
      //   text: '➕ Оформить рассрочку',
      //   callback: CommonCallbacks.CreatePlanWithClient,
      // },
      // {
      //   text: '📃 Ваши рассрочки',
      //   callback: CommonCallbacks.GetMyPlans,
      //   payload: { page: 1 },
      // },
    ]);

    ctx.reply('HyperVPN - самый быстрый на диком западе', buttons);
    // ctx.editMessageText('Меню управления клиентами и рассрочками', buttons);
  }


  async getSubscriptions(ctx: CustomContext) {
    const buttons = inlineButtonsList([
      {
        text: 'Купить на 1 месяц - 189₽',
        callback: CommonCallbacks.GetVPNKey,
        payload: { period: 1 },
      },
    ]);

    console.log(ctx)

    ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    ctx.reply('Выберите тариф:', buttons);
  }

  async getPaymentLink(ctx: CustomContext) {
    const params = callbackToObj(ctx.update.callback_query.data) as {
      perios: string;
    };

    const merchantConfig = {
      merchantLogin: this.configService.get('ROBOKASSA_MERCHANT_ID'),
      hashingAlgorithm: 'sha256',
      password1: this.configService.get('ROBOKASSA_MERCHANT_PASSWORD_1'),
      password2: this.configService.get('ROBOKASSA_MERCHANT_PASSWORD_2'),

      // OPTIONAL CONFIGURATION
      testMode: true, // Whether to use test mode globally
      resultUrlRequestMethod: 'POST' // HTTP request method selected for "ResultURL" requests

    };

    const paymentURL = await getPaymentURL({
      mrh_login: this.configService.get('ROBOKASSA_MERCHANT_ID'),
      mrh_pass1: this.configService.get('ROBOKASSA_MERCHANT_PASSWORD_1'),
      mrh_pass2: this.configService.get('ROBOKASSA_MERCHANT_PASSWORD_2'),
      inv_id: Date.now(),
      inv_desc: 'Покупка VPN',
      out_summ: '1'
    })

    const buttons = Markup.inlineKeyboard([
      {
        text: 'Оплатить',
        url: paymentURL
      },
      {
        text: 'Назад',
        callback_data: CommonCallbacks.GetVPNSubscriptions
      }
    ]);

    ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    ctx.reply(`Перейдите по ссылке для оплаты`, buttons);
  }
}
