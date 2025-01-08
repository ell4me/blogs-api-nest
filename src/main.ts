import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

import { AppModule } from './modules/app/app.module';
import { ENV_NAMES } from './env';
import { BadRequestExceptionFilter } from './exception-filters/badRequest-exception.filter';
import { HttpExceptionFilter } from './exception-filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get(ENV_NAMES.PORT);

  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new BadRequestExceptionFilter(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const mappedErrors = errors.map((error) => {
          const constraintKeys = Object.keys(error.constraints!);

          return {
            message: error.constraints![constraintKeys[0]],
            field: error.property,
          };
        });

        throw new BadRequestException(mappedErrors);
      },
    }),
  );

  app.enableCors();
  await app.listen(port);
}

bootstrap();
