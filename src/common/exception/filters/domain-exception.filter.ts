import {
  Catch,
  HttpStatus,
  ExceptionFilter,
  ArgumentsHost,
} from '@nestjs/common';

import { DomainException, DomainExceptionCode } from '../domain-exception';
import { ValidationErrorViewDto } from '../../dto/validation-error-view.dto';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const statusCode = this.matchHttpCode(exception.code);

    response.status(statusCode).json(
      !!exception.extension.length
        ? ({
            errorsMessages: exception.extension.map(({ message, key }) => ({
              message,
              field: key,
            })),
          } as ValidationErrorViewDto)
        : {
            statusCode,
            message: exception.message,
            timestamp: new Date().toISOString(),
            path: request.url,
          },
    );
  }

  matchHttpCode(code: DomainExceptionCode) {
    switch (code) {
      case DomainExceptionCode.BadRequest: {
        return HttpStatus.BAD_REQUEST;
      }
      case DomainExceptionCode.Forbidden: {
        return HttpStatus.FORBIDDEN;
      }
      case DomainExceptionCode.NotFound: {
        return HttpStatus.NOT_FOUND;
      }
      case DomainExceptionCode.Unauthorized: {
        return HttpStatus.UNAUTHORIZED;
      }
      default: {
        return HttpStatus.I_AM_A_TEAPOT;
      }
    }
  }
}
