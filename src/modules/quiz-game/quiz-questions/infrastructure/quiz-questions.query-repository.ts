import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  PublishedStatus,
  QuizQuestionsQueries,
  TSortDirection,
} from '../../../../types';
import { QuizQuestionViewDto } from '../quiz-questions.dto';
import { PaginationViewDto } from '../../../../common/dto/pagination-view.dto';

import { QuizQuestion } from './quiz-question.entity';

@Injectable()
export class QuizQuestionsQueryRepository {
  constructor(
    @InjectRepository(QuizQuestion)
    private readonly quizQuestionRepository: Repository<QuizQuestion>,
  ) {}

  async getAll({
    publishedStatus,
    bodySearchTerm,
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  }: QuizQuestionsQueries): Promise<PaginationViewDto<QuizQuestionViewDto>> {
    const offset = (pageNumber - 1) * pageSize;
    const queryBuilder = this.quizQuestionRepository
      .createQueryBuilder()
      .where('body ILIKE :bodySearchTerm', {
        bodySearchTerm: `%${bodySearchTerm}%`,
      })
      .orderBy(
        `"${sortBy}"`,
        String(sortDirection).toUpperCase() as TSortDirection,
      )
      .limit(pageSize)
      .offset(offset);

    if (publishedStatus !== PublishedStatus.ALL) {
      queryBuilder.andWhere({
        published: publishedStatus === PublishedStatus.PUBLISHED,
      });
    }

    const quizQuestions = await queryBuilder.getMany();
    const totalCount = await this.getCountQuizQuestionsByFilter(
      bodySearchTerm,
      publishedStatus,
    );

    return {
      page: pageNumber,
      pagesCount: Math.ceil(totalCount / pageSize),
      pageSize: pageSize,
      totalCount,
      items: quizQuestions.map(
        ({ id, correctAnswers, createdAt, published, body, updatedAt }) => ({
          id,
          correctAnswers,
          published,
          body,
          createdAt,
          updatedAt,
        }),
      ),
    };
  }

  private getCountQuizQuestionsByFilter(
    bodySearchTerm: string,
    publishedStatus: PublishedStatus,
  ): Promise<number> {
    const queryBuilder = this.quizQuestionRepository
      .createQueryBuilder()
      .where('body ILIKE :bodySearchTerm', {
        bodySearchTerm: `%${bodySearchTerm}%`,
      });

    if (publishedStatus !== PublishedStatus.ALL) {
      queryBuilder.andWhere({
        published: publishedStatus === PublishedStatus.PUBLISHED,
      });
    }

    return queryBuilder.getCount();
  }
}
