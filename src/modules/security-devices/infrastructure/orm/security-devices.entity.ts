import { v4 as uuidv4 } from 'uuid';
import { addSeconds } from 'date-fns/addSeconds';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import {
  SecurityDevicesCreate,
  UpdateDeviceSession,
} from '../../security-devices.types';
import { EXPIRATION_TOKEN } from '../../../../constants';
import { User } from '../../../users/infrastructure/orm/user.entity';

@Entity()
export class SecurityDevice {
  @Column({ type: 'bigint' })
  public iat: number;

  @Column({ type: 'bigint' })
  public expiration: number;

  @PrimaryColumn()
  public deviceId: string;

  @Column()
  public ip: string;

  @ManyToOne(() => User, (u) => u.securityDevices)
  public user: User;

  @PrimaryColumn()
  public userId: string;

  @Column()
  public deviceName: string;

  updateSession({ iat, deviceName, ip, expiration }: UpdateDeviceSession) {
    this.iat = iat;
    this.deviceName = deviceName;
    this.ip = ip;
    this.expiration = expiration;
  }

  static create({
    userId,
    deviceName,
    ip,
  }: SecurityDevicesCreate): SecurityDevice {
    const currentDate = new Date();
    const instance = new this();

    instance.iat = currentDate.getTime();
    instance.expiration = addSeconds(
      currentDate,
      EXPIRATION_TOKEN.REFRESH,
    ).getTime();
    instance.deviceId = uuidv4();
    instance.userId = userId;
    instance.ip = ip;
    instance.deviceName = deviceName ? deviceName : 'Unknown';

    return instance;
  }
}
