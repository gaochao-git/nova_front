'use client';

import RootLayout from '@/components/layout/RootLayout';
import TaskManagement from '@/components/features/task/TaskManagement';

export default function TaskPage() {
  return (
    <RootLayout>
      <TaskManagement />
    </RootLayout>
  );
} 