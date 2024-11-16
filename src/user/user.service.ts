import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './client.entity';
import { Plan } from './plan.entity';
import { CustomContext } from 'src/types/context';
import { Repository } from 'typeorm';
import saveFile from 'utils/saveFile';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { User } from './user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Client) private clientRepository: Repository<Client>,
        @InjectRepository(Plan) private planRepository: Repository<Plan>,
        @InjectBot() private readonly bot: Telegraf<Context>,
    ) { }

    beginUserCreating(ctx: CustomContext) {
        ctx.session.createClientInfo = {
            step: 'fullName',
            fullName: null,
            birthDate: null,
            images: [],
        }

        ctx.answerCbQuery();
        ctx.reply('Введите ФИО клиента (Будьте внимательны при заполнении)')
    }

    async onFillClientInfo(ctx: CustomContext) {
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
        }
    }

    async onFillClientImages(ctx: CustomContext) {
        if (ctx.session?.createClientInfo?.step === 'images') {
            console.log(1123)
            const savedImageName = await saveFile(ctx, this.bot);
            ctx.session.createClientInfo.images.push(savedImageName);

            if ((ctx.message.media_group_id && ctx.session.createClientInfo.images?.length === 2) || !ctx.message.media_group_id) {

                const creator = await this.userRepository.findOne({where: {id: ctx.message.from.id}})

                const newClient = new Client();

                newClient.fullName = ctx.session.createClientInfo.fullName;
                newClient.birthDate = ctx.session.createClientInfo.birthDate;
                newClient.phone = ctx.session.createClientInfo.phone;
                newClient.creator = creator || null;
                newClient.images = ctx.session.createClientInfo.images.length ? JSON.stringify({documents: ctx.session.createClientInfo.images}) : null;

                await this.clientRepository.save(newClient);

                ctx.session.createClientInfo = undefined;
                ctx.reply('Клиент был успешно сохранен!')
            }
        }
    }
}
