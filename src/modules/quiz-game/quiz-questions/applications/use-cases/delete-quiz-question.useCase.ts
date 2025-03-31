import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { QuizQuestionsRepository } from '../../infrastructure/quiz-questions.repository';

export type TExecuteDeleteQuizQuestion = void;

export class DeleteQuizQuestionCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteQuizQuestionCommand)
export class DeleteQuizQuestionUseCase
  implements
    ICommandHandler<DeleteQuizQuestionCommand, TExecuteDeleteQuizQuestion>
{
  constructor(
    private readonly quizQuestionsRepository: QuizQuestionsRepository,
  ) {}

  async execute({
    id,
  }: DeleteQuizQuestionCommand): Promise<TExecuteDeleteQuizQuestion> {
    return this.quizQuestionsRepository.deleteOrNotFoundFail(id);
  }
}
