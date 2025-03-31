import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PairsQuizAnswerRepository } from './infrastructure/pairs-quiz-answer.repository';
import { PairQuizAnswer } from './infrastructure/pair-quiz-answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PairQuizAnswer])],
  providers: [PairsQuizAnswerRepository],
  exports: [PairsQuizAnswerRepository],
})
export class PairsQuizAnswerModule {}
