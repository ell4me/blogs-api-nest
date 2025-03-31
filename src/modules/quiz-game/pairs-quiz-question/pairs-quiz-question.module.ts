import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PairQuizQuestion } from './infrastructure/pair-quiz-question.entity';
import { PairsQuizQuestionRepository } from './infrastructure/pairs-quiz-question.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PairQuizQuestion])],
  providers: [PairsQuizQuestionRepository],
  exports: [PairsQuizQuestionRepository],
})
export class PairsQuizQuestionModule {}
