import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

import { UpdateDeviceSession } from '../security-devices.types';

export type SecurityDevicesDocument = HydratedDocument<SecurityDevices>;
export type TSecurityDevicesModel = Model<
  SecurityDevices,
  object,
  SecurityDevicesInstanceMethods
>;

interface SecurityDevicesInstanceMethods {
  updateSession: (updateDeviceSession: UpdateDeviceSession) => void;
}

export type SecurityDevicesWithoutMethods = Omit<
  SecurityDevices,
  keyof SecurityDevicesInstanceMethods
>;

@Schema()
export class SecurityDevices {
  @Prop({ required: true })
  iat: number;

  @Prop({ required: true })
  expiration: number;

  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ default: 'Unknown' })
  deviceName: string;

  updateSession({ iat, deviceName, ip, expiration }: UpdateDeviceSession) {
    this.iat = iat;
    this.deviceName = deviceName;
    this.ip = ip;
    this.expiration = expiration;
  }
}

export const SecurityDevicesSchema =
  SchemaFactory.createForClass(SecurityDevices);

// Methods
SecurityDevicesSchema.methods.updateSession =
  SecurityDevices.prototype.updateSession;
