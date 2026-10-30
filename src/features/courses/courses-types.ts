export type CoursesFilterType = 'my_courses' | 'all' | 'suggested';

export interface CourseFilterOption {
  id: CoursesFilterType;
  label: string;
}
