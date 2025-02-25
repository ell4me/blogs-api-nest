import { Injectable } from '@nestjs/common';
import { MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { SecurityDevicesViewDto } from '../../security-devices.dto';

import { SecurityDevice } from './security-devices.entity';

@Injectable()
export class SecurityDevicesOrmQueryRepository {
  constructor(
    @InjectRepository(SecurityDevice)
    private securityDevicesRepository: Repository<SecurityDevice>,
  ) {}

  async getActiveDeviceSessions(
    userId: string,
  ): Promise<SecurityDevicesViewDto[]> {
    const sessions = await this.securityDevicesRepository.findBy({
      userId,
      expiration: MoreThan(Date.now()),
    });

    return sessions.map(({ deviceId, iat, deviceName, ip }) => ({
      deviceId,
      lastActiveDate: new Date(Number(iat)).toISOString(),
      title: deviceName,
      ip,
    }));
  }
}
