import React from 'react';
import type { Metadata } from 'next';
import { AdminDashboardOverview } from '@/features/admin/AdminDashboardOverview';

export const metadata: Metadata = {
  title: 'لوحة التحكم الرئيسية | منصة مستر عمار رزق',
  description: 'نظرة عامة وإحصائيات الطلاب والمدفوعات والمحتوى التعليمي',
};

export default function AdminDashboardPage() {
  return <AdminDashboardOverview />;
}
