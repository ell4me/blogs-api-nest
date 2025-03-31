import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { QuizQuestion } from '../../quiz-questions/infrastructure/quiz-question.entity';
import { PairQuiz } from '../../pairs-quiz/infrastructure/pair-quiz.entity';
import { User } from '../../../users/infrastructure/orm/user.entity';
import { AnswerStatus, TCreateAnswer } from '../pairs-quiz-answer.types';

@Entity()
export class PairQuizAnswer {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => QuizQuestion)
  quizQuestion: QuizQuestion;

  @Column()
  quizQuestionId: string;

  @ManyToOne(() => PairQuiz)
  pairQuiz: PairQuiz;

  @Column()
  pairQuizId: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  addedAt: Date;

  @Column({ type: 'enum', enum: AnswerStatus })
  status: AnswerStatus;

  static create({
    pairQuizId,
    quizQuestionId,
    userId,
    isCorrectAnswer,
  }: TCreateAnswer): PairQuizAnswer {
    const instance = new this();
    instance.id = Date.now().toString();
    instance.pairQuizId = pairQuizId;
    instance.quizQuestionId = quizQuestionId;
    instance.userId = userId;
    instance.status = isCorrectAnswer
      ? AnswerStatus.CORRECT
      : AnswerStatus.INCORRECT;

    return instance;
  }
}
