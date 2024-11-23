import { Client } from 'src/common/client.entity';

export default (client: Partial<Client>): string => {
    return `ФИО: ${client.fullName} \nДата рождения: ${client.birthDate ? client.birthDate : 'Не указана'} \nТелефон: ${client.phone}`;
};
