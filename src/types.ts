import { SortDirection } from 'mongodb';

import { STATUSES_LIKE } from './constants';

export interface ErrorMessage {
  message: string;
  field: string;
}

export interface ValidationErrorViewDto {
  errorsMessages: ErrorMessage[];
}

export interface PaginationQueries {
  sortBy: string;
  sortDirection: SortDirection;
  pageNumber: number;
  pageSize: number;
}

export interface FilteredBlogQueries extends PaginationQueries {
  searchNameTerm: string | null;
}

export interface FilteredUserQueries extends PaginationQueries {
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
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
