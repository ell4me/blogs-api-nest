import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './modules/app/app.module';
import { useAppSettings } from './common/helpers/useAppSettings';
import { CommonConfig } from './common/config/common.config';
import { winstonLogger } from './logger';

async function bootstrap() {
  // из-за того, что нам нужно донастроить динамический AppModule, мы не можем сразу создавать приложение,
  // а создаём сначала контекст
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const commonConfig = appContext.get(CommonConfig);
  // как бы вручную инжектим в инициализацию модуля нужную зависимость, донастраивая динамический модуль
  const DynamicAppModule = await AppModule.forRoot(commonConfig);

  const app = await NestFactory.create<NestExpressApplication>(
    DynamicAppModule,
    {
      logger: winstonLogger,
    },
  );
  // Закрываем контекст, если он больше не нужен
  await appContext.close();

  const config = new DocumentBuilder()
    .setTitle('Blogs')
    .setDescription('The blogs API')
    .setVersion('1.0')
    .addBasicAuth()
    .addBearerAuth()
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      operationIdFactory: (_controllerKey: string, methodKey: string) =>
        methodKey,
    });

  SwaggerModule.setup('api', app, documentFactory);

  useAppSettings(app);

  await app.listen(commonConfig.port);
}

bootstrap();
