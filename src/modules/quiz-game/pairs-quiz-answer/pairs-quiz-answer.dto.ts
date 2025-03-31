import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

import { AnswerStatus } from './pairs-quiz-answer.types';

export interface AnswerViewDto {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: Date;
}

export class SendAnswerDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  answer: string;
}
