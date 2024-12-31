import { NestFactory } from '@nestjs/core';

import { AppModule } from './modules/app/app.module';
import { SETTINGS } from './constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(SETTINGS.PORT);
}
bootstrap();
