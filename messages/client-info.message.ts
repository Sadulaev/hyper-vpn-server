import { Client } from 'src/common/client.entity';

export default (client: Partial<Client>): string => {
    return `Информация о клиенте\n\nФИО: ${client.fullName} \nДата рождения: ${client.birthDate ? client.birthDate : 'Не указана'} \nТелефон: ${client.phone}`;
};
