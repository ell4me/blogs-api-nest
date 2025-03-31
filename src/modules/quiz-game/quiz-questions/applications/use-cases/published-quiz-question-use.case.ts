import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { QuizQuestionsRepository } from '../../infrastructure/quiz-questions.repository';
import { QuizQuestionPublishDto } from '../../quiz-questions.dto';

export type TExecutePublishedQuizQuestion = void;

export class PublishedQuizQuestionCommand {
  constructor(
    public quizQuestionPublishDto: QuizQuestionPublishDto,
    public id: string,
  ) {}
}

@CommandHandler(PublishedQuizQuestionCommand)
export class PublishedQuizQuestionUseCase
  implements
    ICommandHandler<PublishedQuizQuestionCommand, TExecutePublishedQuizQuestion>
{
  constructor(
    private readonly quizQuestionsRepository: QuizQuestionsRepository,
  ) {}

  async execute({
    quizQuestionPublishDto,
    id,
  }: PublishedQuizQuestionCommand): Promise<TExecutePublishedQuizQuestion> {
    const quizQuestion = await this.quizQuestionsRepository.getById(id);
    quizQuestion.updatePublishStatus(quizQuestionPublishDto);

    await this.quizQuestionsRepository.save(quizQuestion);
    return;
  }
}
