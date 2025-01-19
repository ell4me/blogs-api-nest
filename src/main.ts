import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './modules/app/app.module';
import { ENV_NAMES } from './env';
import { useAppSettings } from './common/helpers/useAppSettings';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get(ENV_NAMES.PORT);

  useAppSettings(app);

  await app.listen(port);
}

bootstrap();
