import { SortDirection } from 'mongodb';
import { IsIn, IsInt, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

import { STATUSES_LIKE } from './constants';

export interface ErrorMessage {
  message: string;
  field: string;
}

export interface ValidationErrorViewDto {
  errorsMessages: ErrorMessage[];
}

export class PaginationQueries {
  @IsIn(['createdAt', 'updatedAt'])
  sortBy: string = 'createdAt';

  @IsIn(['asc', 'desc', 'ascending', 'descending', 1, -1] as SortDirection[])
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

export class FilteredBlogQueries extends PaginationQueries {
  @IsString()
  searchNameTerm: string = '';
}

export class FilteredPostQueries extends PaginationQueries {
  @IsString()
  searchNameTerm: string = '';
}

export class FilteredUserQueries extends PaginationQueries {
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

export type StatusLike = (typeof STATUSES_LIKE)[number];

export interface AccessTokenPayload {
  userId: string;
  iat: number;
  exp: number;
}

export interface UserRequest {
  id: string;
}
