import { IsEnum, IsIn, IsInt, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SortDirection } from 'typeorm';

import { NODE_ENVS } from './constants';

export type TSortDirection = 'ASC' | 'DESC';

export class PaginationQueries {
  @ApiProperty({
    enum: ['createdAt', 'updatedAt', 'login'],
    default: 'createdAt',
  })
  @IsIn(['createdAt', 'updatedAt', 'login'])
  sortBy: string = 'createdAt';

  @ApiProperty({ enum: ['asc', 'desc'], default: 'desc' })
  @IsIn(['asc', 'desc'] as SortDirection[])
  sortDirection: SortDirection = 'desc';

  @ApiProperty({ default: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageNumber: number = 1;

  @ApiProperty({ default: 10 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageSize: number = 10;
}

export class CommentQueries extends PaginationQueries {
  @ApiProperty({
    enum: ['createdAt', 'updatedAt', 'content'],
    default: 'createdAt',
  })
  @IsIn(['createdAt', 'updatedAt', 'content'])
  sortBy: string = 'createdAt';
}

export class BlogQueries extends PaginationQueries {
  @ApiProperty({
    enum: ['createdAt', 'updatedAt', 'name'],
    default: 'createdAt',
  })
  @IsIn(['createdAt', 'updatedAt', 'name'])
  sortBy: string = 'createdAt';

  @ApiProperty()
  @IsString()
  searchNameTerm: string = '';
}

export class PostQueries extends PaginationQueries {
  @ApiProperty({
    enum: ['createdAt', 'updatedAt', 'title', 'blogName'],
    default: 'createdAt',
  })
  @IsIn(['createdAt', 'updatedAt', 'title', 'blogName'])
  sortBy: string = 'createdAt';

  @ApiProperty()
  @IsString()
  searchNameTerm: string = '';
}

export class UserQueries extends PaginationQueries {
  @ApiProperty()
  @IsString()
  searchLoginTerm: string = '';

  @ApiProperty()
  @IsString()
  searchEmailTerm: string = '';
}

export enum PublishedStatus {
  ALL = 'all',
  PUBLISHED = 'published',
  NOT_PUBLISHED = 'notPublished',
}

export class QuizQuestionsQueries extends PaginationQueries {
  @ApiProperty({
    enum: ['createdAt', 'updatedAt', 'body'],
    default: 'createdAt',
  })
  @IsIn(['createdAt', 'updatedAt', 'body'])
  sortBy: string = 'createdAt';

  @ApiProperty()
  @IsString()
  bodySearchTerm: string = '';

  @ApiProperty({ enum: PublishedStatus, default: PublishedStatus.ALL })
  @IsEnum(PublishedStatus)
  publishedStatus: PublishedStatus = PublishedStatus.ALL;
}

export interface AccessTokenPayload {
  userId: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  deviceId: string;
  userId: string;
  iat: number;
  exp: number;
}

export interface UserRequest {
  id: string;
  deviceId?: string;
}

export type TNodeEnvs = (typeof NODE_ENVS)[number];
