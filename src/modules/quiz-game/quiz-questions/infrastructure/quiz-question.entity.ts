import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

import {
  QuizQuestionCreateDto,
  QuizQuestionPublishDto,
  QuizQuestionUpdateDto,
} from '../quiz-questions.dto';
import { PairQuizQuestion } from '../../pairs-quiz-question/infrastructure/pair-quiz-question.entity';

@Entity()
export class QuizQuestion {
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

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'timestamp without time zone',
    nullable: true,
    default: null,
  })
  updatedAt: Date;

  updateQuestion({ body, correctAnswers }: QuizQuestionUpdateDto) {
    this.body = body;
    this.correctAnswers = correctAnswers;
    this.updatedAt = new Date();
  }

  updatePublishStatus({ published }: QuizQuestionPublishDto) {
    this.published = published;
    this.updatedAt = new Date();
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
