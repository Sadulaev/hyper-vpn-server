import { plainToInstance } from 'class-transformer';
import {
    registerDecorator,
    validate,
    ValidationArguments,
    ValidationOptions,
} from 'class-validator';
import { CustomContext } from 'types/context';

export function IsRussianPhoneNumber(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isRussianPhoneNumber',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== 'string') return false;

                    // Регулярное выражение для российских номеров
                    const regex = /^(\+7|8)\d{10}$/;
                    return regex.test(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return 'Введите корректный российский номер телефона';
                },
            },
        });
    };
}

// Создаем DTO для валидации конкретного значения
class RusPhoneNumberValidationDto {
    @IsRussianPhoneNumber()
    date: string;
}

// Функция для валидации
export async function validateRusPhoneNumber(date: string, ctx: CustomContext) {
    // Оборачиваем значение в DTO-класс
    const dto = plainToInstance(RusPhoneNumberValidationDto, { date });

    // Запускаем валидацию
    const errors = await validate(dto);

    // Если ошибки есть
    if (errors.length > 0) {
        const errorMessage = errors.reduce((acc, err) => {
            return `${acc}\n${Object.values(err.constraints).join(', ')}`
        }, '');

        ctx.reply(errorMessage);
        return false;
    }

    return true;
}