import { Context as TelegrafContext } from 'telegraf';

// Расширение типа контекста Telegraf для поддержки сессий
export interface CustomContext extends TelegrafContext {
  update: TelegrafContext['update'] & { callback_query: { data: string } };
  message: TelegrafContext['message'] & { text: string };
  session: { [key: string]: any | any[] }; // Добавляем поле session с типом SessionData
}
