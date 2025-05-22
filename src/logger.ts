import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';

export const winstonLogger = WinstonModule.createLogger({
  transports: [
    new winston.transports.File({
      filename: 'logs/nest.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});
