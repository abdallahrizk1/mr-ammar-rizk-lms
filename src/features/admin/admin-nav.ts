import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  CreditCard,
  Users,
  MessageSquare,
  Bell,
  Settings,
  ShieldAlert,
  History,
} from 'lucide-react';
import type { AdminUserSession } from './admin-types';

export interface AdminNavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  requiredPermission?: 'manage_courses' | 'manage_exams' | 'manage_payments' | 'manage_students' | 'manage_forum' | 'manage_settings';
  superAdminOnly?: boolean;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: '/admin', label: 'الرئيسية والإحصائيات', icon: LayoutDashboard },
  { href: '/admin/courses', label: 'باني الكورسات والأبواب', icon: BookOpen, requiredPermission: 'manage_courses' },
  { href: '/admin/exams', label: 'منشئ الامتحانات والواجبات', icon: FileCheck2, requiredPermission: 'manage_exams' },
  { href: '/admin/payments', label: 'المدفوعات والأكواد', icon: CreditCard, requiredPermission: 'manage_payments' },
  { href: '/admin/students', label: 'إدارة الطلاب والمتابعة', icon: Users, requiredPermission: 'manage_students' },
  { href: '/admin/forum', label: 'منتدى الأسئلة والردود', icon: MessageSquare, requiredPermission: 'manage_forum' },
  { href: '/admin/notifications', label: 'إرسال الإشعارات', icon: Bell, requiredPermission: 'manage_settings' },
  { href: '/admin/settings', label: 'إعدادات المنصة', icon: Settings, requiredPermission: 'manage_settings' },
  { href: '/admin/staff', label: 'إدارة المساعدين', icon: ShieldAlert, superAdminOnly: true },
  { href: '/admin/audit-logs', label: 'سجل المراقبة والمحذوفات', icon: History, superAdminOnly: true },
];

export function canAccessNavItem(item: AdminNavItem, user: AdminUserSession | null): boolean {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  if (item.superAdminOnly) return false;
  if (!item.requiredPermission) return true;
  return !!user.permissions[item.requiredPermission];
}
