import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

import { ROUTERS_PATH } from '../../constants';

@Injectable()
export class BasicAuthGuard extends AuthGuard('basic') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    if (
      request.path.includes(ROUTERS_PATH.SA_BLOGS) ||
      request.path.includes(ROUTERS_PATH.USERS) ||
      request.path.includes(ROUTERS_PATH.SA_QUIZ_QUESTIONS)
    ) {
      return super.canActivate(context);
    }

    return true;
  }
}
