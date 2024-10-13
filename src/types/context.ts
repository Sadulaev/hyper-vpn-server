import { Context as TelegrafContext } from 'telegraf';
import { SessionData } from './session';

// Расширение типа контекста Telegraf для поддержки сессий
export interface CustomContext extends TelegrafContext {
    session: SessionData;  // Добавляем поле session с типом SessionData
}