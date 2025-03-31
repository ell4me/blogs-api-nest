import { ArrayNotEmpty, IsBoolean, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export interface QuizQuestionViewDto {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class QuizQuestionCreateDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(10, 500)
  body: string;

  @ArrayNotEmpty()
  @Transform((arr) => arr.value.map((val) => String(val)))
  correctAnswers: string[];
}

export class QuizQuestionUpdateDto extends QuizQuestionCreateDto {}

export class QuizQuestionPublishDto {
  @IsBoolean()
  published: boolean;
}
