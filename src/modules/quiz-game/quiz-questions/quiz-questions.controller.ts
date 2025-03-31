import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { ROUTERS_PATH } from '../../../constants';
import { BasicAuthGuard } from '../../../common/guards/basic-auth.guard';
import { ItemsPaginationViewDto, QuizQuestionsQueries } from '../../../types';

import {
  QuizQuestionCreateDto,
  QuizQuestionPublishDto,
  QuizQuestionUpdateDto,
  QuizQuestionViewDto,
} from './quiz-questions.dto';
import {
  CreateQuizQuestionCommand,
  TExecuteCreateQuizQuestion,
} from './applications/use-cases/create-quiz-question.useCase';
import {
  DeleteQuizQuestionCommand,
  TExecuteDeleteQuizQuestion,
} from './applications/use-cases/delete-quiz-question.useCase';
import {
  TExecuteUpdateQuizQuestion,
  UpdateQuizQuestionCommand,
} from './applications/use-cases/update-quiz-question.useCase';
import {
  PublishedQuizQuestionCommand,
  TExecutePublishedQuizQuestion,
} from './applications/use-cases/published-quiz-question-use.case';
import { QuizQuestionsQueryRepository } from './infrastructure/quiz-questions.query-repository';

@UseGuards(BasicAuthGuard)
@Controller(ROUTERS_PATH.SA_QUIZ_QUESTIONS)
export class QuizQuestionsController {
  constructor(
    private readonly quizQuestionsQueryRepository: QuizQuestionsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  getAllQuestions(
    @Query() queries: QuizQuestionsQueries,
  ): Promise<ItemsPaginationViewDto<QuizQuestionViewDto>> {
    return this.quizQuestionsQueryRepository.getAll(queries);
  }

  @Post()
  createQuestion(
    @Body() quizQuestionCreateDto: QuizQuestionCreateDto,
  ): Promise<QuizQuestionViewDto> {
    return this.commandBus.execute<
      CreateQuizQuestionCommand,
      TExecuteCreateQuizQuestion
    >(new CreateQuizQuestionCommand(quizQuestionCreateDto));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteQuestion(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute<
      DeleteQuizQuestionCommand,
      TExecuteDeleteQuizQuestion
    >(new DeleteQuizQuestionCommand(id));
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateQuestion(
    @Param('id') id: string,
    @Body() quizQuestionUpdateDto: QuizQuestionUpdateDto,
  ): Promise<void> {
    return this.commandBus.execute<
      UpdateQuizQuestionCommand,
      TExecuteUpdateQuizQuestion
    >(new UpdateQuizQuestionCommand(quizQuestionUpdateDto, id));
  }

  @Put(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  publishQuestion(
    @Param('id') id: string,
    @Body() quizQuestionPublishDto: QuizQuestionPublishDto,
  ): Promise<void> {
    return this.commandBus.execute<
      PublishedQuizQuestionCommand,
      TExecutePublishedQuizQuestion
    >(new PublishedQuizQuestionCommand(quizQuestionPublishDto, id));
  }
}
