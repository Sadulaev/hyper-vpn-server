import { User } from 'src/user/user.entity';

export default (user: Partial<User>, forAdmin?: boolean): string => {
    return `Информация о пользователе\n\nФИО: ${user.name} \nОрганизация: ${user.organization ? user.organization : 'Отсутствует'} \nТелефон: ${user.phone}\n${forAdmin ? `Роль: ${user.role}` : ''}`;
};
