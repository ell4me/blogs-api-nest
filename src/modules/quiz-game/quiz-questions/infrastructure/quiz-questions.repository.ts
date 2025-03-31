import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';

import { QuizQuestionCreateDto } from '../quiz-questions.dto';
import { NotFoundDomainException } from '../../../../common/exception/domain-exception';

import { QuizQuestion } from './quiz-question.entity';

@Injectable()
export class QuizQuestionsRepository {
  constructor(
    @InjectRepository(QuizQuestion)
    private readonly quizQuestionRepository: Repository<QuizQuestion>,
  ) {}

  async getById(id: string): Promise<QuizQuestion> {
    const quizQuestion = await this.quizQuestionRepository.findOneBy({ id });

    if (!quizQuestion) {
      throw NotFoundDomainException.create();
    }

    return quizQuestion;
  }

  async getRandomPublishedQuestions(limit: number): Promise<QuizQuestion[]> {
    return this.quizQuestionRepository
      .createQueryBuilder()
      .where({ published: true })
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany();
  }

  create(quizQuestionCreateDto: QuizQuestionCreateDto): Promise<QuizQuestion> {
    const quizQuestion = QuizQuestion.create(quizQuestionCreateDto);
    return this.quizQuestionRepository.save(quizQuestion);
  }

  save(quizQuestion: QuizQuestion): Promise<QuizQuestion> {
    return this.quizQuestionRepository.save(quizQuestion);
  }

  async deleteOrNotFoundFail(id: string): Promise<void> {
    const { affected } = await this.quizQuestionRepository.delete({ id });
    if (affected !== 1) {
      throw NotFoundDomainException.create();
    }

    return;
  }

  deleteAll(): Promise<DeleteResult> {
    return this.quizQuestionRepository.delete({});
  }
}
