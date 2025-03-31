import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { QuizQuestionsRepository } from '../../infrastructure/quiz-questions.repository';
import { QuizQuestionUpdateDto } from '../../quiz-questions.dto';

export type TExecuteUpdateQuizQuestion = void;

export class UpdateQuizQuestionCommand {
  constructor(
    public quizQuestionUpdateDto: QuizQuestionUpdateDto,
    public id: string,
  ) {}
}

@CommandHandler(UpdateQuizQuestionCommand)
export class UpdateQuizQuestionUseCase
  implements
    ICommandHandler<UpdateQuizQuestionCommand, TExecuteUpdateQuizQuestion>
{
  constructor(
    private readonly quizQuestionsRepository: QuizQuestionsRepository,
  ) {}

  async execute({
    quizQuestionUpdateDto,
    id,
  }: UpdateQuizQuestionCommand): Promise<TExecuteUpdateQuizQuestion> {
    const quizQuestion = await this.quizQuestionsRepository.getById(id);
    quizQuestion.updateQuestion(quizQuestionUpdateDto);

    await this.quizQuestionsRepository.save(quizQuestion);
    return;
  }
}
