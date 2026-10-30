export interface ExamState {
  answers: Record<string, number>; // questionId -> choiceIndex
  flagged: Record<string, boolean>; // questionId -> isFlagged
  remainingSeconds: number;
  isSubmitted: boolean;
}

export interface ExamSubmissionResult {
  totalQuestions: number;
  solvedCount: number;
  correctCount: number;
  score: number;
  percentage: number;
  isPassed: boolean;
}
