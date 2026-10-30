export type ForumTabId = 'private' | 'public' | 'pending';

export interface ForumTabItem {
  id: ForumTabId;
  label: string;
  badge?: number;
}
