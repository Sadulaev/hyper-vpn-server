import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import config from './config';
import * as bodyParser from 'body-parser';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('ProcessGuards');
  const app = await NestFactory.create(AppModule);
  const uploadDir = join(process.cwd(), 'uploads');

  process.on('unhandledRejection', (reason: any, p) => {
    logger.error(`unhandledRejection: ${reason?.stack || reason}`);
  });
  process.on('uncaughtException', (err: any) => {
    logger.error(`uncaughtException: ${err?.stack || err}`);
  });

  // Если используете Express (по умолчанию):
  app.use(bodyParser.urlencoded({ extended: true })); // Robokassa шлёт form-urlencoded
  app.use(bodyParser.json());

  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir);
  }
  await app.listen(config().port);
}
bootstrap();
