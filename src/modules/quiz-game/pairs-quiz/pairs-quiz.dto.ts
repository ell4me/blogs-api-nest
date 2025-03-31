import { AnswerViewDto } from '../pairs-quiz-answer/pairs-quiz-answer.dto';

import { PairQuizStatus } from './pairs-quiz.types';

export interface GamePairQuizViewDto {
  id: string;
  firstPlayerProgress: PlayerProgressViewDto;
  secondPlayerProgress: PlayerProgressViewDto | null;
  questions: QuestionViewDto[] | null;
  status: PairQuizStatus;
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishGameDate: Date | null;
}

interface PlayerProgressViewDto {
  answers: AnswerViewDto[];
  player: {
    id: string;
    login: string;
  };
  score: number;
}

interface QuestionViewDto {
  id: string;
  body: string;
}
