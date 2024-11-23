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

@Injectable()
export class ClientService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Client) private clientRepository: Repository<Client>,
        @InjectBot() private readonly bot: Telegraf<Context>,
    ) { }

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

    async getMyClients(ctx: CustomContext) {
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
                    {callback: CommonCallbacks.GetMyClients, page: +params.page, take: 10}
                )

                ctx.answerCbQuery();
                ctx.editMessageText('Список клиентов', clientsListButtons)
            }
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
                        {text: `👨‍💼 ${client.fullName} | ${new Date(client.birthDate).toLocaleDateString()}`, callback: CommonCallbacks.GetClient, payload: { id: client.id}}
                    )),
                    {callback: CommonCallbacks.ChangeSearchClientPage, payload: searchingObj, page: 1, take: 10 }
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
                    {text: `👨‍💼 ${client.fullName} | ${new Date(client.birthDate).toLocaleDateString()}`, callback: CommonCallbacks.GetClient, payload: { id: client.id}}
                )),
                {callback: CommonCallbacks.ChangeSearchClientPage, payload: searchingObj, page: +params.page, take: 10 }
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
            {text: '🧑 Проверить паспортные данные клиента', callback: CommonCallbacks.GetClientPassportImages, payload: {clientId: requestedClient.id}},
            {text: '🤝 Мои рассрочки пользователя',  callback: CommonCallbacks.GetMyPlansOfClient, payload: {clientId: requestedClient.id, userId: ctx.from.id}},
            {text: '🤝 Все рассрочки пользователя', callback: CommonCallbacks.GetAllClientPlans, payload: {page: 1, clientId: requestedClient.id}},
            {text: '➕ Добавить рассрочку пользователю', callback: CommonCallbacks.CreatePlanToClient, payload: {clientId: requestedClient.id, userId: ctx.from.id}},
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
            ctx.editMessageText('Список забаненных пользователей', clientPaginationButtons)
        }
    }

}