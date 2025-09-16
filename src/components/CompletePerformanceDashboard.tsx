import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PerformanceMetrics {
  totalOrders: number;
  totalRevenue: number;
  activeDrivers: number;
  avgDeliveryTime: number;
  completionRate: number;
  orderTrend: Array<{ date: string; orders: number; revenue: number }>;
  topDrivers: Array<{ id: string; name: string; deliveries: number; rating: number }>;
  recentAlerts: Array<{ id: string; type: string; message: string; severity: string }>;
}

export const CompletePerformanceDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    checkPermissionAndLoadData();
  }, [timeRange]);

  const checkPermissionAndLoadData = async () => {
    try {
      setLoading(true);

      // Check admin permissions
      const { data: canViewAnalytics, error: permError } = await supabase.rpc(
        'has_admin_permission',
        { permission_key: 'view_analytics' }
      );

      if (permError) {
        console.error('Permission check error:', permError);
        setHasPermission(false);
        return;
      }

      if (!canViewAnalytics) {
        setHasPermission(false);
        return;
      }

      setHasPermission(true);
      await loadMetrics();

    } catch (error) {
      console.error('Error loading performance data:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить данные производительности",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      // Load orders data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at, delivered_at, driver_id')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (ordersError) throw ordersError;

      // Load drivers data
      const { data: drivers, error: driversError } = await supabase
        .from('drivers')
        .select('id, user_id, first_name, last_name, rating, total_deliveries, is_active, status');

      if (driversError) throw driversError;

      // Load recent security alerts (limited for performance dashboard)
      const { data: alerts, error: alertsError } = await supabase
        .from('security_alerts')
        .select('id, alert_type, title, severity, created_at')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);

      if (alertsError) throw alertsError;

      // Calculate metrics
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0;
      const completedOrders = orders?.filter(order => order.status === 'delivered') || [];
      const completionRate = totalOrders > 0 ? (completedOrders.length / totalOrders) * 100 : 0;
      
      // Calculate average delivery time
      const deliveryTimes = completedOrders
        .filter(order => order.delivered_at && order.created_at)
        .map(order => {
          const created = new Date(order.created_at);
          const delivered = new Date(order.delivered_at!);
          return (delivered.getTime() - created.getTime()) / (1000 * 60); // minutes
        });
      
      const avgDeliveryTime = deliveryTimes.length > 0 
        ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length 
        : 0;

      // Create order trend data
      const orderTrend = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayOrders = orders?.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.toDateString() === date.toDateString();
        }) || [];
        
        return {
          date: date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
          orders: dayOrders.length,
          revenue: dayOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0)
        };
      }).reverse();

      // Top drivers
      const topDrivers = drivers
        ?.filter(driver => driver.is_active)
        .sort((a, b) => (b.total_deliveries || 0) - (a.total_deliveries || 0))
        .slice(0, 5)
        .map(driver => ({
          id: driver.user_id,
          name: `${driver.first_name} ${driver.last_name}`,
          deliveries: driver.total_deliveries || 0,
          rating: Number(driver.rating) || 0
        })) || [];

      // Format recent alerts
      const recentAlerts = alerts?.map(alert => ({
        id: alert.id,
        type: alert.alert_type,
        message: alert.title,
        severity: alert.severity
      })) || [];

      setMetrics({
        totalOrders,
        totalRevenue,
        activeDrivers: drivers?.filter(d => d.is_active && d.status === 'online').length || 0,
        avgDeliveryTime: Math.round(avgDeliveryTime),
        completionRate: Math.round(completionRate),
        orderTrend,
        topDrivers,
        recentAlerts
      });

    } catch (error) {
      console.error('Error calculating metrics:', error);
      throw error;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Панель производительности</h2>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Панель производительности</h2>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <p>У вас нет прав для просмотра аналитики производительности</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Панель производительности</h2>
        <Card className="p-4">
          <p>Не удалось загрузить данные производительности</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Панель производительности</h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 дней' : range === '30d' ? '30 дней' : '90 дней'}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Всего заказов</p>
                <p className="text-2xl font-bold">{metrics.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Выручка</p>
                <p className="text-2xl font-bold">€{metrics.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Активные курьеры</p>
                <p className="text-2xl font-bold">{metrics.activeDrivers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Среднее время доставки</p>
                <p className="text-2xl font-bold">{metrics.avgDeliveryTime} мин</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completion Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Показатель завершенности заказов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Завершено успешно</span>
              <span>{metrics.completionRate}%</span>
            </div>
            <Progress value={metrics.completionRate} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Тренды</TabsTrigger>
          <TabsTrigger value="drivers">Топ курьеры</TabsTrigger>
          <TabsTrigger value="alerts">Предупреждения</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Динамика заказов за последние 7 дней</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.orderTrend.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border-b">
                    <span className="font-medium">{day.date}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">{day.orders} заказов</span>
                      <span className="text-sm font-medium">€{day.revenue.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Лучшие курьеры</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.topDrivers.map((driver, index) => (
                  <div key={driver.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{driver.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {driver.deliveries} доставок • ⭐ {driver.rating.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Последние предупреждения безопасности
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.recentAlerts.length === 0 ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <p>Нет активных предупреждений</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {metrics.recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-2 border-b">
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <span className="text-sm">{alert.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompletePerformanceDashboard;