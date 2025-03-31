import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import { QuizQuestion } from '../../quiz-questions/infrastructure/quiz-question.entity';
import { PairQuiz } from '../../pairs-quiz/infrastructure/pair-quiz.entity';

@Entity()
export class PairQuizQuestion {
  @ManyToOne(() => QuizQuestion, (qq) => qq.pairsQuiz)
  quizQuestion: QuizQuestion;

  @PrimaryColumn()
  quizQuestionId: string;

  @ManyToOne(() => PairQuiz, (pq) => pq.questions)
  pairQuiz: PairQuiz;

  @PrimaryColumn()
  pairQuizId: string;

  @CreateDateColumn()
  addedAt: Date;

  static create({
    pairId,
    questionId,
  }: {
    pairId: string;
    questionId: string;
  }): PairQuizQuestion {
    const instance = new this();
    instance.quizQuestionId = questionId;
    instance.pairQuizId = pairId;

    return instance;
  }
}
