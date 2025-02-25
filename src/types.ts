import { SortDirection } from 'mongodb';
import { IsIn, IsInt, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

import { NODE_ENVS } from './constants';

export type TSortDirection = 'ASC' | 'DESC';

export interface ErrorMessage {
  message: string;
  field: string;
}

export interface ValidationErrorViewDto {
  errorsMessages: ErrorMessage[];
}

export class PaginationQueries {
  @IsIn(['createdAt', 'updatedAt', 'login'])
  sortBy: string = 'createdAt';

  @IsIn(['asc', 'desc'] as SortDirection[])
  sortDirection: SortDirection = 'desc';

  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageNumber: number = 1;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageSize: number = 10;
}

export class CommentQueries extends PaginationQueries {
  @IsIn(['createdAt', 'updatedAt', 'content'])
  sortBy: string = 'createdAt';
}

export class BlogQueries extends PaginationQueries {
  @IsIn(['createdAt', 'updatedAt', 'name'])
  sortBy: string = 'createdAt';

  @IsString()
  searchNameTerm: string = '';
}

export class PostQueries extends PaginationQueries {
  @IsIn(['createdAt', 'updatedAt', 'title', 'blogName'])
  sortBy: string = 'createdAt';

  @IsString()
  searchNameTerm: string = '';
}

export class UserQueries extends PaginationQueries {
  @IsString()
  searchLoginTerm: string = '';
  @IsString()
  searchEmailTerm: string = '';
}

export interface ItemsPaginationViewDto<T = object> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
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
