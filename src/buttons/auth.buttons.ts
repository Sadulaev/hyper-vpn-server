import { Markup } from "telegraf";

export function userAuthButtons() {
    return Markup.keyboard([
        Markup.button.callback('Авторизоваться', 'auth'),
    ])
}