import { Metadata } from 'next';
import RootLayout from '@/components/layout/RootLayout';

export const metadata: Metadata = {
  title: '趋势预警 | 智能工厂',
  description: '基于Zabbix指标变化趋势进行预警',
};

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootLayout>{children}</RootLayout>;
} 