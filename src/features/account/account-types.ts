export type AccountTabId =
  | 'profile'
  | 'security'
  | 'quizzes'
  | 'homework'
  | 'watch_history'
  | 'mistakes';

export interface AccountTabDefinition {
  id: AccountTabId;
  label: string;
  badge?: string | number;
}
