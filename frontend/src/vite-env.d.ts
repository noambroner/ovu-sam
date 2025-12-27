/// <reference types="vite/client" />

// Override @ovu/sidebar types to add samApiUrl
declare module '@ovu/sidebar' {
  import { FC, ReactNode } from 'react';

  export type Language = 'en' | 'he' | 'ar';
  export type Theme = 'light' | 'dark';

  export interface MenuItem {
    id: string;
    label: string;
    labelEn?: string;
    path: string;
    icon?: ReactNode;
    order?: number;
    subItems?: MenuItem[];
  }

  export interface OVUApplication {
    id: string;
    code: string;
    name: string;
    icon: ReactNode;
    status: string;
    description?: string;
    frontendUrl?: string;
    menuItems?: MenuItem[];
    color?: string;
    navigation_items?: MenuItem[];
  }

  export interface SidebarConfig {
    currentApp: string;
    samApiUrl?: string;
    currentUser: {
      name: string;
      role: string;
      avatar?: string;
    };
    language: Language;
    theme: Theme;
    additionalMenuItems?: MenuItem[];
    onNavigate?: (path: string) => void;
    onAppSwitch?: (app: OVUApplication) => void;
    onLogout?: () => void;
    onToggleTheme?: () => void;
    onToggleLanguage?: () => void;
  }

  export interface SidebarProps {
    config: SidebarConfig;
    className?: string;
  }

  export const OVUSidebar: FC<SidebarProps>;
}

declare module 'sidebar/SidebarProvider' {
  import { FC, ReactNode } from 'react';

  interface SidebarProviderProps {
    children: ReactNode;
    config: any;
  }

  export const SidebarProvider: FC<SidebarProviderProps>;
  export const useSidebar: () => any;
}
