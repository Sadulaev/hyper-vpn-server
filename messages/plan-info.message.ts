import { Plan } from "src/common/plan.entity";

export default (plan: Plan) => {
    return `Информация о рассрочке\n\nНазвание: ${plan.title} \nОписание: ${plan.description} \nСумма рассрочки: ${plan.sum} \nДата начала: ${plan.startDate} \nДата окончание: ${plan.endDate}`
}