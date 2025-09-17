import { Controller, Post, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import * as bodyParser from 'body-parser'; // в main.ts повесите app.use(bodyParser.urlencoded({extended:true}))

@Controller('robokassa')
export class RobokassaController {
    private bot: Telegraf;

    constructor(
        private readonly payments: PaymentsService,
        private readonly configService: ConfigService,
    ) {
        this.bot = new Telegraf(this.configService.get('TG_TOKEN')!);
    }

    @Post('result') // ResultURL (серверный)
    async result(@Req() req: any, @Res() res: any) {
        const { OutSum, InvId, SignatureValue, ...rest } = req.body;

        // Вытащим все shp_*
        const shp: Record<string, string> = {};
        for (const k of Object.keys(rest)) {
            if (k.startsWith('shp_')) shp[k] = String(rest[k]);
        }

        const pass2 = this.configService.get('ROBOKASSA_MERCHANT_PASSWORD_2')!;
        const ok = this.payments.verifySignature(String(OutSum), String(InvId), String(SignatureValue), pass2, shp);

        if (!ok) {
            return res.status(400).send('bad signature');
        }

        const orderId = shp['shp_order'];
        if (!orderId) {
            return res.status(400).send('no order');
        }

        const sess = await this.payments.findByOrder(orderId);
        if (!sess) return res.send('OK'); // идемпотентность, ничего не делаем

        // Обновляем статус
        await this.payments.markPaidByOrder(orderId);

        // Отправляем сообщение пользователю
        try {
            await this.bot.telegram.sendMessage(
                sess.telegramId,
                `✅ Оплата получена. Заказ ${orderId} активирован. Спасибо!`,
            );
        } catch (e) {
            // логируем, но колбэк подтверждаем
            console.error('Telegram send error', e);
        }

        // Robokassa ожидает простой "OK" (или "OK{InvId}" — по вашему договору)
        return res.send('OK');
    }

    @Post('success') // SuccessURL (редирект клиента) — можно просто валидацию + редирект на вашу страницу "успех"
    async success(@Req() req: any, @Res() res: any) {
        // обычно проверяют подпись с PASS1, можно просто редиректнуть на фронт
        return res.redirect('https://t.me/bekvpn_bot');
    }

    @Post('fail') // SuccessURL (редирект клиента) — можно просто валидацию + редирект на вашу страницу "успех"
    async fail(@Req() req: any, @Res() res: any) {
        // обычно проверяют подпись с PASS1, можно просто редиректнуть на фронт
        return res.redirect('https://t.me/bekvpn_bot');
    }
}