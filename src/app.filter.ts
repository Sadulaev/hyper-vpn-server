import { Catch, ArgumentsHost, ExceptionFilter, HttpException } from '@nestjs/common';
import { TelegrafException } from 'nestjs-telegraf';
import { Context } from 'telegraf';

@Catch(TelegrafException, HttpException, Error) // Обрабатываем исключения Telegraf и другие
export class TelegramExceptionFilter implements ExceptionFilter {
  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToRpc().getContext<Context>(); // Получаем контекст Telegram

    console.error('Telegram Exception:', exception);

    try {
      if (ctx && ctx.chat) {
        const chatId = ctx.chat.id;

        // Сообщение пользователю об ошибке
        await ctx.telegram.sendMessage(
          chatId,
          'Произошла ошибка при обработке вашего запроса. Попробуйте позже. 🙁',
        );
      }
    } catch (sendError) {
      console.error('Ошибка при отправке сообщения пользователю:', sendError);
    }

    // Логируем исключение для диагностики
    if (exception instanceof HttpException) {
      console.error('HTTP Exception:', exception.getResponse());
    } else {
      console.error('Unexpected Exception:', exception);
    }
  }
}