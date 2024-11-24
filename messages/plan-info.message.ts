import { PaymentStatus } from "enums/payment-status.enum";
import { Plan } from "src/common/plan.entity";

const statusText = {
    [PaymentStatus.Active]: 'Статус рассрочки: Активна',
    [PaymentStatus.Expired]: 'Статус рассрочки: Просрочена',
    [PaymentStatus.Freezed]: 'Статус рассрочки: Заморожена',
    [PaymentStatus.Closed]: 'Статус рассрочки: Закрыта'
}

export default (plan: Plan) => {
    return `Информация о рассрочке\n\nНазвание: ${plan.title} \nОписание: ${plan.description} \nСумма рассрочки: ${plan.sum} \nДата начала: ${plan.startDate} \nДата окончание: ${plan.endDate}\n${statusText[plan.paymentStatus]}`
}