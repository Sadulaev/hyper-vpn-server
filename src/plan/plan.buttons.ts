import { CommonCallbacks } from "enums/callbacks.enum"
import { Markup } from "telegraf"
import { Plan } from "./plan.entity"

export const paymentStatusButtons = () => {
    return Markup.inlineKeyboard([
        Markup.button.callback('Активна', CommonCallbacks.CreatePlanWithActiveStatus),
        Markup.button.callback('Просрочена', CommonCallbacks.CreatePlanWithExpiredStatus),
        Markup.button.callback('Заморожена', CommonCallbacks.CreatePlanWithFreezedStatus),
        Markup.button.callback('Закрыта', CommonCallbacks.CreatePlanWithClosedStatus),
    ])
}

export const myClientPlansButtons = (plans: Plan[], page: number, clientId: string, userId: string) => {
    const plansButtons = plans.map((plan) =>
        Markup.button.callback(
            `👨‍💼 ${plan.title}`,
            `${CommonCallbacks.GetPlan}&id-${plan.id}`,
        ))

    const paginationButtons = [];
    if (page > 1) {
        paginationButtons.push(Markup.button.callback(
            '⬅ Предыдущая страница',
            `${CommonCallbacks.GetMyPlansOfClient}&page-${page - 1 || 1}&clientId-${clientId}&userId-${userId}`,
        ))
    }
    if (plans.length === 10) {
        paginationButtons.push(Markup.button.callback(
            'Следущая страница ➡',
            `${CommonCallbacks.GetMyPlansOfClient}&page-${page + 1}&clientId-${clientId}&userId-${userId}`,
        ))
    }

    return Markup.inlineKeyboard([...plansButtons, ...paginationButtons],
        { columns: 1 }
    );
}

export const planButtons = (planId: number ) => {
    return Markup.inlineKeyboard([
        Markup.button.callback('Посмотреть информацию о предоставившем рассрочку', `${CommonCallbacks.GetPlanCreator}&id-${planId}`)
        // Markup.button.callback('Посмотреть информацию о предоставившем рассрочку', `${CommonCallbacks.GetPlanCreator}&id-${planId}`)
    ])
}