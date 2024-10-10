import { User } from 'src/user/user.entity';

export default (user: Partial<User>): string => {
  return `
    Новый запрос:

    ФИО: ${user.name}

    Организация: ${user.organization ? user.organization : 'Отсутствует'}

    Телефон: ${user.phone}
    `;
};
