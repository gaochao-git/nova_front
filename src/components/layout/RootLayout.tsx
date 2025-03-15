'use client';

import { Layout, Menu, theme, Button, Avatar, Space, Tooltip } from 'antd';
import { ReactNode, useState, useMemo } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RobotOutlined,
  DashboardOutlined,
  ToolOutlined,
  AlertOutlined,
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  QuestionCircleOutlined,
  AppstoreOutlined,
  TranslationOutlined,
  SunOutlined,
  MoonOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme/theme.context';
import { messages } from '@/lib/locale/messages';
import type { CSSProperties } from 'react';

const { Header, Content, Sider } = Layout;

interface IRootLayoutProps {
  children: ReactNode;
}

interface StylesType {
  layout: CSSProperties;
  sider: CSSProperties;
  header: CSSProperties;
  content: CSSProperties;
}

const RootLayout: React.FC<IRootLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { themeMode, toggleTheme, locale, toggleLocale } = useTheme();
  const { token } = theme.useToken();

  const t = useMemo(() => messages[locale], [locale]);

  const menuItems = [
    {
      key: '/chat',
      icon: <RobotOutlined />,
      label: t.menu.assistant,
    },
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: t.menu.dashboard,
    },
    {
      key: '/tools',
      icon: <ToolOutlined />,
      label: t.menu.tools,
    },
    {
      key: '/alerts',
      icon: <AlertOutlined />,
      label: t.menu.alerts,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: t.menu.settings,
    },
  ];

  const styles = useMemo<StylesType>(() => ({
    layout: {
      height: '100vh',
    },
    sider: {
      position: 'fixed' as const,
      left: 0,
      top: 0,
      bottom: 0,
      background: token.colorBgContainer,
      borderRight: `1px solid ${token.colorBorder}`,
      zIndex: 100,
    },
    header: {
      height: 48,
      lineHeight: '48px',
      padding: 0,
      background: token.colorBgContainer,
      borderBottom: `1px solid ${token.colorBorder}`,
      position: 'sticky' as const,
      top: 0,
      zIndex: 99,
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    content: {
      height: 'calc(100vh - 48px)',
      background: token.colorBgLayout,
      overflow: 'auto',
      padding: token.padding,
    },
  }), [token]);

  return (
    <Layout style={styles.layout}>
      <Sider trigger={null} collapsible collapsed={collapsed} style={styles.sider}>
        <div 
          className="h-14 flex items-center justify-center border-b"
          style={{ borderColor: token.colorBorder }}
        >
          <div className="flex items-center gap-2">
            <AppstoreOutlined style={{ fontSize: '1.125rem', color: token.colorPrimary }} />
            <span className={`text-base font-bold transition-all duration-200 ${
              collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
            }`}
              style={{ color: token.colorText }}
            >
              {messages[locale].header.title}
            </span>
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems.map(item => ({
            ...item,
            label: <Link href={item.key}>{item.label}</Link>
          }))}
          style={{
            border: 'none',
            flex: 1,
            overflow: 'auto'
          }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={styles.header}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ width: 48, height: 48 }}
          />
          <Space size={16} className="px-4">
            <Button
              type="text"
              icon={<TranslationOutlined />}
              onClick={toggleLocale}
            />
            <Button
              type="text"
              icon={themeMode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
            />
            <Button type="text" icon={<BellOutlined />} />
            <Button type="text" icon={<QuestionCircleOutlined />} />
            <Button type="text" icon={<UserOutlined />} />
          </Space>
        </Header>
        <Content style={styles.content}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default RootLayout; 