import { UserViewDto } from '../../../users.dto';
import { ItemsPaginationViewDto, UserQueries } from '../../../../../types';
import { CurrentUserViewDto } from '../../../../../common/dto/currentUserView.dto';

export interface IUsersQueryRepository {
  getAll(queries: UserQueries): Promise<ItemsPaginationViewDto<UserViewDto>>;

  getById(id: string): Promise<UserViewDto | null>;

  getCurrentUser(id: string): Promise<CurrentUserViewDto>;
}
