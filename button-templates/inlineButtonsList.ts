import { Markup } from "telegraf";
import objToCallback from "utils/objToCallback";

type ButtonType = {
    text: string;
    callback: string;
    payload?: { [key: string]: string | number };
}

export default (buttons: ButtonType[]) => {
    return Markup.inlineKeyboard(
        buttons.map(button => (
            Markup.button.callback(button.text, `${button.callback}${objToCallback(button.payload)}`)
        )),
        { columns: 1 }
    )
}