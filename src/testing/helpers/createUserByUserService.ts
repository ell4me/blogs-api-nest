import { UsersService } from '../../modules/users/application/users.service';
import { UserDocument } from '../../modules/users/infrastructure/users.model';

export const createUserByUserService = async (
  usersService: UsersService,
): Promise<UserDocument> => {
  const user = await usersService.createUser({
    email: 'test@mail.ru',
    login: 'test',
    password: 'qwerty',
  });

  return user as UserDocument;
};
