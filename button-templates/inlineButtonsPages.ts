import { Markup } from "telegraf";
import objToCallback from "utils/objToCallback";

type ButtonType = {
    text: string;
    callback: string;
    payload: { [key: string]: string | number };
}

type PaginationType = {
    callback: string;
    payload?: { [key: string]: string | number };
    page: number;
    take: number;
}

export default (buttons: ButtonType[], pagination: PaginationType) => {
    const itemsButtons = buttons.map(button => (
        Markup.button.callback(button.text, `${button.callback}${objToCallback(button.payload)}`)
    ))

    const paginationButtons = []
    if (pagination.page > 1) {
        paginationButtons.push(Markup.button.callback(
            '⬅ Предыдущая страница',
            `${pagination.callback}&page-${pagination.page - 1}${objToCallback(pagination.payload)}`
        ))
    }
    if (buttons.length === pagination.take) {
        paginationButtons.push(Markup.button.callback(
            'Следущая страница ➡',
            `${pagination.callback}&page-${pagination.page + 1}${objToCallback(pagination.payload)}`
        )
        );
    }

    return Markup.inlineKeyboard([...itemsButtons, ...paginationButtons], {columns: 1})
}