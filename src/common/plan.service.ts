import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Plan } from "./plan.entity";
import { Repository } from "typeorm";
import { CustomContext } from "types/context";
import paymentStatusInfoMessage from "messages/payment-status-info.message";
import { PaymentStatus } from "enums/payment-status.enum";
import { User } from "src/user/user.entity";
import { Client } from "src/common/client.entity";
import callbackToObj from "utils/callbackToObj";
import planInfoMessage from "messages/plan-info.message";
import { CommonCallbacks } from "enums/callbacks.enum";
import inlineButtonsList from "button-templates/inlineButtonsList";
import inlineButtonsPages from "button-templates/inlineButtonsPages";

@Injectable()
export class PlanService {
    constructor(
        @InjectRepository(Plan) private planRepository: Repository<Plan>,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Client) private clientRepository: Repository<Client>,
    ) { }

    onStartCreatingPlan(ctx: CustomContext) {
        const params = callbackToObj(ctx.update.callback_query.data) as {
            clientId: string;
            userId: string;
        }

        ctx.session.createPlanInfo = {
            step: 'title',
            title: null,
            description: null,
            sum: null,
            startDate: null,
            endDate: null,
            paymentStatus: null,
            clientId: +params.clientId,
            userId: +params.userId
        }

        ctx.reply('Введите название рассрочки (указывается для удобства навигации)')
    }

    onFillCreatePlanInfo(ctx: CustomContext) {
        if (ctx.session.createPlanInfo) {
            if (ctx.session.createPlanInfo.step === 'title') {
                ctx.session.createPlanInfo.title = ctx.message.text;
                ctx.session.createPlanInfo.step = 'description';

                ctx.reply('Опишите предоставленную расрочку. Укажите товары и дополнительную информацию, если она есть')
            } else if (ctx.session.createPlanInfo.step === 'description') {
                ctx.session.createPlanInfo.description = ctx.message.text;
                ctx.session.createPlanInfo.step = 'sum';

                ctx.reply('Укажите общую сумму рассрочки')
            } else if (ctx.session.createPlanInfo.step === 'sum') {
                ctx.session.createPlanInfo.sum = ctx.message.text;
                ctx.session.createPlanInfo.step = 'startDate';

                ctx.reply('Укажите дату начала рассрочки в формате дд.мм.гггг')
            } else if (ctx.session.createPlanInfo.step === 'startDate') {
                ctx.session.createPlanInfo.startDate = ctx.message.text;
                ctx.session.createPlanInfo.step = 'endDate';

                ctx.reply('Укажите дату окончания рассрочки в формате дд.мм.гггг')
            } else if (ctx.session.createPlanInfo.step === 'endDate') {
                ctx.session.createPlanInfo.startDate = ctx.message.text;
                ctx.session.createPlanInfo.step = 'paymentStatus';

               const buttons = inlineButtonsList([
                   {text: 'Активна', callback: CommonCallbacks.CreatePlanWithActiveStatus },
                   {text: 'Просрочена', callback: CommonCallbacks.CreatePlanWithExpiredStatus},
                   {text: 'Заморожена', callback: CommonCallbacks.CreatePlanWithFreezedStatus},
                   {text: 'Закрыта', callback: CommonCallbacks.CreatePlanWithClosedStatus},
                ])

                ctx.reply(`И наконец - укажите статус платежей рассрочки\n\n${paymentStatusInfoMessage()}`, buttons)
            }
        }
    }

    async createPlan(ctx: CustomContext) {
        const newPlan = new Plan();

        newPlan.title = ctx.session.createPlanInfo.title;
        newPlan.description = ctx.session.createPlanInfo.description;
        newPlan.sum = ctx.session.createPlanInfo.sum;
        newPlan.startDate = ctx.session.createPlanInfo.startDate;
        newPlan.endDate = ctx.session.createPlanInfo.endDate;
        newPlan.paymentStatus = ctx.session.createPlanInfo.paymentStatus;

        const client = await this.clientRepository.findOne({ where: { id: +ctx.session.createPlanInfo.clientId } })
        newPlan.client = client;

        const user = await this.userRepository.findOne({ where: { id: +ctx.session.createPlanInfo.userId } })
        newPlan.user = user;

        await this.planRepository.save(newPlan);

        ctx.answerCbQuery();
        ctx.editMessageText('Рассрочка была успешно создана');
        ctx.session = {};
    }

    async onCreateActivePlan(ctx: CustomContext) {
        if (ctx.session.createPlanInfo && ctx.session.createPlanInfo.step === 'paymentStatus') {
            ctx.session.createPlanInfo.paymentStatus = PaymentStatus.Active;

            await this.createPlan(ctx);
        }
    }

    async onCreateExpiredPlan(ctx: CustomContext) {
        if (ctx.session.createPlanInfo && ctx.session.createPlanInfo.step === 'paymentStatus') {
            ctx.session.createPlanInfo.paymentStatus = PaymentStatus.Expired;

            await this.createPlan(ctx);
        }
    }

    async onCreateFreezedPlan(ctx: CustomContext) {
        if (ctx.session.createPlanInfo && ctx.session.createPlanInfo.step === 'paymentStatus') {
            ctx.session.createPlanInfo.paymentStatus = PaymentStatus.Freezed;

            await this.createPlan(ctx);
        }
    }

    async onCreateClosedPlan(ctx: CustomContext) {
        if (ctx.session.createPlanInfo && ctx.session.createPlanInfo.step === 'paymentStatus') {
            ctx.session.createPlanInfo.paymentStatus = PaymentStatus.Closed;

            await this.createPlan(ctx);
        }
    }

    async getMyPlansOfClient(ctx: CustomContext) {
        const params = callbackToObj(ctx.update.callback_query.data) as {
            page: string;
            clientId: string;
            userId: string;
        };

        const user = await this.userRepository.findOne({ where: { id: +params.userId } });
        const client = await this.clientRepository.findOne({ where: { id: +params.clientId } });

        const plansByPagination = await this.planRepository.find({
            // where: { user, client },
            skip: (+params.page - 1) * 10,
            take: 10,
        })

        if (plansByPagination.length === 0) {
            ctx.answerCbQuery();
            ctx.reply('⚠ Записей не найдено')
        } else {

            const myClientPlansButtons = inlineButtonsPages(
                plansByPagination.map(plan => (
                    { text: plan.title, callback: CommonCallbacks.GetPlan, payload: { id: plan.id } }
                )),
                { callback: CommonCallbacks.GetMyPlansOfClient, payload: { clientId: +params.clientId, userId: +params.userId }, page: +params.page, take: 10 }
            )

            ctx.answerCbQuery();
            ctx.editMessageText(`Список рассрочек для клиента - ${client.fullName}`, myClientPlansButtons)
        }
    }

    async getPlanById(ctx: CustomContext) {
        const params = callbackToObj(ctx.update.callback_query.data) as { id: string }

        const plan = await this.planRepository.findOne({ where: { id: +params.id }, relations: ['user'] })

        const buttons = inlineButtonsList([
            { text: 'Поменять статус рассрочки', callback: CommonCallbacks.ChangePlanPaymentStatus, payload: { id: plan.id } },
            { text: 'Посмотреть информацию о предоставившем рассрочку', callback: CommonCallbacks.GetPlanCreator, payload: { id: plan.id } },

        ])

        ctx.editMessageText(planInfoMessage(plan), buttons)
    }
}