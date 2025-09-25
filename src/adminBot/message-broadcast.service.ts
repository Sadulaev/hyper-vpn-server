// message-broadcast.service.ts
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { firstValueFrom } from 'rxjs';
import { Context, Telegraf } from 'telegraf';
import { resolvePhotoOnce } from 'utils/media';

type SendFn = (chatId: number | string) => Promise<void>;

type InputFileLike =
  | string                          // file_id или URL
  | Buffer
  | { source: Buffer | NodeJS.ReadableStream; filename?: string };

type ParseMode = 'HTML' | 'MarkdownV2' | 'Markdown';

@Injectable()
export class MessageBroadcastService {
  private readonly logger = new Logger(MessageBroadcastService.name);

  // глобальный троттлинг: не более N сообщений в секунду
  private readonly maxPerSecond = 25;
  private tokens = this.maxPerSecond;
  private readonly refillInterval = 1000; // мс
  private bucketTimer: NodeJS.Timeout;

  constructor(
    @InjectBot('userBot') private readonly userBot: Telegraf<Context>,
    private readonly http: HttpService
  ) {
    this.bucketTimer = setInterval(() => {
      this.tokens = this.maxPerSecond;
    }, this.refillInterval);
  }

  // базовая отправка (замените на sendMessage / sendDocument и т.д.)
  private async sendOne(chatId: number | string, send: SendFn) {
    let attempt = 0;
    while (attempt < 3) {
      try {
        // ожидаем токен в "ведре"
        await this.takeToken();
        await send(chatId);
        return;
      } catch (err: any) {
        const code = err?.response?.error_code;
        const desc = err?.response?.description ?? '';
        // 429: уважаем retry_after
        if (code === 429) {
          const retry = err?.response?.parameters?.retry_after ?? 1;
          this.logger.warn(`429 for ${chatId}, retry after ${retry}s`);
          await this.sleep((retry + 0.5) * 1000);
        } else if (code === 400 || code === 403) {
          // неверный chatId / бот заблокирован — дальше нет смысла
          this.logger.warn(`Permanent error ${code} for ${chatId}: ${desc}`);
          throw err;
        } else {
          // прочие — ретраим с экспоненциальной паузой
          const delay = Math.min(1000 * Math.pow(2, attempt), 10_000);
          this.logger.warn(`Error for ${chatId}: ${desc}. Retry in ${delay}ms`);
          await this.sleep(delay);
        }
      }
      attempt++;
    }
    throw new Error(`Failed to send to ${chatId} after ${attempt} attempts`);
  }

  async broadcast(
    chatIds: Array<number | string>,
    text: string,
    options?: {
      photo?: string | Buffer | { source: Buffer | NodeJS.ReadableStream; filename?: string }; // URL, file_id, Buffer, stream
      parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
      disableNotification?: boolean;
      replyMarkup?: any; // InlineKeyboardMarkup/ReplyKeyboardMarkup и т.п.
    }
  ) {
    const concurrency = 8;
    const queue = [...chatIds];
    const errors: Array<{ chatId: number | string; error: any }> = [];

    let resolvedPhoto: InputFileLike | undefined = undefined;
    if (options?.photo) {
      try {
        resolvedPhoto = await resolvePhotoOnce(options.photo);
      } catch (e) {
        // Ранний фейл лучше, чем 50k ошибок
        throw new Error(`Photo preflight failed: ${(e as Error).message}`);
      }
    }

    console.log(resolvedPhoto);

    const worker = async () => {
      while (queue.length) {
        const chatId = queue.shift()!;
        try {
          await this.sendOne(chatId, async (id) => {
            if (resolvedPhoto) {
              // Фото + подпись
              await this.userBot.telegram.sendPhoto(id, resolvedPhoto as any, {
                caption: text,
                parse_mode: options?.parseMode,
                disable_notification: options?.disableNotification,
                reply_markup: options?.replyMarkup,
              });
            } else {
              // Обычный текст
              await this.userBot.telegram.sendMessage(id, text, {
                parse_mode: options?.parseMode,
                disable_notification: options?.disableNotification,
                reply_markup: options?.replyMarkup,
              });
            }
          });
        } catch (e) {
          errors.push({ chatId, error: e });
        }
      }
    };

    await Promise.all(Array.from({ length: concurrency }, () => worker()));

    return {
      total: chatIds.length,
      failed: errors.length,
      errors,
    };
  }

  private async takeToken() {
    while (this.tokens <= 0) {
      await this.sleep(10);
    }
    this.tokens--;
  }

  private sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }
}
