import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';

import { AppModule } from './modules/app/app.module';
import { useAppSettings } from './common/helpers/useAppSettings';
import { CommonConfig } from './common/config/common.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    logger.log('Инициализация контекста приложения...');
    const appContext = await NestFactory.createApplicationContext(AppModule);

    const commonConfig = appContext.get(CommonConfig);
    logger.log(`Загружен CommonConfig: порт ${commonConfig.port}`);

    logger.log('Настройка динамического модуля...');
    const DynamicAppModule = await AppModule.forRoot(commonConfig);

    logger.log('Создание основного приложения...');
    const app =
      await NestFactory.create<NestExpressApplication>(DynamicAppModule);

    // Закрываем контекст, если он больше не нужен
    await appContext.close();
    logger.log('Контекст приложения закрыт.');

    useAppSettings(app);

    await app.listen(commonConfig.port);
    logger.log(`🚀 Приложение запущено на порту ${commonConfig.port}`);
  } catch (error) {
    logger.error('Ошибка при запуске приложения', error.stack);
    process.exit(1); // Принудительное завершение процесса в случае ошибки
  }
}

bootstrap();
