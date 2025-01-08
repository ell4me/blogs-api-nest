import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { Response } from 'express';

import { ErrorMessage, ValidationErrorViewDto } from '../types';

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    let errorsMessages: ErrorMessage[] = [];

    if (typeof exceptionResponse === 'object') {
      if ('message' in exceptionResponse) {
        errorsMessages = (exceptionResponse as { message: [] }).message;
      }

      if ('errorsMessages' in exceptionResponse) {
        errorsMessages = (exceptionResponse as ValidationErrorViewDto)
          .errorsMessages;
      }
    }

    response.status(status).json({ errorsMessages });
  }
}
