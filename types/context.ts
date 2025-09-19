import { Context as TelegrafContext } from 'telegraf';
import { PhotoSize } from 'telegraf/typings/core/types/typegram';

// Расширение типа контекста Telegraf для поддержки сессий
export interface CustomContext extends TelegrafContext {
  update: TelegrafContext['update'] & { callback_query: { data: string, from: { id: number, first_name: string, username: string } } };
  message: TelegrafContext['message'] & { text: string, photo: PhotoSize[], media_group_id?: string; };
  session: { [key: string]: any | any[] }; // Добавляем поле session с типом SessionData
}
