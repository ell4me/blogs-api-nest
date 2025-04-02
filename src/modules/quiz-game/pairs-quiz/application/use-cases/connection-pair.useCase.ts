import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';

import { PairsQuizRepository } from '../../infrastructure/pairs-quiz.repository';
import { ForbiddenDomainException } from '../../../../../common/exception/domain-exception';
import { QuizQuestionsRepository } from '../../../quiz-questions/infrastructure/quiz-questions.repository';
import { PairsQuizQuestionRepository } from '../../../pairs-quiz-question/infrastructure/pairs-quiz-question.repository';
import { GamePairQuizViewDto } from '../../pairs-quiz.dto';
import { PairsQuizQueryRepository } from '../../infrastructure/pairs-quiz.query-repository';

export type TExecuteConnectionPair = GamePairQuizViewDto;

export class ConnectionPairCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ConnectionPairCommand)
export class ConnectionPairUseCase
  implements ICommandHandler<ConnectionPairCommand, TExecuteConnectionPair>
{
  constructor(
    private readonly pairsQuizRepository: PairsQuizRepository,
    private readonly quizQuestionsRepository: QuizQuestionsRepository,
    private readonly pairsQuizQuestionRepository: PairsQuizQuestionRepository,
    private readonly pairsQuizQueryRepository: PairsQuizQueryRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute({
    userId,
  }: ConnectionPairCommand): Promise<TExecuteConnectionPair> {
    const currentActivePair =
      await this.pairsQuizRepository.getActiveOrPendingPair(userId);

    if (currentActivePair) {
      throw ForbiddenDomainException.create();
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const pair = await this.pairsQuizRepository.getPendingPair(queryRunner);

      if (!pair) {
        const pairQuiz = this.pairsQuizRepository.create(userId);
        await queryRunner.manager.save(pairQuiz);
        const response = await this.pairsQuizQueryRepository.getPairById(
          pairQuiz.id,
          queryRunner,
        );
        await queryRunner.commitTransaction();

        return response!;
      }

      const questions =
        await this.quizQuestionsRepository.getRandomPublishedQuestions(5);
      const pairsQuizQuestion = this.pairsQuizQuestionRepository.create(
        questions,
        pair.id,
      );

      pair.addSecondPlayer(userId);

      await queryRunner.manager.save(pairsQuizQuestion);
      await queryRunner.manager.save(pair);
      const response = await this.pairsQuizQueryRepository.getPairById(
        pair.id,
        queryRunner,
      );

      await queryRunner.commitTransaction();

      return response!;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
