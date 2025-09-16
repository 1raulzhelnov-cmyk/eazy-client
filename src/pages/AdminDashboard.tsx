import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  DollarSign, 
  ShoppingBag, 
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  FileText,
  Settings,
  BarChart3,
  Megaphone,
  Flag,
  HelpCircle
} from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeRestaurants: number;
  pendingApplications: number;
  activeDisputes: number;
  unreadMessages: number;
  systemAlerts: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeRestaurants: 0,
    pendingApplications: 0,
    activeDisputes: 0,
    unreadMessages: 0,
    systemAlerts: 0
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    fetchDashboardStats();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!error && data) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Admin check failed:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Fetch various dashboard statistics
      const [
        { count: totalUsers },
        { count: totalOrders },
        { count: activeRestaurants },
        { count: pendingApplications }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('restaurants').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('driver_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      // Calculate revenue from completed orders
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'completed');

      const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        totalOrders: totalOrders || 0,
        totalRevenue,
        activeRestaurants: activeRestaurants || 0,
        pendingApplications: pendingApplications || 0,
        activeDisputes: 0, // Would be implemented with disputes table
        unreadMessages: 0, // Would be calculated from admin messages
        systemAlerts: 0 // Would be calculated from security alerts
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Требуется авторизация</CardTitle>
            <CardDescription>Пожалуйста, войдите в систему для доступа к админ-панели</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-destructive">Доступ запрещен</CardTitle>
            <CardDescription>У вас нет административных прав для доступа к этой панели</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <AdminSidebar />
        
        <main className="flex-1 space-y-6 p-8 overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Административная панель</h1>
              <p className="text-muted-foreground">
                Добро пожаловать в центр управления платформой
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% от прошлого месяца
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Общий доход</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +15.4% от прошлого месяца
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Заказы</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +7.2% от прошлого месяца
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Активные рестораны</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeRestaurants.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12.3% от прошлого месяца
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Alert Section */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                <CardTitle className="text-sm font-medium text-orange-800">
                  Ожидающие заявки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">{stats.pendingApplications}</div>
                <Button variant="outline" size="sm" className="mt-2 border-orange-300 text-orange-700">
                  Просмотреть
                </Button>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Flag className="h-4 w-4 text-red-600 mr-2" />
                <CardTitle className="text-sm font-medium text-red-800">
                  Активные споры
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-900">{stats.activeDisputes}</div>
                <Button variant="outline" size="sm" className="mt-2 border-red-300 text-red-700">
                  Разрешить
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <MessageSquare className="h-4 w-4 text-blue-600 mr-2" />
                <CardTitle className="text-sm font-medium text-blue-800">
                  Новые сообщения
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{stats.unreadMessages}</div>
                <Button variant="outline" size="sm" className="mt-2 border-blue-300 text-blue-700">
                  Прочитать
                </Button>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <AlertTriangle className="h-4 w-4 text-purple-600 mr-2" />
                <CardTitle className="text-sm font-medium text-purple-800">
                  Системные предупреждения
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">{stats.systemAlerts}</div>
                <Button variant="outline" size="sm" className="mt-2 border-purple-300 text-purple-700">
                  Проверить
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Недавние заказы</CardTitle>
                <CardDescription>Последние 5 заказов в системе</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="text-sm font-medium">Заказ #{1000 + i}</p>
                        <p className="text-xs text-muted-foreground">Ресторан: Пицца Маркет</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">€{(25.50 + i * 3).toFixed(2)}</p>
                        <Badge variant="outline" className="text-xs">
                          Завершен
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Системные события</CardTitle>
                <CardDescription>Последние действия в системе</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">Новый ресторан зарегистрирован</p>
                      <p className="text-xs text-muted-foreground">5 минут назад</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">Обновлены настройки платежей</p>
                      <p className="text-xs text-muted-foreground">15 минут назад</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">Новая заявка водителя</p>
                      <p className="text-xs text-muted-foreground">30 минут назад</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">Создан новый спор</p>
                      <p className="text-xs text-muted-foreground">1 час назад</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
              <CardDescription>Часто используемые функции администрирования</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Экспорт отчета</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <Megaphone className="h-6 w-6" />
                  <span className="text-sm">Создать объявление</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <Settings className="h-6 w-6" />
                  <span className="text-sm">Настройки системы</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <HelpCircle className="h-6 w-6" />
                  <span className="text-sm">Поддержка</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
}