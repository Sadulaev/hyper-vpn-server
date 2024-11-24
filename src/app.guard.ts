import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TelegrafExecutionContext } from 'nestjs-telegraf';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { Repository } from 'typeorm';
import { CustomContext } from '../types/context';
import { UserRole } from '../enums/roles.enum';
import config from './config';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        @InjectRepository(User) private usersRepository: Repository<User>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = TelegrafExecutionContext.create(context).getContext() as CustomContext;

        if (ctx.chat.id === +config().tg.admin) {
            ctx.session.role = UserRole.Admin;
            return true;
        } else if (ctx.session.role === UserRole.Banned) {
            ctx.reply('Вы были забанены. Дальнейшие действия невозможны')
            throw new UnauthorizedException('Banned guy')
        } else {
            if (!ctx.session.role) {
                const user = await this.usersRepository.findOne({ where: { id: ctx.chat.id } }); // Fetch user from DB

                if (user) {
                    ctx.session.role = user.role;
                    return true;
                }
            }
        }

        ctx.session.role = UserRole.Unknown;
        return true;
    }
};