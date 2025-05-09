import { UserViewDto } from '../../../users.dto';
import { UserQueries } from '../../../../../types';
import { CurrentUserViewDto } from '../../../../../common/dto/current-user-view.dto';
import { PaginationViewDto } from '../../../../../common/dto/pagination-view.dto';

export interface IUsersQueryRepository {
  getAll(queries: UserQueries): Promise<PaginationViewDto<UserViewDto>>;

  getById(id: string): Promise<UserViewDto | null>;

  getCurrentUser(id: string): Promise<CurrentUserViewDto>;
}
