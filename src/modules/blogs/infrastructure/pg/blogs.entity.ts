import { DateTimestamp } from '../../../../common/helpers/date-timestamp';

export class BlogEntity extends DateTimestamp {
  private constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public isMembership: boolean,
    public createdAt: string,
    public updatedAt: string,
  ) {
    super(createdAt, updatedAt);
  }
}
