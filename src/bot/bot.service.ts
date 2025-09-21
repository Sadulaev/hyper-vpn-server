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
import { deleteLastMessageIfExist } from 'utils/deleteMessage';
import { PaymentsService } from 'src/payments/payments.service';
import { formatDateToLocal } from 'utils/formatDateToLocal';

@Injectable()
export class BotService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly configService: ConfigService,
    private readonly paymentsService: PaymentsService
  ) { }

  // Default actions
  // -------------------------------------------------------------------------------------------------------

  async onStart(ctx: CustomContext) {
    // this.bot.telegram.setMyCommands([{
    //   command: 'start',
    //   description: 'Старт'
    // },
    // {
    //   command: '/tech-support',
    //   description: 'Поддержка'
    // }]);


    this.bot.telegram.callApi('setMyCommands', {
      commands: [{ command: '/start', description: 'Старт' }],
    });

    const buttons = Markup.inlineKeyboard([
      {
        text: 'Приобрести VPN 🛜',
        callback_data: CommonCallbacks.GetVPNSubscriptions,
      },
      {
        text: 'Мои ключи 🔑',
        callback_data: CommonCallbacks.GetMyKeys
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
    ctx.replyWithPhoto({ source: createReadStream(filePath) }, { caption: '⚡ Hyper VPN  – быстрый и безопасный VPN, который работает на всех устройствах.', reply_markup: buttons.reply_markup });
  }

  async getMenu(ctx: CustomContext, saveMessage?: boolean) {
    const buttons = Markup.inlineKeyboard([
      {
        text: 'Приобрести VPN 🛜',
        callback_data: CommonCallbacks.GetVPNSubscriptions,
      },
      {
        text: 'Мои ключи 🔑',
        callback_data: CommonCallbacks.GetMyKeys
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

    ctx.answerCbQuery();
    if (!saveMessage) {
      deleteLastMessageIfExist(ctx);
    }
    const filePath = join(__dirname, '..', 'assets', 'hyper-vpn-menu.jpg');
    ctx.replyWithPhoto({ source: createReadStream(filePath) }, { caption: '⚡ Hyper VPN  – быстрый и безопасный VPN, который работает на всех устройствах.', reply_markup: buttons.reply_markup });
    // ctx.editMessageText('Меню управления клиентами и рассрочками', buttons);
  }

  // End of default actions -----------------------------------------------------------------------------------

  // Buy VPN actions ------------------------------------------------------------------------------------------

  async getSubscriptions(ctx: CustomContext) {
    const buttons = Markup.inlineKeyboard([
      {
        text: '1 месяц - 189₽',
        callback_data: CommonCallbacks.GetOneMonthKey,
      },
      {
        text: '3 месяца - 449₽',
        callback_data: CommonCallbacks.GetThreeMonthKey,
      },
      {
        text: '6 месяцев - 699₽',
        callback_data: CommonCallbacks.GetSixMonthKey,
      },
      {
        text: '12 месяцев - 1499₽',
        callback_data: CommonCallbacks.GetTwelweMonthKey,
      },
      {
        text: '⬅️ Назад',
        callback_data: CommonCallbacks.GetMenu
      },
    ], { columns: 1 });

    const replyText = `1️⃣ Выбери нужный тариф ниже👇🏻
2️⃣ Произведи оплату
3️⃣ Установи VPN на свое устройство 

❗️После оплаты выдадим приложение, которое доступно для установки на Iphone, Android, ПК, TV

💡Доступ выдается на телефон, компьютер, планшет и телевизор`

    ctx.answerCbQuery();
    deleteLastMessageIfExist(ctx);
    const filePath = join(__dirname, '..', 'assets', 'hyper-vpn-subscriptions.jpg');
    ctx.replyWithPhoto({ source: createReadStream(filePath) }, { caption: replyText, reply_markup: buttons.reply_markup });
  }

  async getPaymentLink(ctx: CustomContext, period: number, sum: number) {

    let filePath: string;

    if (period === 3) {
      filePath = join(__dirname, '..', 'assets', 'hyper-vpn-three-m.jpg');
    } else if (period === 6) {
      filePath = join(__dirname, '..', 'assets', 'hyper-vpn-six-m.jpg');
    } else if (period === 12) {
      filePath = join(__dirname, '..', 'assets', 'hyper-vpn-twelwe-m.jpg');
    } else {
      filePath = join(__dirname, '..', 'assets', 'hyper-vpn-one-m.jpg');
    }

    const session = await this.paymentsService.createSession({
      telegramId: ctx.update.callback_query.from.id.toString(),
      ttlMinutes: 30,
      period,
      firstName: ctx.update.callback_query.from.first_name?.toString(),
      userName: ctx.update.callback_query.from.username?.toString()
    });

    const paymentURL = await getPaymentURL({
      mrh_login: this.configService.get('ROBOKASSA_MERCHANT_ID'),
      mrh_pass1: this.configService.get('ROBOKASSA_MERCHANT_PASSWORD_1'),
      mrh_pass2: this.configService.get('ROBOKASSA_MERCHANT_PASSWORD_2'),
      inv_id: Number(session.invId),
      inv_desc: '123',
      out_summ: sum.toString(),
      shp_order: session.id,
    })

    const buttons = Markup.inlineKeyboard([
      {
        text: ' 💳 Оплатить',
        url: paymentURL
      },
      {
        text: '⬅️ Назад',
        callback_data: CommonCallbacks.GetVPNSubscriptions
      }
    ]);

    ctx.answerCbQuery();
    deleteLastMessageIfExist(ctx);
    await ctx.replyWithPhoto(
      { source: createReadStream(filePath) },
      {
        caption: 'Перейдите по ссылке для оплаты',
        reply_markup: buttons.reply_markup,
      }
    )
  }
  // End of buy VPN actions --------------------------------------------------------------------------

  // Get Instructions actions ------------------------------------------------------------------------
  async getInstructions(ctx: CustomContext, saveMessage?: boolean) {

    const buttons = Markup.inlineKeyboard([
      {
        text: 'Установка на IPhone ',
        callback_data: CommonCallbacks.GetIphoneInstructions,
      },
      {
        text: 'Установка на Android 🤖',
        callback_data: CommonCallbacks.GetAndroidInstructions,
      },
      {
        text: 'Установка на Компьютер 💻',
        callback_data: CommonCallbacks.GetPCInstructions,
      },
      {
        text: 'Установка на TV 📺',
        callback_data: CommonCallbacks.GetTVInstructions,
      },
      {
        text: '⬅️ Назад',
        callback_data: CommonCallbacks.GetMenu
      },
    ], { columns: 1 });

    const caption = `📋 Инструкции по использованию вашей подписки:

1. 📱 Скачайте приложение для вашего устройства:

   -  Для iPhone: <a href="https://apps.apple.com/ru/app/v2raytun/id6476628951">V2RayTun</a>
   - Для Android: <a href="https://play.google.com/store/apps/details?id=com.v2raytun.android&hl=ru">V2RayTun</a>
   - 💻 Для Компьютера: <a href="https://hiddify.com">Hiddify Next</a>
   - 📺 Для TV:  <a href="https://play.google.com/store/apps/details?id=com.vpn4tv.hiddify">VPN4TV</a>

2. 🔑 Скопируйте предоставленную ссылку, которую вы получили ранее.

3. 📲 Откройте приложение и нажмите на плюсик сверху справа.

4. 📋 Выберите 'Вставить из буфера обмена' для добавления подписки.

💬 Если у вас возникнут вопросы, не стесняйтесь обращаться в поддержку <a href="https://t.me/hyper_vpn_help">@hyper_vpn_help</a>`;


    ctx.answerCbQuery();
    if (!saveMessage) {
      deleteLastMessageIfExist(ctx);
    }
    const filePath = join(__dirname, '..', 'assets', 'hyper-vpn-instructions.jpg');

    await ctx.replyWithPhoto(
      { source: createReadStream(filePath) },
      {
        caption,
        parse_mode: 'HTML',
        reply_markup: buttons.reply_markup,
      }
    );
  }

  async getPCInstructions(ctx: CustomContext) {

    const buttons = Markup.inlineKeyboard([
      {
        text: '🏠 Главное меню',
        callback_data: CommonCallbacks.GetInstructions
      },
      {
        text: '⬅️ Назад',
        callback_data: CommonCallbacks.GetInstructions
      },
    ], { columns: 1 });
    const caption = `💻 <b>Инструкция по подключению на ПК (Windows)</b>

🔑 <b>1.</b> Купите ключ.

📦 <b>2.</b> Скачайте приложение Hiddify Next:
👉 для загрузки:
<a href="https://hiddify.com">Скачать Hiddify для Windows (.msix файл)</a>

🛠 <b>3.</b> Установите приложение:
Откройте скачанный файл. Если система запросит разрешение — нажмите «Установить».

🖥️ <b>4.</b> Скопируйте купленный ключ и в приложении справа наверху нажмите «+» <i>Новый профиль</i>, затем «<i>Добавить из буфера обмена</i>».

🌐 <b>5.</b> Нажмите «Подключиться (Connect)» — VPN активируется и начнёт работать.`;


    ctx.answerCbQuery();
    deleteLastMessageIfExist(ctx);
    const filePath = join(__dirname, '..', 'assets', 'hyper-vpn-instructions.jpg');

    await ctx.replyWithPhoto(
      { source: createReadStream(filePath) },
      {
        caption,
        parse_mode: 'HTML',
        reply_markup: buttons.reply_markup,
      }
    );
  }

  async getAndroidInstructions(ctx: CustomContext) {

    const buttons = Markup.inlineKeyboard([
      {
        text: '🏠 Главное меню',
        callback_data: CommonCallbacks.GetInstructions
      },
      {
        text: '⬅️ Назад',
        callback_data: CommonCallbacks.GetInstructions
      },
    ], { columns: 1 });

    const caption = `🤖 <b>Инструкция по подключению на Android</b>

🔑 <b>1.</b> Купите ключ.

📦 <b>2.</b> Установите приложение V2RayTun:
👉 чтобы открыть Google Play:
<a href="https://play.google.com/store/apps/details?id=com.v2ray.tun">V2RayTun в Google Play</a>

📲 <b>3.</b> После установки скопируйте ваш купленный ключ и вставьте в приложение, нажав справа наверху плюс — «<i>Добавить из буфера</i>».

⚙️ <b>4.</b> При первом запуске приложение запросит разрешение на создание VPN-соединения — подтвердите.

▶️ <b>5.</b> Нажмите на кнопку для подключения в центре экрана — VPN начнёт работать.`;


    ctx.answerCbQuery();
    deleteLastMessageIfExist(ctx);
    const filePath = join(__dirname, '..', 'assets', 'hyper-vpn-instructions.jpg');

    await ctx.replyWithPhoto(
      { source: createReadStream(filePath) },
      {
        caption,
        parse_mode: 'HTML',
        reply_markup: buttons.reply_markup,
      }
    );
  }

  async getIphoneInstructions(ctx: CustomContext) {

    const buttons = Markup.inlineKeyboard([
      {
        text: '🏠 Главное меню',
        callback_data: CommonCallbacks.GetInstructions
      },
      {
        text: '⬅️ Назад',
        callback_data: CommonCallbacks.GetInstructions
      },
    ], { columns: 1 });

    const caption = ` <b>Инструкция по подключению на iPhone</b>

🔑 <b>1.</b> Купите ключ.

📦 <b>2.</b> Скачайте приложение V2RayTun:
👉 открыть App Store и установить:
<a href="https://apps.apple.com/ru/app/v2raytun/id6476628951">V2RayTun в App Store</a>

📲 <b>3.</b> После установки скопируйте ваш купленный ключ и вставьте в приложение, нажав справа наверху плюс — «<i>Добавить из буфера</i>».

⚙️ <b>4.</b> При первом запуске приложение запросит разрешение на создание VPN-соединения — подтвердите.

▶️ <b>5.</b> Нажмите на кнопку включения в центре экрана — VPN начнёт работать.`;


    ctx.answerCbQuery();
    deleteLastMessageIfExist(ctx);
    const filePath = join(__dirname, '..', 'assets', 'hyper-vpn-instructions.jpg');

    await ctx.replyWithPhoto(
      { source: createReadStream(filePath) },
      {
        caption,
        parse_mode: 'HTML',
        reply_markup: buttons.reply_markup,
      }
    );
  }

  // Other actions
  async getMyKeys(ctx: CustomContext) {
    const myRecords = await this.paymentsService.getPaidAndNotExpiredKeysByTgId(ctx.update.callback_query.from.id.toString())

    const buttons = Markup.inlineKeyboard([
      {
        text: '⬅️ Назад',
        callback_data: CommonCallbacks.GetMenu
      },
    ], { columns: 1 });

    const message = !myRecords.length ? `<b>У вас нет активных ключей</b>

Если вы купили ключ и он не появился пожалуйста напишите в поддержку 

<a href="https://t.me/hyper_vpn_help">@hyper_vpn_help</a>`

      :

      `<b>Ваши активные ключи</b>
    ${myRecords.map((record, index) => `

<b><i>Ключ ${index + 1}</i></b>
<pre>${record.vlessKey}</pre>
Дата создания - ${formatDateToLocal(record.createdAt, true)}

Будет действовать до - ${formatDateToLocal(record.keyExpiresAt, true)}`)}`

  ctx.answerCbQuery();
  deleteLastMessageIfExist(ctx);
  ctx.reply(message, {parse_mode: 'HTML', reply_markup: buttons.reply_markup});
  }

}