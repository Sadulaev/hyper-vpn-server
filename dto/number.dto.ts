import { plainToInstance } from 'class-transformer';
import {
    registerDecorator,
    validate,
    ValidationArguments,
    ValidationOptions,
} from 'class-validator';
import { CustomContext } from 'types/context';

export function IsNumberString(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isNumberString',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== 'string') return false;

                    // Проверяем, что строка представляет собой корректное число
                    return !isNaN(Number(value)) && value.trim() !== '';
                },
                defaultMessage(args: ValidationArguments) {
                    return 'Значение должно быть корректным числом';
                },
            },
        });
    };
}

// Создаем DTO для валидации конкретного значения
class NumberValidationDto {
    @IsNumberString()
    date: string;
}

// Функция для валидации
export async function validateStringNumber(date: string, ctx: CustomContext) {
    // Оборачиваем значение в DTO-класс
    const dto = plainToInstance(NumberValidationDto, { date });

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