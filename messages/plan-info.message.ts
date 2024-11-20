import { Plan } from "src/plan/plan.entity";

export default (plan: Plan) => {
    return `Название: ${plan.title} \nОписание: ${plan.description} \nСумма рассрочки: ${plan.sum} \nДата начала: ${plan.startDate} \nДата окончание: ${plan.endDate}`
}