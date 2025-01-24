import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import cookieParser from 'cookie-parser';

import { HttpExceptionFilter } from '../exception/filters/http-exception.filter';
import { BadRequestExceptionFilter } from '../exception/filters/badRequest-exception.filter';
import { DomainExceptionFilter } from '../exception/filters/domain-exception.filter';

export const useAppSettings = (app: INestApplication) => {
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new BadRequestExceptionFilter(),
    new DomainExceptionFilter(),
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

  app.use(cookieParser());
  app.enableCors();
};
