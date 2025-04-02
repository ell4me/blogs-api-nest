import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

import { PairQuizStatus } from '../pairs-quiz.types';
import { User } from '../../../users/infrastructure/orm/user.entity';
import { PairQuizQuestion } from '../../pairs-quiz-question/infrastructure/pair-quiz-question.entity';

@Entity()
export class PairQuiz {
  @PrimaryColumn()
  id: string;

  @Index()
  @Column({ type: 'enum', enum: PairQuizStatus })
  status: PairQuizStatus;

  @CreateDateColumn()
  pairCreatedDate: Date;

  @Column({ type: 'timestamp without time zone', nullable: true })
  startGameDate: Date | null;

  @Column({ type: 'timestamp without time zone', nullable: true })
  finishGameDate: Date | null;

  @ManyToOne(() => User)
  firstPlayer: User;

  @Column()
  firstPlayerId: string;

  @ManyToOne(() => User, { nullable: true })
  secondPlayer: User | null;

  @Column({ nullable: true })
  secondPlayerId: string | null;

  @OneToMany(() => PairQuizQuestion, (pqq) => pqq.pairQuiz)
  questions: PairQuizQuestion[];

  updateStatus(status: PairQuizStatus): PairQuiz {
    this.status = status;
    this.finishGameDate = new Date();

    return this;
  }

  static create(userId: string): PairQuiz {
    const instance = new this();
    instance.firstPlayerId = userId;
    instance.id = Date.now().toString();
    instance.status = PairQuizStatus.PENDING_SECOND_PLAYER;

    return instance;
  }

  addSecondPlayer(userId: string): PairQuiz {
    this.secondPlayerId = userId;
    this.status = PairQuizStatus.ACTIVE;
    this.startGameDate = new Date();

    return this;
  }
}
