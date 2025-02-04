import { v4 as uuidv4 } from 'uuid';
import { addSeconds } from 'date-fns/addSeconds';

import {
  SecurityDevicesCreate,
  UpdateDeviceSession,
} from '../security-devices.types';
import { EXPIRATION_TOKEN } from '../../../constants';

interface SecurityDevicesEntityInstanceMethods {
  updateSession: (updateDeviceSession: UpdateDeviceSession) => void;
}

type SecurityDevicesEntityWithoutMethods = Omit<
  SecurityDeviceEntity,
  keyof SecurityDevicesEntityInstanceMethods
>;

export class SecurityDeviceEntity {
  private constructor(
    public iat: number,
    public expiration: number,
    public deviceId: string,
    public ip: string,
    public userId: string,
    public deviceName: string,
  ) {}

  updateSession({ iat, deviceName, ip, expiration }: UpdateDeviceSession) {
    this.iat = iat;
    this.deviceName = deviceName;
    this.ip = ip;
    this.expiration = expiration;
  }

  static createInstance(
    securityDevices: SecurityDevicesEntityWithoutMethods,
  ): SecurityDeviceEntity {
    return new this(
      Number(securityDevices.iat),
      Number(securityDevices.expiration),
      securityDevices.deviceId,
      securityDevices.ip,
      securityDevices.userId,
      securityDevices.deviceName,
    );
  }

  static createPojo({
    userId,
    deviceName,
    ip,
  }: SecurityDevicesCreate): SecurityDevicesEntityWithoutMethods {
    const deviceId = uuidv4();
    const currentDate = new Date();
    const iat = currentDate.getTime();
    const expiration = addSeconds(
      currentDate,
      EXPIRATION_TOKEN.REFRESH,
    ).getTime();

    return {
      iat,
      expiration,
      deviceId,
      userId,
      deviceName: deviceName ? deviceName : 'Unknown',
      ip,
    };
  }
}
