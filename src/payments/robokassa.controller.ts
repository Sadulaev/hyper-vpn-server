import { Controller, Post, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';
import { Markup, Telegraf } from 'telegraf';
import * as bodyParser from 'body-parser'; // в main.ts повесите app.use(bodyParser.urlencoded({extended:true}))
import { getVlessKey } from 'utils/getVlessKey';
import { CommonCallbacks } from 'enums/callbacks.enum';
import { GoogleSheetsService } from 'src/integrations/google-sheets/google-sheets.service';
import { formatDateToLocal } from 'utils/formatDateToLocal';

@Controller('/')
export class RobokassaController {
    private bot: Telegraf;

    constructor(
        private readonly payments: PaymentsService,
        private readonly configService: ConfigService,
        private readonly sheets: GoogleSheetsService
    ) {
        this.bot = new Telegraf(this.configService.get('TG_TOKEN')!);
    }

    @Post('payment/approve') // ResultURL (серверный)
    async result(@Req() req: any, @Res() res: any) {

        const { OutSum, InvId, SignatureValue, ...rest } = req.body;

        console.log(req.body);

        const orderId = InvId;
        if (!orderId) {
            return res.status(400).send('no order');
        }

        const sess = await this.payments.findOrderByInvId(orderId);
        if (!sess) {
            await this.bot.telegram.sendMessage(
                sess.telegramId,
                `Сняли деньги но не выдали ключ? Напишите в поддержку`,
            );

            return res.redirect('https://t.me/bekvpn_bot');
        }


        // Обновляем статус
        if (sess.status === "pending") {

            const vlessKey = await getVlessKey(sess.period);

            console.log(vlessKey)

            await this.payments.markPaidAndAddKey(orderId, vlessKey);

            const sheetName = 'Лист1';
            const now = formatDateToLocal();
            await this.sheets.appendRow(sheetName, [sess.telegramId, sess.firstName, sess.userName, '', now]);

            const buttons = Markup.inlineKeyboard([
                {
                    text: 'Инструкция установки Hyper VPN 📍',
                    callback_data: CommonCallbacks.GetInstructionsNoDelete,
                },
                {
                    text: 'Тех Поддержка ⚠️',
                    url: 'https://t.me/hyper_vpn_help'
                },
                {
                    text: '🏠 Главное меню',
                    callback_data: CommonCallbacks.GetMenuNoDelete
                },
            ], { columns: 1 });

            // Отправляем сообщение пользователю
            try {
                await this.bot.telegram.sendMessage(
                    sess.telegramId,
                    `Оплата получена. Поздравляем с успешной покупкой подписки на
HyperVPN на ${sess.period} месяц${sess.period === 1 ? '' : sess.period >= 4 ? 'ев' : 'а'}! ✅ 
 
Ваш купленный ключ (нажмите на него чтобы скопировать)

<pre>${vlessKey}</pre>

Подключите через инструкцию`,
                    { parse_mode: 'HTML', reply_markup: buttons.reply_markup }
                );
            } catch (e) {
                // логируем, но колбэк подтверждаем
                console.error('Telegram send error', e);
            }
        }

        return res.send('OK');
    }

    @Post('payment/success') // SuccessURL (редирект клиента) — можно просто валидацию + редирект на вашу страницу "успех"
    async success(@Req() req: any, @Res() res: any) {
        return res.redirect('https://t.me/bekvpn_bot');
    }

    @Post('fail') // SuccessURL (редирект клиента) — можно просто валидацию + редирект на вашу страницу "успех"
    async fail(@Req() req: any, @Res() res: any) {
        // обычно проверяют подпись с PASS1, можно просто редиректнуть на фронт
        return res.redirect('https://t.me/bekvpn_bot');
    }
}