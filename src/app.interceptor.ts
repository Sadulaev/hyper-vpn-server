import {
  Injectable,
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { CustomContext } from 'types/context';

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