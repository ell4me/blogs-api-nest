import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { QuizQuestion } from '../../infrastructure/quiz-question.entity';
import { QuizQuestionCreateDto } from '../../quiz-questions.dto';
import { QuizQuestionsRepository } from '../../infrastructure/quiz-questions.repository';

export type TExecuteCreateQuizQuestion = QuizQuestion;

export class CreateQuizQuestionCommand {
  constructor(public quizQuestionCreateDto: QuizQuestionCreateDto) {}
}

@CommandHandler(CreateQuizQuestionCommand)
export class CreateQuizQuestionUseCase
  implements
    ICommandHandler<CreateQuizQuestionCommand, TExecuteCreateQuizQuestion>
{
  constructor(
    private readonly quizQuestionsRepository: QuizQuestionsRepository,
  ) {}

  execute({
    quizQuestionCreateDto,
  }: CreateQuizQuestionCommand): Promise<TExecuteCreateQuizQuestion> {
    return this.quizQuestionsRepository.create(quizQuestionCreateDto);
  }
}
