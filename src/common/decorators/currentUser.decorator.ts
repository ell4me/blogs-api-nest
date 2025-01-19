import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { UserRequest } from '../../types';

export const CurrentUser = createParamDecorator(
  (data: keyof UserRequest, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
