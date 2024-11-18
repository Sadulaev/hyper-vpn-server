import { CommonCallbacks } from "enums/callbacks.enum";
import { Client } from "src/user/client.entity";
import { Markup } from "telegraf";

export const clientsListButtons = (clients: Client[], page: number) => {
    const clientsButtons = clients.map((client) =>
        Markup.button.callback(
            `👨‍💼 ${client.fullName} | ${new Date(client.birthDate).toLocaleDateString()}`,
            `${CommonCallbacks.GetClient}&id-${client.id}`,
        ))

    const paginationButtons = [];
    if (page > 1) {
        paginationButtons.push(Markup.button.callback(
            '⬅ Предыдущая страница',
            `${CommonCallbacks.GetMyClients}&page-${page - 1 || 1}`,
        ))
    }
    if (clients.length === 10) {
        paginationButtons.push(Markup.button.callback(
            'Следущая страница ➡',
            `${CommonCallbacks.GetMyClients}&page-${page + 1}`,
        ))
    }

    return Markup.inlineKeyboard([...clientsButtons, ...paginationButtons],
        { columns: 1 }
    );
}

export const searchClientsList = (clients: Client[], page: number, callback: string) => {
    const clientsButtons = clients.map((client) =>
        Markup.button.callback(
            `👨‍💼 ${client.fullName} | ${new Date(client.birthDate).toLocaleDateString()}`,
            `${CommonCallbacks.GetClient}&id-${client.id}`,
        ))

    const paginationButtons = [];
    if (page > 1) {
        paginationButtons.push(Markup.button.callback(
            '⬅ Предыдущая страница',
            `${CommonCallbacks.ChangeSearchClientPage}&page-${page - 1 || 1}&${callback}`,
        ))
    }
    if (clients.length === 10) {
        paginationButtons.push(Markup.button.callback(
            'Следущая страница ➡',
            `${CommonCallbacks.ChangeSearchClientPage}&page-${page + 1}&${callback}`,
        ))
    }

    return Markup.inlineKeyboard([...clientsButtons, ...paginationButtons],
        { columns: 1 }
    );
}