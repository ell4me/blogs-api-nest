export type TEntityWithoutDate<T> = Omit<T, keyof DateTimestamp>;

export class DateTimestamp {
  createdAt: string;
  updatedAt: string;
}
