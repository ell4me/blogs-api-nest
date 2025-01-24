import { SortDirection } from 'mongodb';
import { IsInt, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export interface ErrorMessage {
  message: string;
  field: string;
}

export interface ValidationErrorViewDto {
  errorsMessages: ErrorMessage[];
}

export class PaginationQueries {
  // @IsIn(['createdAt', 'updatedAt'])
  @IsString()
  sortBy: string = 'createdAt';

  // @IsIn(['asc', 'desc', 'ascending', 'descending', 1, -1] as SortDirection[])
  @IsString()
  sortDirection: SortDirection = 'desc';

  @IsInt()
  // @Min(1)
  @Type(() => Number)
  @Transform(({ value }) => (value ? value : 1))
  pageNumber: number = 1;

  @IsInt()
  // @Min(1)
  @Type(() => Number)
  @Transform(({ value }) => (value ? value : 10))
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

export interface AccessTokenPayload {
  userId: string;
  iat: number;
  exp: number;
}

export interface UserRequest {
  id: string;
}
