import { Injectable } from '@nestjs/common';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { SecurityDevicesCreate } from '../../security-devices.types';

import { SecurityDevice } from './security-devices.entity';

@Injectable()
export class SecurityDevicesOrmRepository {
  constructor(
    @InjectRepository(SecurityDevice)
    private securityDevicesRepository: Repository<SecurityDevice>,
  ) {}

  async getDeviceSession(deviceId: string): Promise<SecurityDevice | null> {
    return this.securityDevicesRepository.findOneBy({
      deviceId,
    });
  }

  async create(
    securityDevicesCreate: SecurityDevicesCreate,
  ): Promise<SecurityDevice> {
    const securityDevice = SecurityDevice.create(securityDevicesCreate);
    return this.securityDevicesRepository.save(securityDevice);
  }

  async save(securityDevice: SecurityDevice): Promise<SecurityDevice> {
    return this.securityDevicesRepository.save(securityDevice);
  }

  async deleteByDeviceId(deviceId: string): Promise<boolean> {
    const { affected } = await this.securityDevicesRepository.delete({
      deviceId,
    });

    return !!affected;
  }

  deleteAllExceptCurrent(userId: string, deviceId: string) {
    return this.securityDevicesRepository.delete({
      userId,
      deviceId: Not(deviceId),
    });
  }

  deleteAll() {
    return this.securityDevicesRepository.delete({});
  }
}
