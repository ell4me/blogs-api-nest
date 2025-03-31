import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, QueryRunner, Repository } from 'typeorm';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';

import { PairQuizStatus } from '../pairs-quiz.types';
import { PairQuizQuestion } from '../../pairs-quiz-question/infrastructure/pair-quiz-question.entity';

import { PairQuiz } from './pair-quiz.entity';

@Injectable()
export class PairsQuizRepository {
  constructor(
    @InjectRepository(PairQuiz)
    private readonly pairsQuizRepository: Repository<PairQuiz>,
  ) {}

  create(userId: string): PairQuiz {
    return PairQuiz.create(userId);
  }

  getPendingPair(queryRunner: QueryRunner): Promise<PairQuiz | null> {
    return queryRunner.manager
      .createQueryBuilder(PairQuiz, 'pq')
      .where({ status: PairQuizStatus.PENDING_SECOND_PLAYER })
      .setLock('pessimistic_write')
      .setOnLocked('skip_locked')
      .getOne();
  }

  getActiveOrPendingPair(
    userId: string,
    withQuestions?: boolean,
  ): Promise<PairQuiz | null> {
    const builder = this.pairsQuizRepository
      .createQueryBuilder('pair')
      .where(
        new Brackets((qb) => {
          qb.where({ status: PairQuizStatus.ACTIVE }).orWhere({
            status: PairQuizStatus.PENDING_SECOND_PLAYER,
          });
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where({ firstPlayerId: userId }).orWhere({
            secondPlayerId: userId,
          });
        }),
      );

    if (withQuestions) {
      builder.leftJoinAndSelect('pair.questions', 'questions');
    }

    return builder.getOne();
  }

  async getActivePair(
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<PairQuiz | null> {
    const pair = await queryRunner.manager
      .createQueryBuilder(PairQuiz, 'pair')
      .where({ status: PairQuizStatus.ACTIVE })
      .andWhere(
        new Brackets((qb) => {
          qb.where({ firstPlayerId: userId }).orWhere({
            secondPlayerId: userId,
          });
        }),
      )
      .setLock('pessimistic_write')
      .getOne();

    if (!pair) return null;

    pair.questions = await queryRunner.manager
      .createQueryBuilder(PairQuizQuestion, 'pq')
      .where('pq.pairQuizId = :pairId', { pairId: pair.id })
      .getMany();

    return pair;
  }

  deleteAll(): Promise<DeleteResult> {
    return this.pairsQuizRepository.delete({});
  }
}
