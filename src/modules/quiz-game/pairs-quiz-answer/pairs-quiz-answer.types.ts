export enum AnswerStatus {
  CORRECT = 'Correct',
  INCORRECT = 'Incorrect',
}

export type TCreateAnswer = {
  userId: string;
  quizQuestionId: string;
  pairQuizId: string;
  isCorrectAnswer: boolean;
};
