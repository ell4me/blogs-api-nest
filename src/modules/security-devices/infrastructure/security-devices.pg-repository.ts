import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { SecurityDevicesCreate } from '../security-devices.types';

import { SecurityDevicesEntity } from './security-devices.entity';

@Injectable()
export class SecurityDevicesPgRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getDeviceSession(
    deviceId: string,
  ): Promise<SecurityDevicesEntity | null> {
    const result = await this.dataSource.query(
      `SELECT * FROM "SecurityDevices" WHERE "deviceId"=$1`,
      [deviceId],
    );

    return result[0] ? SecurityDevicesEntity.createInstance(result[0]) : null;
  }

  async create(
    securityDevicesCreate: SecurityDevicesCreate,
  ): Promise<SecurityDevicesEntity> {
    const session = SecurityDevicesEntity.createPojo(securityDevicesCreate);

    await this.dataSource.query(
      `
      INSERT INTO "SecurityDevices" 
      ("iat", "expiration", "deviceName", "userId", "deviceId", "ip")
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
      [
        session.iat,
        session.expiration,
        session.deviceName,
        session.userId,
        session.deviceId,
        session.ip,
      ],
    );

    return SecurityDevicesEntity.createInstance(session);
  }

  async save(session: SecurityDevicesEntity): Promise<SecurityDevicesEntity> {
    await this.dataSource.query(
      `
      UPDATE "SecurityDevices" SET 
        "iat"=$1, 
        "expiration"=$2,
        "deviceName"=$3, 
        "ip"=$4
       WHERE "deviceId"=$5
    `,
      [
        session.iat,
        session.expiration,
        session.deviceName,
        session.ip,
        session.deviceId,
      ],
    );

    return session;
  }

  async deleteByDeviceId(deviceId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE FROM "SecurityDevices" WHERE "deviceId"=$1`,
      [deviceId],
    );

    return !!result[1];
  }

  deleteAllExceptCurrent(userId: string, deviceId: string) {
    return this.dataSource.query(
      `DELETE FROM "SecurityDevices" WHERE "userId"=$1 AND "deviceId"!=$2`,
      [userId, deviceId],
    );
  }

  deleteAll() {
    return this.dataSource.query(`DELETE FROM "SecurityDevices"`);
  }
}
