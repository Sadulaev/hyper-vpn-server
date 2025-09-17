import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import config from './config';
import * as bodyParser from 'body-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const uploadDir = join(process.cwd(), 'uploads');

  // Если используете Express (по умолчанию):
  app.use(bodyParser.urlencoded({ extended: true })); // Robokassa шлёт form-urlencoded
  app.use(bodyParser.json());

  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir);
  }
  await app.listen(config().port);
}
bootstrap();
