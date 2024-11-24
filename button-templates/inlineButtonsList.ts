import { CommonCallbacks } from "enums/callbacks.enum";
import { Markup } from "telegraf";
import objToCallback from "utils/objToCallback";

type ButtonType = {
    text: string;
    callback: string;
    payload?: { [key: string]: string | number };
    hide?: boolean;
}

export default (buttons: ButtonType[]) => {
    return Markup.inlineKeyboard([
        ...buttons.filter(button => !button.hide).map(button => (
            Markup.button.callback(button.text, `${button.callback}${objToCallback(button.payload)}`)
        )),
        { text: '🏠 Вернутся к началу', callback_data: CommonCallbacks.GoToStart }],
        { columns: 1 }
    )
}