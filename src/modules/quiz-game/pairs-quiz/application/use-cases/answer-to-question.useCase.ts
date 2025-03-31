import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';

import { PairsQuizAnswerRepository } from '../../../pairs-quiz-answer/infrastructure/pairs-quiz-answer.repository';
import {
  AnswerViewDto,
  SendAnswerDto,
} from '../../../pairs-quiz-answer/pairs-quiz-answer.dto';
import { PairsQuizRepository } from '../../infrastructure/pairs-quiz.repository';
import { ForbiddenDomainException } from '../../../../../common/exception/domain-exception';
import { QuizQuestionsRepository } from '../../../quiz-questions/infrastructure/quiz-questions.repository';
import { PairQuizStatus } from '../../pairs-quiz.types';

export type TExecuteAnswerToQuestion = AnswerViewDto;

export class AnswerToQuestionCommand {
  constructor(
    public userId: string,
    public sendAnswerDto: SendAnswerDto,
  ) {}
}

@CommandHandler(AnswerToQuestionCommand)
export class AnswerToQuestionUseCase
  implements ICommandHandler<AnswerToQuestionCommand, TExecuteAnswerToQuestion>
{
  constructor(
    private readonly pairsQuizAnswerRepository: PairsQuizAnswerRepository,
    private readonly pairsQuizRepository: PairsQuizRepository,
    private readonly quizQuestionsRepository: QuizQuestionsRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute({
    userId,
    sendAnswerDto: { answer },
  }: AnswerToQuestionCommand): Promise<TExecuteAnswerToQuestion> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const activePair = await this.pairsQuizRepository.getActivePair(
        userId,
        queryRunner,
      );

      if (!activePair) {
        throw ForbiddenDomainException.create();
      }

      const answers = await this.pairsQuizAnswerRepository.getAnswersByPairId(
        activePair.id,
      );

      const currentUserAnswers = answers.filter(
        (item) => item.userId === userId,
      );

      if (currentUserAnswers.length === 5) {
        throw ForbiddenDomainException.create();
      }

      const currentQuestionId =
        activePair.questions[currentUserAnswers.length].quizQuestionId;

      const currentQuestion =
        await this.quizQuestionsRepository.getById(currentQuestionId);

      const isCorrectAnswer = currentQuestion.correctAnswers
        .map((item) => item.toLowerCase())
        .includes(answer.toLowerCase());

      const createdAnswer = await this.pairsQuizAnswerRepository.create(
        {
          isCorrectAnswer,
          userId,
          quizQuestionId: currentQuestionId,
          pairQuizId: activePair.id,
        },
        queryRunner,
      );

      if (answers.length + 1 === 10) {
        activePair.updateStatus(PairQuizStatus.FINISHED);
        await queryRunner.manager.save(activePair);
      }

      await queryRunner.commitTransaction();

      return {
        questionId: createdAnswer.quizQuestionId,
        answerStatus: createdAnswer.status,
        addedAt: createdAnswer.addedAt,
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
