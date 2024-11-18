import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './client.entity';
import { Plan } from './plan.entity';
import { CustomContext } from 'types/context';
import { Repository } from 'typeorm';
import saveFile from 'utils/saveFileFromTG';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { User } from './user.entity';

@Injectable()
export class UserService {
    constructor(
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
}
