import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './modules/app/app.module';
import { ENV_NAMES } from './env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get(ENV_NAMES.PORT);

  app.enableCors();
  await app.listen(port);
}

bootstrap();
