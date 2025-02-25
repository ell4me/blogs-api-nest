import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type TEntityWithoutDate<T> = Omit<T, keyof DateTimestamp>;

export class DateTimestamp {
  constructor(
    public createdAt: string,
    public updatedAt: string,
  ) {}
}

export class DateTimestampEntity {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
