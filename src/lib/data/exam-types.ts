export interface ExamQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  diagramTitle?: string;
  choices: [string, string, string, string];
  correctChoiceIndex: number;
  explanation: string;
}

export interface ExamResultSummary {
  id: string;
  examName: string;
  totalQuestions: number;
  score: number;
  percentage: number;
  solvedCount: number;
  correctCount: number;
  startTime: string;
  endTime: string;
  questions: ExamQuestion[];
  studentAnswers: Record<string, number>;
}

export interface StudentMistakeItem {
  id: string;
  category: 'quiz' | 'homework';
  sourceTitle: string;
  questionId: string;
  questionText: string;
  diagramTitle?: string;
  choices: [string, string, string, string];
  studentChoiceIndex: number;
  correctChoiceIndex: number;
  explanation: string;
}

export interface WatchHistoryItem {
  id: string;
  videoTitle: string;
  courseTitle: string;
  watchDuration: string;
  watchDate: string;
}
