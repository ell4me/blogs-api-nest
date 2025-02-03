import { DeleteResult } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

import {
  SecurityDevices,
  SecurityDevicesDocument,
  SecurityDevicesWithoutMethods,
  TSecurityDevicesModel,
} from './security-devices.model';

@Injectable()
export class SecurityDevicesRepository {
  constructor(
    @InjectModel(SecurityDevices.name)
    private readonly SecurityDevicesModel: TSecurityDevicesModel,
  ) {}

  async getDeviceSession(
    deviceId: string,
  ): Promise<SecurityDevicesDocument | null> {
    return this.SecurityDevicesModel.findOne({ deviceId }).exec();
  }

  async create(
    session: SecurityDevicesWithoutMethods,
  ): Promise<SecurityDevicesDocument> {
    const createdSession = new this.SecurityDevicesModel(session);
    return createdSession.save();
  }

  save(session: SecurityDevicesDocument): Promise<SecurityDevicesDocument> {
    return session.save();
  }

  async deleteByDeviceId(deviceId: string): Promise<boolean> {
    const result = await this.SecurityDevicesModel.deleteOne({
      deviceId,
    }).exec();

    return result.deletedCount === 1;
  }

  async deleteAllExceptCurrent(
    userId: string,
    deviceId: string,
  ): Promise<DeleteResult> {
    return this.SecurityDevicesModel.deleteMany({ userId })
      .where('deviceId')
      .nin([deviceId]);
  }

  deleteAll(): Promise<DeleteResult> {
    return this.SecurityDevicesModel.deleteMany().exec();
  }
}
