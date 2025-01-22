import {
  Catch,
  HttpStatus,
  ExceptionFilter,
  ArgumentsHost,
} from '@nestjs/common';

import { DomainException, DomainExceptionCode } from '../domain-exception';
import { ValidationErrorViewDto } from '../../../types';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    response.status(this.matchHttpCode(exception.code)).json(
      !!exception.extension.length
        ? ({
            errorsMessages: exception.extension.map(({ message, key }) => ({
              message,
              field: key,
            })),
          } as ValidationErrorViewDto)
        : {},
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
