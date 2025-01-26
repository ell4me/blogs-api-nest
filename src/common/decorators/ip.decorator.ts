import { Request } from 'express';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Ip = createParamDecorator((_data: any, ctx: ExecutionContext) => {
  const request: Request = ctx.switchToHttp().getRequest();
  return request.ip;
});
