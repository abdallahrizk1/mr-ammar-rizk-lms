export interface LectureMaterials {
  id: string;
  order: number;
  title: string;
  description: string;
  isUnlocked: boolean;
  video: {
    title: string;
    duration: string;
    durationSec: number;
    hlsUrl: string;
  };
  pdf: {
    title: string;
    pagesCount: number;
    fileUrl: string;
    downloadUrl: string;
  };
  quiz: {
    id: string;
    title: string;
    description: string;
    questionsCount: number;
    durationMinutes: number;
    lowestScore: number;
    avgScore: number;
    highestScore: number;
    attemptsCount: number;
    completionsCount: number;
    passingScorePercent: number;
    isPassed: boolean;
    studentScore?: number;
  };
  homework: {
    id: string;
    title: string;
    description: string;
    questionsCount: number;
    totalGrade: number;
    isSubmitted: boolean;
    studentScore?: number;
  };
  solution: {
    quizVideoTitle: string;
    quizVideoUrl: string;
    quizPdfTitle: string;
    quizPdfUrl: string;
    homeworkVideoTitle: string;
    homeworkVideoUrl: string;
    homeworkPdfTitle: string;
    homeworkPdfUrl: string;
  };
}

export interface CourseModule {
  id: string;
  title: string;
  lectures: LectureMaterials[];
}

export interface CourseItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  grade: string;
  price: number;
  priceFormatted: string;
  isComprehensive?: boolean;
  isEnrolled: boolean;
  isTemporary?: boolean;
  isSuggested?: boolean;
  progress: number;
  bannerImage: string;
  lecturesCount: number;
  modules: CourseModule[];
}
