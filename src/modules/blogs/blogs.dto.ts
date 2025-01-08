import { IsUrl, Length, MaxLength } from 'class-validator';

export interface BlogViewDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
}

export class BlogCreateDto {
  @Length(1, 15)
  name: string;

  @Length(1, 500)
  description: string;

  @IsUrl()
  @MaxLength(100)
  websiteUrl: string;
}

export class BlogUpdateDto {
  @Length(1, 15)
  name: string;

  @Length(1, 500)
  description: string;

  @IsUrl()
  @MaxLength(100)
  websiteUrl: string;
}
