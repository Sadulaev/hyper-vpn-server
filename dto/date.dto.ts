import { IsDateString, validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CustomContext } from 'types/context';
import { BadRequestException } from '@nestjs/common';

import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsCustomDateFormat(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCustomDateFormat',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Регулярное выражение для проверки формата дд.мм.гггг
          const regex = /^\d{2}\.\d{2}\.\d{4}$/;
          if (!regex.test(value)) return false;

          // Дополнительная проверка на валидность самой даты
          const [day, month, year] = value.split('.').map(Number);
          const date = new Date(year, month - 1, day);
          return (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day
          );
        },
        defaultMessage(args: ValidationArguments) {
          return 'Неверный формат даты. Ожидается дд.мм.гггг';
        },
      },
    });
  };
}

// Создаем DTO для валидации конкретного значения
class DateValidationDto {
  @IsCustomDateFormat({ message: 'Дата должна быть в формате дд.мм.гггг' })
  date: string;
}

// Функция для валидации
export async function validateDate(date: string, ctx: CustomContext) {
  // Оборачиваем значение в DTO-класс
  const dto = plainToInstance(DateValidationDto, { date });

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