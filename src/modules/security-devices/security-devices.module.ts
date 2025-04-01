import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SecurityDevicesController } from './security-devices.controller';
import { DeleteSessionByDeviceIdUseCase } from './application/use-cases/delete-session-by-device-id.useCase';
import { DeleteAllSessionsExceptCurrentUseCase } from './application/use-cases/delete-all-sessions-except-current.useCase';
import { SecurityDevicesPgQueryRepository } from './infrastructure/pg/security-devices.pg-query-repository';
import { SecurityDevicesPgRepository } from './infrastructure/pg/security-devices.pg-repository';
import { SecurityDevicesOrmQueryRepository } from './infrastructure/orm/security-devices.orm-query-repository';
import { SecurityDevicesOrmRepository } from './infrastructure/orm/security-devices.orm-repository';
import { SecurityDevice } from './infrastructure/orm/security-devices.entity';

const useCases = [
  DeleteSessionByDeviceIdUseCase,
  DeleteAllSessionsExceptCurrentUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([SecurityDevice]),
    // MongooseModule.forFeature([
    //   { name: SecurityDevices.name, schema: SecurityDevicesSchema },
    // ]),
  ],
  controllers: [SecurityDevicesController],
  providers: [
    // SecurityDevicesRepository,
    // SecurityDevicesQueryRepository,
    SecurityDevicesPgRepository,
    SecurityDevicesPgQueryRepository,
    SecurityDevicesOrmRepository,
    SecurityDevicesOrmQueryRepository,
    ...useCases,
  ],
  exports: [
    // SecurityDevicesRepository,
    SecurityDevicesPgRepository,
    SecurityDevicesOrmRepository,
    DeleteSessionByDeviceIdUseCase,
  ],
})
export class SecurityDevicesModule {}
