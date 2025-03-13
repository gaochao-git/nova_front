'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode, themes } from './theme.config';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';

type Locale = 'zh_CN' | 'en_US';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  locale: Locale;
  toggleLocale: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'light',
  toggleTheme: () => {},
  locale: 'zh_CN',
  toggleLocale: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [locale, setLocale] = useState<Locale>('zh_CN');

  // 在客户端加载完成后初始化状态
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    const savedLocale = localStorage.getItem('locale') as Locale;
    
    setThemeMode(savedTheme || 'light');
    setLocale(savedLocale || 'zh_CN');
    setMounted(true);
  }, []);

  // 切换主题
  const toggleTheme = () => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // 切换语言
  const toggleLocale = () => {
    const newLocale = locale === 'zh_CN' ? 'en_US' : 'zh_CN';
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  // 应用主题到 body
  useEffect(() => {
    if (mounted) {
      document.body.setAttribute('data-theme', themeMode);
    }
  }, [themeMode, mounted]);

  // 避免服务端渲染闪烁
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, locale, toggleLocale }}>
      <ConfigProvider
        theme={themes[themeMode]}
        locale={locale === 'zh_CN' ? zhCN : enUS}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}; 