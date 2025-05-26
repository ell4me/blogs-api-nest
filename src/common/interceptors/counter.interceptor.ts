import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { tap, Observable, catchError, throwError } from 'rxjs';

import { MetricsService } from '../../metrics/metrics.service';

@Injectable()
export class CounterInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();

    const end = this.metricsService.startTimerHttpRequestDuration();

    return next.handle().pipe(
      tap(() => {
        this.metricsService.incHttpRequest(
          req.method,
          req.path,
          res.statusCode,
        );

        end({
          method: req.method,
          route: req.path,
          status_code: res.statusCode,
        });
      }),
      catchError((err) => {
        this.metricsService.incHttpRequest(req.method, req.path, err.status);
        end({
          method: req.method,
          route: req.path,
          status_code: err.status,
        });

        return throwError(err);
      }),
    );
  }
}
