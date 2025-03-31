import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';

import { TCreateAnswer } from '../pairs-quiz-answer.types';

import { PairQuizAnswer } from './pair-quiz-answer.entity';

@Injectable()
export class PairsQuizAnswerRepository {
  constructor(
    @InjectRepository(PairQuizAnswer)
    private readonly pairQuizAnswerRepository: Repository<PairQuizAnswer>,
  ) {}

  create(
    createAnswer: TCreateAnswer,
    queryRunner: QueryRunner,
  ): Promise<PairQuizAnswer> {
    const pairQuizAnswer = PairQuizAnswer.create(createAnswer);
    return queryRunner.manager.save(pairQuizAnswer);
  }

  getAnswersByPairId(pairQuizId: string): Promise<PairQuizAnswer[]> {
    return this.pairQuizAnswerRepository.findBy({ pairQuizId });
  }

  deleteAll(): Promise<DeleteResult> {
    return this.pairQuizAnswerRepository.delete({});
  }
}
