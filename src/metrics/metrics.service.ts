import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  collectDefaultMetrics,
  Counter,
  Registry,
  Histogram,
} from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly registry = new Registry();

  public httpRequestCounter: Counter<string>;
  public httpRequestDuration: Histogram<string>;

  onModuleInit() {
    // Собираем системные метрики (CPU, память, latency event loop, heap и т.д.)
    collectDefaultMetrics({ register: this.registry });

    // Пример кастомной метрики: счётчик HTTP-запросов
    this.httpRequestCounter = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      buckets: [0.1, 0.3, 0.5, 1, 2, 5],
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });
  }

  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  incHttpRequest(method: string, route: string, statusCode: number) {
    this.httpRequestCounter.inc({ method, route, status_code: statusCode });
  }

  startTimerHttpRequestDuration() {
    return this.httpRequestDuration.startTimer();
  }
}
