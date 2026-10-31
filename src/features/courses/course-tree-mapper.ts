import type { CourseModule, LectureMaterials } from '@/lib/data/courses-types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapTreeDataToModules(rawTree: any[]): CourseModule[] {
  if (!Array.isArray(rawTree)) return [];

  return rawTree.map((m: any, mIdx: number) => ({
    id: m.module_id || `mod-${mIdx}`,
    title: m.module_title || `الباب ${mIdx + 1}`,
    lectures: (m.lessons || []).map((l: any, lIdx: number) => {
      const vidItem = l.items?.find((i: any) => i.item_type === 'video');
      const pdfItem = l.items?.find((i: any) => i.item_type === 'pdf');
      const quizItem = l.items?.find((i: any) => i.item_type === 'quiz');
      const hwItem = l.items?.find((i: any) => i.item_type === 'homework');
      const solVid = l.items?.find((i: any) => i.item_type === 'solution_video');
      const solPdf = l.items?.find((i: any) => i.item_type === 'solution_pdf');

      return {
        id: l.lesson_id,
        order: lIdx + 1,
        title: l.title,
        description: 'شرح وتدريبات الباب مع مستر عمار',
        isUnlocked: !!l.is_unlocked,
        video: {
          title: vidItem?.title || `فيديو محاضرة: ${l.title}`,
          duration: `${Math.round((vidItem?.duration_seconds || 1800) / 60)} دقيقة`,
          durationSec: vidItem?.duration_seconds || 1800,
          hlsUrl: vidItem?.item_id || '/video/sample.m3u8',
        },
        pdf: {
          title: pdfItem?.title || `مذكرة الشرح: ${l.title}`,
          pagesCount: 16,
          fileUrl: '#',
          downloadUrl: '#',
        },
        quiz: {
          id: quizItem?.exam_id || quizItem?.item_id || `quiz-${l.lesson_id}`,
          title: quizItem?.title || 'كويز المحاضرة',
          description: 'كويز سريع لقياس فهم المحاضرة',
          questionsCount: 10,
          durationMinutes: 20,
          lowestScore: 5,
          avgScore: 8,
          highestScore: 10,
          attemptsCount: 1,
          completionsCount: 1,
          passingScorePercent: 50,
          isPassed: false,
        },
        homework: {
          id: hwItem?.exam_id || hwItem?.item_id || `hw-${l.lesson_id}`,
          title: hwItem?.title || 'واجب المحاضرة',
          description: 'تطبيق عملي وأسئلة مستويات عليا',
          questionsCount: 15,
          totalGrade: 15,
          isSubmitted: false,
        },
        solution: {
          quizVideoTitle: solVid?.title || 'فيديو حل الكويز',
          quizVideoUrl: solVid?.item_id || '',
          quizPdfTitle: solPdf?.title || 'ملف نموذج الإجابة',
          quizPdfUrl: solPdf?.item_id || '',
          homeworkVideoTitle: '',
          homeworkVideoUrl: '',
          homeworkPdfTitle: '',
          homeworkPdfUrl: '',
        },
      } as LectureMaterials;
    }),
  }));
}
