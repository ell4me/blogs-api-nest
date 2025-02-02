export type TEntityWithoutDate<T> = Omit<T, keyof DateTimestamp>;

export class DateTimestamp {
  constructor(
    public createdAt: string,
    public updatedAt: string,
  ) {}
}
