import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

import { DateTimestampEntity } from '../../../../common/helpers/date-timestamp';
import {
  QuizQuestionCreateDto,
  QuizQuestionPublishDto,
  QuizQuestionUpdateDto,
} from '../quiz-questions.dto';
import { PairQuizQuestion } from '../../pairs-quiz-question/infrastructure/pair-quiz-question.entity';

@Entity()
export class QuizQuestion extends DateTimestampEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  body: string;

  @Column()
  published: boolean;

  @Column({ type: 'text', array: true })
  correctAnswers: string[];

  @OneToMany(() => PairQuizQuestion, (pqq) => pqq.quizQuestion)
  pairsQuiz: PairQuizQuestion[];

  updateQuestion({ body, correctAnswers }: QuizQuestionUpdateDto) {
    this.body = body;
    this.correctAnswers = correctAnswers;
  }

  updatePublishStatus({ published }: QuizQuestionPublishDto) {
    this.published = published;
  }

  static create({ body, correctAnswers }: QuizQuestionCreateDto): QuizQuestion {
    const instance = new this();
    instance.id = Date.now().toString();
    instance.body = body;
    instance.correctAnswers = correctAnswers;
    instance.published = false;

    return instance;
  }
}
