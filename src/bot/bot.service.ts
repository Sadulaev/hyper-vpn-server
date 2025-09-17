import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Markup, Telegraf } from 'telegraf';
import { CustomContext } from 'types/context';
import callbackToObj from 'utils/callbackToObj';
import { CommonCallbacks } from 'enums/callbacks.enum';
import inlineButtonsList from 'button-templates/inlineButtonsList';


import { ConfigService } from '@nestjs/config';
import getPaymentURL from 'utils/getPaymentURL';
import { createReadStream } from 'fs';
import { join } from 'path';

@Injectable()
export class BotService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly configService: ConfigService,
  ) { }

  // Common feature
  // -------------------------------------------------------------------------------------------------------
  async getMenu(ctx: CustomContext) {
    const buttons = Markup.inlineKeyboard([
      {
        text: 'Приобрести VPN 🛜',
        callback_data: CommonCallbacks.GetVPNSubscriptions,
      },
      {
        text: 'Инструкция установки Hyper VPN 📍',
        callback_data: CommonCallbacks.GetInstructions,
      },
      {
        text: 'Тех Поддержка ⚠️',
        url: 'https://t.me/hyper_vpn_help'
      }
    ], { columns: 1 });

    const filePath = join(__dirname, '..', 'assets', 'hyper-vpn-menu.jpg');
    ctx.replyWithPhoto({ source: createReadStream(filePath) }, { caption: 'HyperVPN - самый быстрый на диком западе', reply_markup: buttons.reply_markup });
    // ctx.editMessageText('Меню управления клиентами и рассрочками', buttons);
  }


  async getSubscriptions(ctx: CustomContext) {
    const buttons = Markup.inlineKeyboard([
      {
        text: 'Купить на 1 месяц - 189₽',
        callback_data: CommonCallbacks.GetVPNKey,
      },
      {
        text: 'Купить на 3 месяца - 449₽',
        callback_data: CommonCallbacks.GetVPNKey,
      },
      {
        text: 'Купить на 6 месяцев - 699₽',
        callback_data: CommonCallbacks.GetVPNKey,
      },
      {
        text: 'Купить на 12 месяцев - 1499₽',
        callback_data: CommonCallbacks.GetVPNKey,
      },
      {
        text: 'Назад',
        callback_data: CommonCallbacks.GetMenu
      },
    ], { columns: 1 });

    const replyText = `1️⃣ Выбери нужный тариф ниже👇🏻
2️⃣ Произведи оплату
3️⃣ Установи VPN на свое устройство 

❗️После оплаты выдадим приложение, которое доступно для установки на Iphone, Android, ПК, TV

💡Доступ выдается на телефон, компьютер, планшет и телевизор`

    ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    const filePath = join(__dirname, '..', 'assets', 'hyper-vpn-subscriptions.jpg');
    ctx.replyWithPhoto({ source: createReadStream(filePath) }, { caption: 'Выберите тариф', reply_markup: buttons.reply_markup });
  }

  async getPaymentLink(ctx: CustomContext) {
    const params = callbackToObj(ctx.update.callback_query.data) as {
      period: string;
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
