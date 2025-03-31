import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { PairQuizStatus } from '../pairs-quiz.types';
import { GamePairQuizViewDto } from '../pairs-quiz.dto';
import { PairQuizAnswer } from '../../pairs-quiz-answer/infrastructure/pair-quiz-answer.entity';
import { AnswerViewDto } from '../../pairs-quiz-answer/pairs-quiz-answer.dto';
import { AnswerStatus } from '../../pairs-quiz-answer/pairs-quiz-answer.types';

import { PairQuiz } from './pair-quiz.entity';

@Injectable()
export class PairsQuizQueryRepository {
  constructor(
    @InjectRepository(PairQuiz)
    private readonly pairsQuizRepository: Repository<PairQuiz>,
    @InjectRepository(PairQuizAnswer)
    private readonly pairQuizAnswerRepository: Repository<PairQuizAnswer>,
  ) {}

  async getMyCurrentPair(userId: string): Promise<GamePairQuizViewDto | null> {
    return this.getPair({ userId });
  }

  async getPairById(pairId: string): Promise<GamePairQuizViewDto | null> {
    return this.getPair({ pairId });
  }

  private mapToAnswerDto({
    quizQuestionId,
    addedAt,
    status,
  }: PairQuizAnswer): AnswerViewDto {
    return {
      questionId: quizQuestionId,
      answerStatus: status,
      addedAt,
    };
  }

  private async getPair({
    pairId,
    userId,
  }: {
    userId?: string;
    pairId?: string;
  }) {
    const builder = this.pairsQuizRepository
      .createQueryBuilder('pair')
      .leftJoinAndSelect('pair.firstPlayer', 'fp')
      .leftJoinAndSelect('pair.secondPlayer', 'sp')
      .leftJoinAndSelect('pair.questions', 'questions')
      .leftJoinAndSelect('questions.quizQuestion', 'quizQuestion');

    if (!pairId) {
      builder.where({ status: PairQuizStatus.ACTIVE }).andWhere(
        new Brackets((qb) => {
          qb.where({ firstPlayerId: userId }).orWhere({
            secondPlayerId: userId,
          });
        }),
      );
    } else {
      builder.where('pair.id = :pairId', { pairId });
    }

    const pair = await builder.getOne();
    let firstPlayerAnswers: AnswerViewDto[] = [];
    let secondPlayerAnswers: AnswerViewDto[] = [];
    let countFirstPlayer = 0;
    let countSecondPlayer = 0;

    if (!pair) {
      return null;
    }

    if (pair.secondPlayerId) {
      const answers = await this.pairQuizAnswerRepository
        .createQueryBuilder()
        .where({ pairQuizId: pair.id })
        .andWhere(
          new Brackets((subQuery) =>
            subQuery
              .where({ userId: pair.firstPlayerId })
              .orWhere({ userId: pair.secondPlayerId }),
          ),
        )
        .getMany();

      firstPlayerAnswers = answers
        .filter((answer) => answer.userId === pair.firstPlayerId)
        .map(this.mapToAnswerDto);

      secondPlayerAnswers = answers
        .filter((answer) => answer.userId === pair.secondPlayerId)
        .map(this.mapToAnswerDto);

      if (answers.length) {
        countFirstPlayer += firstPlayerAnswers.filter(
          (item) => item.answerStatus === AnswerStatus.CORRECT,
        ).length;

        countSecondPlayer += secondPlayerAnswers.filter(
          (item) => item.answerStatus === AnswerStatus.CORRECT,
        ).length;
      }

      if (answers.length === 10) {
        const addedAtFirstPlayer =
          firstPlayerAnswers[firstPlayerAnswers.length - 1].addedAt.getTime();

        const addedAtSecondPlayer =
          secondPlayerAnswers[secondPlayerAnswers.length - 1].addedAt.getTime();

        if (addedAtFirstPlayer > addedAtSecondPlayer) {
          if (countSecondPlayer) {
            countSecondPlayer += 1;
          }
        } else if (countFirstPlayer) {
          countFirstPlayer += 1;
        }
      }
    }

    return {
      id: pair.id,
      startGameDate: pair.startGameDate,
      finishGameDate: pair.finishGameDate,
      pairCreatedDate: pair.pairCreatedDate,
      status: pair.status,
      firstPlayerProgress: {
        player: {
          id: pair.firstPlayer.id,
          login: pair.firstPlayer.login,
        },
        answers: firstPlayerAnswers,
        score: countFirstPlayer,
      },
      secondPlayerProgress: pair.secondPlayer
        ? {
            player: {
              id: pair.secondPlayer.id,
              login: pair.secondPlayer.login,
            },
            answers: secondPlayerAnswers,
            score: countSecondPlayer,
          }
        : null,
      questions: pair.questions
        ? pair.questions.map((question) => ({
            id: question.quizQuestion.id,
            body: question.quizQuestion.body,
          }))
        : null,
    };
  }
}
