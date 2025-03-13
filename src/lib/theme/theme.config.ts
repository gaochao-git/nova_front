import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

const { darkAlgorithm, defaultAlgorithm, compactAlgorithm } = theme;

export type ThemeMode = 'light' | 'dark';

const commonToken = {
  borderRadius: 4,
  colorPrimary: '#1677ff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

export const themes: Record<ThemeMode, ThemeConfig> = {
  light: {
    token: {
      ...commonToken,
      colorBgLayout: '#f5f5f5',
    },
    algorithm: [defaultAlgorithm, compactAlgorithm],
    components: {
      Layout: {
        siderBg: '#fff',
        headerBg: '#fff',
      },
      Menu: {
        itemBg: 'transparent',
        subMenuItemBg: 'transparent',
        itemHeight: 48,
        itemMarginInline: 8,
      },
      Card: {
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      },
    },
  },
  dark: {
    token: {
      ...commonToken,
      colorBgLayout: '#0a0a0a',
      colorBgContainer: '#141414',
      colorBgElevated: '#1f1f1f',
      colorBorder: '#303030',
    },
    algorithm: [darkAlgorithm, compactAlgorithm],
    components: {
      Layout: {
        siderBg: '#141414',
        headerBg: '#141414',
      },
      Menu: {
        itemBg: 'transparent',
        subMenuItemBg: 'transparent',
        itemHeight: 48,
        itemMarginInline: 8,
        darkItemSelectedBg: 'rgba(255, 255, 255, 0.08)',
      },
      Card: {
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      },
      Button: {
        colorBorder: '#303030',
        colorBgTextHover: 'rgba(255, 255, 255, 0.03)',
        colorBgTextActive: 'rgba(255, 255, 255, 0.06)',
      },
    },
  },
}; 