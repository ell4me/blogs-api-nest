import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { SecurityDevicesViewDto } from '../security-devices.dto';

import {
  SecurityDevices,
  TSecurityDevicesModel,
} from './security-devices.model';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(
    @InjectModel(SecurityDevices.name)
    private readonly SecurityDevicesModel: TSecurityDevicesModel,
  ) {}

  async getActiveDeviceSessions(
    userId: string,
  ): Promise<SecurityDevicesViewDto[]> {
    const sessions = await this.SecurityDevicesModel.find({ userId })
      .where('expiration')
      .gt(Date.now());

    return sessions.map(({ deviceId, iat, deviceName, ip }) => ({
      deviceId,
      lastActiveDate: new Date(iat).toISOString(),
      title: deviceName,
      ip,
    }));
  }
}
