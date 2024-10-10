import { Markup } from "telegraf";

export function actionButtons() {
    return Markup.inlineKeyboard([
        {
            text: 'Если тране черт нажми сюда', web_app: {
                url: 'https://www.google.com/search?q=тране+черт',
            }
        }
    ])
}