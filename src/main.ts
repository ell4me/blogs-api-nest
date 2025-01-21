import { NestFactory } from '@nestjs/core';

import { AppModule } from './modules/app/app.module';
import { useAppSettings } from './common/helpers/useAppSettings';
import { CommonConfig } from './common/config/common.config';

async function bootstrap() {
  // из-за того, что нам нужно донастроить динамический AppModule, мы не можем сразу создавать приложение,
  // а создаём сначала контекст
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const commonConfig = appContext.get(CommonConfig);
  // как бы вручную инжектим в инициализацию модуля нужную зависимость, донастраивая динамический модуль
  const DynamicAppModule = await AppModule.forRoot(commonConfig);

  const app = await NestFactory.create(DynamicAppModule);
  // Закрываем контекст, если он больше не нужен
  await appContext.close();

  useAppSettings(app);

  await app.listen(commonConfig.port);
}

bootstrap();
