import { UserDocument } from '../../modules/users/infrastructure/mongo/users.model';
import {
  CreateUserCommand,
  CreateUserUseCase,
} from '../../modules/users/application/use-cases/create-user.useCase';

export const createUserByUserService = async (
  createUserUseCase: CreateUserUseCase,
): Promise<UserDocument> => {
  const user = await createUserUseCase.execute(
    new CreateUserCommand({
      email: 'test@mail.ru',
      login: 'test',
      password: 'qwerty',
    }),
  );

  return user as UserDocument;
};
