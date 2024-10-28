import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TelegrafExecutionContext } from 'nestjs-telegraf';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { Repository } from 'typeorm';
import { CustomContext } from './types/context';
import { UserRole } from './enums/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        @InjectRepository(User) private usersRepository: Repository<User>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = TelegrafExecutionContext.create(context).getContext() as CustomContext;

        const user = await this.usersRepository.findOne({ where: { id: ctx.chat.id } }); // Fetch user from DB
        if (user && user.role === UserRole.Banned) {
            ctx.reply('Вы были забанены. Дальнейшие действие невозможны')
            throw new UnauthorizedException('Banned guy')
        }
        return true;
    }
}