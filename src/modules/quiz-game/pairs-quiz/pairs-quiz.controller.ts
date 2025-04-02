import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { ROUTERS_PATH } from '../../../constants';
import { AccessTokenGuard } from '../../../common/guards/access-token.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import {
  AnswerViewDto,
  SendAnswerDto,
} from '../pairs-quiz-answer/pairs-quiz-answer.dto';

import {
  AnswerToQuestionCommand,
  TExecuteAnswerToQuestion,
} from './application/use-cases/answer-to-question.useCase';
import { PairsQuizQueryRepository } from './infrastructure/pairs-quiz.query-repository';
import {
  ConnectionPairCommand,
  TExecuteConnectionPair,
} from './application/use-cases/connection-pair.useCase';
import { GamePairQuizViewDto } from './pairs-quiz.dto';

@UseGuards(AccessTokenGuard)
@Controller(ROUTERS_PATH.PAIRS_QUIZ)
export class PairsQuizController {
  constructor(
    private readonly pairsQuizQueryRepository: PairsQuizQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('my-current')
  async getCurrentPairQuiz(
    @CurrentUser('id') userId: string,
  ): Promise<GamePairQuizViewDto> {
    const pair = await this.pairsQuizQueryRepository.getMyCurrentPair(userId);

    if (!pair) {
      throw new NotFoundException();
    }

    return pair;
  }

  @Get(':id')
  async getPairQuizById(
    @CurrentUser('id') userId: string,
    @Param('id') pairId: string,
  ): Promise<GamePairQuizViewDto> {
    if (Number.isNaN(Number(pairId))) {
      throw new BadRequestException();
    }

    const pair = await this.pairsQuizQueryRepository.getPairById(pairId);

    if (!pair) {
      throw new NotFoundException();
    }

    if (
      pair.firstPlayerProgress.player.id !== userId &&
      pair.secondPlayerProgress?.player.id !== userId
    ) {
      throw new ForbiddenException();
    }

    return pair;
  }

  @HttpCode(HttpStatus.OK)
  @Post('connection')
  async connectToPairQuiz(
    @CurrentUser('id') userId: string,
  ): Promise<GamePairQuizViewDto> {
    const { id } = await this.commandBus.execute<
      ConnectionPairCommand,
      TExecuteConnectionPair
    >(new ConnectionPairCommand(userId));

    const pair = await this.pairsQuizQueryRepository.getPairById(id);

    return pair!;
  }

  @HttpCode(HttpStatus.OK)
  @Post('my-current/answers')
  sendAnswer(
    @CurrentUser('id') userId: string,
    @Body() sendAnswerDto: SendAnswerDto,
  ): Promise<AnswerViewDto> {
    return this.commandBus.execute<
      AnswerToQuestionCommand,
      TExecuteAnswerToQuestion
    >(new AnswerToQuestionCommand(userId, sendAnswerDto));
  }
}
