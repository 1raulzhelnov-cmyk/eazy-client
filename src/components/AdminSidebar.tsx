import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  DollarSign,
  FileEdit,
  Flag,
  Megaphone,
  Settings,
  FileBarChart,
  MessageSquare,
  HelpCircle,
  Users,
  ShoppingBag,
  Shield,
  TrendingUp
} from 'lucide-react';

const menuItems = [
  {
    title: 'Главная',
    url: '/admin',
    icon: LayoutDashboard,
    group: 'Основное'
  },
  {
    title: 'Финансы',
    url: '/admin/finances',
    icon: DollarSign,
    group: 'Управление'
  },
  {
    title: 'Контент',
    url: '/admin/content',
    icon: FileEdit,
    group: 'Управление'
  },
  {
    title: 'Споры',
    url: '/admin/disputes',
    icon: Flag,
    group: 'Управление'
  },
  {
    title: 'Кампании',
    url: '/admin/campaigns',
    icon: Megaphone,
    group: 'Маркетинг'
  },
  {
    title: 'Отчеты',
    url: '/admin/reports',
    icon: FileBarChart,
    group: 'Аналитика'
  },
  {
    title: 'Коммуникации',
    url: '/admin/communications',
    icon: MessageSquare,
    group: 'Коммуникации'
  },
  {
    title: 'Поддержка',
    url: '/admin/support',
    icon: HelpCircle,
    group: 'Поддержка'
  },
  {
    title: 'Пользователи',
    url: '/admin/users',
    icon: Users,
    group: 'Система'
  },
  {
    title: 'Рестораны',
    url: '/admin/restaurants',
    icon: ShoppingBag,
    group: 'Система'
  },
  {
    title: 'Безопасность',
    url: '/admin/security',
    icon: Shield,
    group: 'Система'
  },
  {
    title: 'Настройки',
    url: '/admin/settings',
    icon: Settings,
    group: 'Система'
  }
];

const groupedItems = menuItems.reduce((acc, item) => {
  if (!acc[item.group]) {
    acc[item.group] = [];
  }
  acc[item.group].push(item);
  return acc;
}, {} as Record<string, typeof menuItems>);

export function AdminSidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className="border-r">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Admin Panel</span>
        </div>
        <SidebarTrigger />
      </div>

      <SidebarContent>
        {Object.entries(groupedItems).map(([groupName, items]) => (
          <SidebarGroup key={groupName}>
            <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
              {groupName}
            </SidebarGroupLabel>
            
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={
                          isActive(item.url)
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}