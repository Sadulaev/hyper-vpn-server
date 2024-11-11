import { User } from 'src/user/user.entity';

export default (user: Partial<User>): string => {
    return `ФИО: ${user.name} \nОрганизация: ${user.organization ? user.organization : 'Отсутствует'} \nТелефон: ${user.phone}`;
};
