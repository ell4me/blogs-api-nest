import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './modules/app/app.module';
import { useAppSettings } from './common/helpers/useAppSettings';

async function bootstrap() {
  // из-за того, что нам нужно донастроить динамический AppModule, мы не можем сразу создавать приложение,
  // а создаём сначала контекст
  const appContext = await NestFactory.createApplicationContext(AppModule);
  // const commonConfig = appContext.get(CommonConfig);
  // как бы вручную инжектим в инициализацию модуля нужную зависимость, донастраивая динамический модуль
  const DynamicAppModule = await AppModule.forRoot();

  const app =
    await NestFactory.create<NestExpressApplication>(DynamicAppModule);
  // Закрываем контекст, если он больше не нужен
  await appContext.close();

  useAppSettings(app);

  await app.listen(4000);
}

bootstrap();
