import {
  Injectable,
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CustomContext } from 'types/context';
import { ValidationError } from 'class-validator';

@Injectable()
export class TelegrafErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const telegrafCtx = context.switchToRpc().getContext<CustomContext>();

    return next.handle().pipe(
      catchError(async (err) => {
        if (telegrafCtx && telegrafCtx.reply) {
          await telegrafCtx.reply(`❌ Ошибка: ${err.message || 'Неизвестная ошибка'}`);
        }
        return throwError(() => err);
      }),
    );
  }
}