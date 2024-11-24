import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectBot } from "nestjs-telegraf";
import config from "src/config";
import { Client } from "./client.entity";
import { User } from "src/user/user.entity";
import { Context, Telegraf } from "telegraf";
import { ILike, Repository } from "typeorm";
import { CustomContext } from "types/context";
import callbackToObj from "utils/callbackToObj";
import saveFileFromTG from "utils/saveFileFromTG";
import clientInfoMessage from "messages/client-info.message";
import inlineButtonsPages from "button-templates/inlineButtonsPages";
import { CommonCallbacks } from "enums/callbacks.enum";
import inlineButtonsList from "button-templates/inlineButtonsList";
import planInfoMessage from "messages/plan-info.message";
import { Plan } from "./plan.entity";
import { PaymentStatus } from "enums/payment-status.enum";
import paymentStatusInfoMessage from "messages/payment-status-info.message";
import { ConfigService } from "@nestjs/config";
import userInfoMessage from "messages/user-info.message";
import { join } from 'path';
import * as path from 'path';
import { MediaGroup } from "telegraf/typings/telegram-types";

@Injectable()
export class CommonService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Client) private clientRepository: Repository<Client>,
        @InjectRepository(Plan) private planRepository: Repository<Plan>,
        @InjectBot() private readonly bot: Telegraf<Context>,
        private readonly configService: ConfigService,
    ) { }

    // Common feature
    // -------------------------------------------------------------------------------------------------------
    async getMenu(ctx: CustomContext) {
        const buttons = inlineButtonsList([
            { text: '🔍 Поиск клиента по базе', callback: CommonCallbacks.FindClients },
            { text: '✍ Добавленные вами клиенты', callback: CommonCallbacks.GetClientsCreatedByMe, payload: { page: 1 } },
            { text: '💵 Ваши активные клиенты', callback: CommonCallbacks.GetMyActiveClients, payload: { page: 1 } },
            { text: '➕ Добавить клиента', callback: CommonCallbacks.CreateClient },
            { text: '📃 Ваши рассрочки', callback: CommonCallbacks.GetMyPlans, payload: { page: 1 } }
        ])

        ctx.answerCbQuery();
        ctx.editMessageText('Меню управления клиентами и рассрочками', buttons)
    }

    // User features
    // -------------------------------------------------------------------------------------------------------
    async getUserInfo(ctx: CustomContext) {
        const params = callbackToObj(ctx.update.callback_query.data) as { id: string };

        const user = await this.userRepository.findOne({ where: { id: +params.id } });

        ctx.answerCbQuery();
        ctx.reply(userInfoMessage(user, false));
    }

    // Client features
    // -------------------------------------------------------------------------------------------------------

    beginClientCreating(ctx: CustomContext) {
        ctx.session.createClientInfo = {
            step: 'fullName',
            fullName: null,
            birthDate: null,
            images: [],
        }

        ctx.answerCbQuery();
        ctx.reply('Введите ФИО клиента (Будьте внимательны при заполнении)')
    }

    async onFillCreateClientInfo(ctx: CustomContext) {
        if (ctx.session?.createClientInfo) {
            if (ctx.session?.createClientInfo?.step === 'fullName') {
                ctx.session.createClientInfo.fullName = ctx.message.text;
                ctx.session.createClientInfo.step = 'birthDate';

                ctx.reply('Введите дату рождения клиента (Будьте внимательны при заполнении)')
            } else if (ctx.session?.createClientInfo?.step === 'birthDate') {
                ctx.session.createClientInfo.birthDate = ctx.message.text;
                ctx.session.createClientInfo.step = 'phone'

                ctx.reply('Введите номер телефона клиента или точку если хотите пропустить (Будьте внимательны при заполнении)')
            } else if (ctx.session?.createClientInfo?.step === 'phone') {
                ctx.session.createClientInfo.phone = ctx.message.text === '.' ? null : ctx.message.text;
                ctx.session.createClientInfo.step = 'images';

                ctx.reply('Отправьте фото паспорта или точку если хотите пропустить')
            } else if (ctx.session?.createClientInfo?.step === 'images' && !ctx.message.photo) {
                const creator = await this.userRepository.findOne({ where: { id: ctx.message.from.id } })

                const newClient = new Client();

                newClient.fullName = ctx.session.createClientInfo.fullName;
                newClient.birthDate = ctx.session.createClientInfo.birthDate;
                newClient.phone = ctx.session.createClientInfo.phone;
                newClient.user = creator || null;

                await this.clientRepository.save(newClient);

                ctx.session.createClientInfo = undefined;
                ctx.reply('Клиент был успешно сохранен!')
            }
        }
    }

    async onFillClientImages(ctx: CustomContext) {
        if (ctx.session?.createClientInfo?.step === 'images') {
            const savedImageName = await saveFileFromTG(ctx, this.bot);
            ctx.session.createClientInfo.images.push(savedImageName);

            if ((ctx.message.media_group_id && ctx.session.createClientInfo.images?.length === 2) || !ctx.message.media_group_id) {

                const creator = await this.userRepository.findOne({ where: { id: ctx.message.from.id } })

                const newClient = new Client();

                newClient.fullName = ctx.session.createClientInfo.fullName;
                newClient.birthDate = ctx.session.createClientInfo.birthDate;
                newClient.phone = ctx.session.createClientInfo.phone;
                newClient.user = creator || null;
                newClient.images = ctx.session.createClientInfo.images.length ? JSON.stringify({ documents: ctx.session.createClientInfo.images }) : null;

                await this.clientRepository.save(newClient);

                ctx.session.createClientInfo = undefined;
                ctx.reply('Клиент был успешно сохранен!')
            }
        }
    }

    async getClientsCreatedByMe(ctx: CustomContext) {
        const params = callbackToObj(ctx.update.callback_query.data) as {
            page: string;
        };


        const user = await this.userRepository.findOne({ where: { id: ctx.callbackQuery.from.id } })

        if ((!user && ctx.callbackQuery.from.id === +config().tg.admin) || user) {
            const clientsPagination = await this.clientRepository.find({
                where: { user: user },
                skip: (+params.page - 1) * 10,
                take: 10,
            })

            if (clientsPagination.length === 0) {
                ctx.answerCbQuery();
                ctx.reply('⚠ Записей не найдено')
            } else {

                const clientsListButtons = inlineButtonsPages(
                    clientsPagination.map(client => (
                        { text: `👨‍💼 ${client.fullName} | ${new Date(client.birthDate).toLocaleDateString()}`, callback: CommonCallbacks.GetClient, payload: { id: client.id } }
                    )),
                    { callback: CommonCallbacks.GetClientsCreatedByMe, page: +params.page, take: 10 }
                )

                ctx.answerCbQuery();
                ctx.editMessageText('Список клиентов', clientsListButtons)
            }
        }
    }

    async getMyActiveClients(ctx: CustomContext) {
        const params = callbackToObj(ctx.update.callback_query.data) as { page: string };

        const clientsPagination = await this.clientRepository
            .createQueryBuilder('client')
            .innerJoin('client.plans', 'plan') // Связываем Client с Plan
            .innerJoin('plan.user', 'user')   // Связываем Plan с User
            .where('user.id = :userId', { userId: ctx.from.id }) // Условие по userId
            .take(10)
            .skip((+params.page - 1) * 10)
            .getMany();

            if (clientsPagination.length === 0) {
                ctx.answerCbQuery();
                ctx.reply('⚠ Записей не найдено')
            } else {

                const clientsListButtons = inlineButtonsPages(
                    clientsPagination.map(client => (
                        { text: `👨‍💼 ${client.fullName} | ${new Date(client.birthDate).toLocaleDateString()}`, callback: CommonCallbacks.GetClient, payload: { id: client.id } }
                    )),
                    { callback: CommonCallbacks.GetMyActiveClients, page: +params.page, take: 10 }
                )

                ctx.answerCbQuery();
                ctx.editMessageText('Список клиентов', clientsListButtons)
            }
    }

    async onStartSearchClient(ctx: CustomContext) {
        ctx.session.searchClientInfo = {
            step: 'fullName',
            fullName: null,
            phone: null,
        }

        ctx.answerCbQuery();
        ctx.reply('Введите ФИО пользователя для поиска (или точку если ищете по номеру телефона)')
    }

    async onFillSearchClientInfo(ctx: CustomContext) {
        if (ctx.session?.searchClientInfo?.step === 'fullName') {
            ctx.session.searchClientInfo.fullName = ctx.message.text;
            ctx.session.searchClientInfo.step = 'phone';

            ctx.reply('Введите номер телефона (или точку если хотите пропустить)')
        } else if (ctx.session?.searchClientInfo?.step === 'phone') {
            ctx.session.searchClientInfo.phone = ctx.message.text;

            const searchingObj = {
                fullName: ctx.session.searchClientInfo.fullName !== '.' ? ctx.session.searchClientInfo.fullName : undefined,
                phone: ctx.session.searchClientInfo.phone !== '.' ? ctx.session.searchClientInfo.phone : undefined,
            }

            console.log(searchingObj)

            const clientsPagination = await this.clientRepository.find({
                where: {
                    fullName: searchingObj.fullName ? ILike(`%${searchingObj.fullName}%`) : undefined,
                    phone: searchingObj.phone ? ILike(`%${searchingObj.phone}%`) : undefined,
                },
                skip: 0,
                take: 10,
            })

            if (clientsPagination.length === 0) {
                ctx.reply('⚠ Записей не найдено')
            } else {
                const searchClientsList = inlineButtonsPages(
                    clientsPagination.map(client => (
                        { text: `👨‍💼 ${client.fullName} | ${new Date(client.birthDate).toLocaleDateString()}`, callback: CommonCallbacks.GetClient, payload: { id: client.id } }
                    )),
                    { callback: CommonCallbacks.ChangeSearchClientPage, payload: searchingObj, page: 1, take: 10 }
                )

                ctx.reply('Список пользователей', searchClientsList)
            }

            ctx.session.searchClientInfo = undefined;
        }
    }

    async onChangeClientSearchPage(ctx: CustomContext) {
        const params = callbackToObj(ctx.update.callback_query.data) as {
            page: string,
            fullName: string;
            phone: string;
        }

        const searchingObj = {
            fullName: params.fullName,
            phone: params.phone,
        }

        const clientsPagination = await this.clientRepository.find({
            where: {
                fullName: searchingObj.fullName ? ILike(`%${searchingObj.fullName}%`) : undefined,
                phone: searchingObj.phone ? ILike(`%${searchingObj.phone}%`) : undefined,
            },
            skip: (+params.page - 1) * 10,
            take: 10,
        })

        if (clientsPagination.length === 0) {
            ctx.answerCbQuery();
            ctx.reply('⚠ Записей не найдено')
        } else {

            const searchClientsList = inlineButtonsPages(
                clientsPagination.map(client => (
                    { text: `👨‍💼 ${client.fullName} | ${new Date(client.birthDate).toLocaleDateString()}`, callback: CommonCallbacks.GetClient, payload: { id: client.id } }
                )),
                { callback: CommonCallbacks.ChangeSearchClientPage, payload: searchingObj, page: +params.page, take: 10 }
            )

            ctx.answerCbQuery();
            ctx.reply('Список пользователей', searchClientsList)
        }
    }

    async getClientInfo(ctx: CustomContext) {
        const params = callbackToObj(ctx.update.callback_query.data) as {
            id: string;
        }

        const requestedClient = await this.clientRepository.findOne({
            where: { id: +params.id }
        })

        const clientControlButtons = inlineButtonsList([
            { text: '🧑 Проверить паспортные данные клиента', callback: CommonCallbacks.GetClientPassportImages, payload: { clientId: requestedClient.id } },
            { text: '🤝 Мои рассрочки пользователя', callback: CommonCallbacks.GetMyPlansOfClient, payload: { page: 1, clientId: requestedClient.id, userId: ctx.from.id } },
            { text: '🤝 Все рассрочки пользователя', callback: CommonCallbacks.GetAllClientPlans, payload: { page: 1, clientId: requestedClient.id } },
            { text: '➕ Добавить рассрочку пользователю', callback: CommonCallbacks.CreatePlanToClient, payload: { clientId: requestedClient.id, userId: ctx.from.id } },
        ])

        ctx.answerCbQuery();
        ctx.editMessageText(clientInfoMessage(requestedClient), clientControlButtons)
    }


    async getClientsByUserId(ctx: CustomContext) {
        const params = callbackToObj(ctx.update.callback_query.data) as {
            id: string;
            page: string;
        }

        const user = await this.userRepository.findOne({ where: { id: +params.id } })

        const clientsPagination = await this.clientRepository.find({ where: { user } })

        if (clientsPagination.length === 0) {
            ctx.answerCbQuery();
            ctx.reply('⚠ Записей не найдено')
        } else {

            const clientPaginationButtons = inlineButtonsPages(
                clientsPagination.map(client => (
                    { text: client.fullName, callback: CommonCallbacks.GetClient, payload: { id: client.id } }
                )),
                {
                    callback: CommonCallbacks.GetClientsByUserId,
                    payload: { id: +params.id },
                    page: +params.page,
                    take: 10
                }
            )

            ctx.answerCbQuery();
            ctx.editMessageText(`Список клиентов пользователя - ${user.name}`, clientPaginationButtons)
        }
    }

    async getClientPassportImages(ctx: CustomContext) {
        try {
            const params = callbackToObj(ctx.update.callback_query.data) as { clientId: string };

            const client = await this.clientRepository.findOne({ where: { id: +params.clientId } });

            const documentImages = JSON.parse(client.images) as { documents: string[] };

            const saveDirectory = path.join(process.cwd(), 'uploads');

            const mediaGroup: MediaGroup = documentImages.documents.map(fileName => ({
                type: 'photo',
                media: { source: join(saveDirectory, fileName) }
            }))

            ctx.answerCbQuery();
            await ctx.replyWithMediaGroup(mediaGroup);
        } catch (error) {
            await ctx.reply('Произошла ошибка при отправке изображений.');
        }

    }

    // Plan features
    // ------------------------------------------------------------------------------------------------------
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
                    { text: 'Активна', callback: CommonCallbacks.CreatePlanWithActiveStatus },
                    { text: 'Просрочена', callback: CommonCallbacks.CreatePlanWithExpiredStatus },
                    { text: 'Заморожена', callback: CommonCallbacks.CreatePlanWithFreezedStatus },
                    { text: 'Закрыта', callback: CommonCallbacks.CreatePlanWithClosedStatus },
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

    async getClientPlans(ctx: CustomContext) {
        const params = callbackToObj(ctx.update.callback_query.data) as {
            page: string;
            clientId: string;
            userId?: string;
        };

        console.log('get client params', params)

        const user = params.userId ? await this.userRepository.findOne({ where: { id: +params.userId } }) : undefined;
        const client = params.clientId ? await this.clientRepository.findOne({ where: { id: +params.clientId } }) : undefined;

        const plansByPagination = await this.planRepository.find({
            where: {
                user: user ? { id: user.id } : undefined,
                client: client ? { id: client.id } : undefined
            },
            skip: (+params.page - 1) * 10,
            take: 10,
        })

        if (plansByPagination.length === 0) {
            ctx.answerCbQuery();
            ctx.reply('⚠ Записей не найдено')
        } else {

            const clientPlansButtons = inlineButtonsPages(
                plansByPagination.map(plan => (
                    { text: plan.title, callback: CommonCallbacks.GetPlan, payload: { id: plan.id } }
                )),
                { callback: CommonCallbacks.GetMyPlansOfClient, payload: { clientId: +params.clientId, userId: +params.userId }, page: +params.page, take: 10 }
            )

            ctx.answerCbQuery();
            ctx.editMessageText(`Список рассрочек для клиента - ${client.fullName}`, clientPlansButtons)
        }
    }

    async getPlanById(ctx: CustomContext) {
        const params = callbackToObj(ctx.update.callback_query.data) as { id: string }

        const plan = await this.planRepository.findOne({ where: { id: +params.id }, relations: ['user'] })

        const isMyClientsPlan = ctx.from.id === plan.user.id;
        const isEditable = (ctx.from.id === +this.configService.get<string>('tg.admin')) || isMyClientsPlan;

        const buttons = inlineButtonsList([
            { text: 'Поменять статус рассрочки', callback: CommonCallbacks.ChangePlanPaymentStatus, payload: { id: plan.id }, hide: !isEditable },
            { text: 'Посмотреть информацию о предоставившем рассрочку', callback: CommonCallbacks.GetUserById, payload: { id: plan.user.id }, hide: isMyClientsPlan },

        ])

        ctx.editMessageText(planInfoMessage(plan), buttons)
    }

    async getMyPlans(ctx: CustomContext) {
        const params = callbackToObj(ctx.update.callback_query.data) as { page: string };

        const plansByPagination = await this.planRepository.find({
            where: {
                user: { id: ctx.from.id },
            },
            skip: (+params.page - 1) * 10,
            take: 10,
        })

        if (plansByPagination.length === 0) {
            ctx.answerCbQuery();
            ctx.reply('⚠ Записей не найдено')
        } else {

            const clientPlansButtons = inlineButtonsPages(
                plansByPagination.map(plan => (
                    { text: plan.title, callback: CommonCallbacks.GetPlan, payload: { id: plan.id } }
                )),
                { callback: CommonCallbacks.GetMyPlans, page: +params.page, take: 10 }
            )

            ctx.answerCbQuery();
            ctx.editMessageText(`Ваши рассрочки`, clientPlansButtons)
        }
    }

}