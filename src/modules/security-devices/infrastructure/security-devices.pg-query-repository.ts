import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { SecurityDevicesViewDto } from '../security-devices.dto';

import { SecurityDevicesEntity } from './security-devices.entity';

@Injectable()
export class SecurityDevicesPgQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getActiveDeviceSessions(
    userId: string,
  ): Promise<SecurityDevicesViewDto[]> {
    const sessions: SecurityDevicesEntity[] = await this.dataSource.query(
      `
      SELECT * FROM "SecurityDevices" WHERE "userId"=$1 AND expiration > $2
    `,
      [userId, Date.now()],
    );

    return sessions?.length
      ? sessions.map(({ deviceId, iat, deviceName, ip }) => ({
          deviceId,
          lastActiveDate: new Date(Number(iat)).toISOString(),
          title: deviceName,
          ip,
        }))
      : [];
  }
}
