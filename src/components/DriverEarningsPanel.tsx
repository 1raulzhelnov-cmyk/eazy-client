import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, DollarSign, TrendingUp, Clock, Package2 } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface EarningsData {
  totalEarnings: number;
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  totalDeliveries: number;
  todayDeliveries: number;
  avgRating: number;
  hoursWorked: number;
}

interface DeliveryStats {
  date: string;
  earnings: number;
  deliveries: number;
  hours: number;
}

interface DriverEarningsPanelProps {
  demoMode?: boolean;
}

const DriverEarningsPanel = ({ demoMode = false }: DriverEarningsPanelProps) => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<EarningsData>({
    totalEarnings: 0,
    todayEarnings: 0,
    weekEarnings: 0,
    monthEarnings: 0,
    totalDeliveries: 0,
    todayDeliveries: 0,
    avgRating: 5.0,
    hoursWorked: 0
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dailyStats, setDailyStats] = useState<DeliveryStats[]>([]);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (demoMode) {
      // Загружаем демо данные
      setEarnings({
        totalEarnings: 486.50,
        todayEarnings: 65.20,
        weekEarnings: 324.80,
        monthEarnings: 486.50,
        totalDeliveries: 45,
        todayDeliveries: 6,
        avgRating: 4.8,
        hoursWorked: 7
      });
      setLoading(false);
    } else if (user) {
      fetchEarningsData();
      fetchDailyStats();
    }
  }, [user, selectedDate, period, demoMode]);

  const fetchEarningsData = async () => {
    try {
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const monthStart = startOfMonth(today);

      // Получаем заказы курьера
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('driver_id', (await getDriverId()))
        .eq('status', 'delivered');

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      if (!orders) return;

      // Расчет заработков
      const totalEarnings = orders.reduce((sum, order) => {
        return sum + (order.total_amount * 0.15); // 15% от заказа
      }, 0);

      const todayEarnings = orders
        .filter(order => 
          new Date(order.delivered_at!).toDateString() === today.toDateString()
        )
        .reduce((sum, order) => sum + (order.total_amount * 0.15), 0);

      const weekEarnings = orders
        .filter(order => 
          new Date(order.delivered_at!) >= weekStart
        )
        .reduce((sum, order) => sum + (order.total_amount * 0.15), 0);

      const monthEarnings = orders
        .filter(order => 
          new Date(order.delivered_at!) >= monthStart
        )
        .reduce((sum, order) => sum + (order.total_amount * 0.15), 0);

      const todayDeliveries = orders.filter(order => 
        new Date(order.delivered_at!).toDateString() === today.toDateString()
      ).length;

      setEarnings({
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        todayEarnings: Math.round(todayEarnings * 100) / 100,
        weekEarnings: Math.round(weekEarnings * 100) / 100,
        monthEarnings: Math.round(monthEarnings * 100) / 100,
        totalDeliveries: orders.length,
        todayDeliveries,
        avgRating: 4.8, // Можно получить из отзывов
        hoursWorked: Math.floor(Math.random() * 8) + 1 // Заглушка
      });

    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDriverId = async () => {
    const { data } = await supabase
      .from('drivers')
      .select('id')
      .eq('user_id', user?.id)
      .single();
    return data?.id;
  };

  const fetchDailyStats = async () => {
    // Заглушка для дневной статистики
    const stats: DeliveryStats[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      stats.push({
        date: format(date, 'yyyy-MM-dd'),
        earnings: Math.floor(Math.random() * 50) + 20,
        deliveries: Math.floor(Math.random() * 8) + 2,
        hours: Math.floor(Math.random() * 6) + 2
      });
    }
    setDailyStats(stats);
  };

  const getCurrentPeriodEarnings = () => {
    switch (period) {
      case 'today':
        return earnings.todayEarnings;
      case 'week':
        return earnings.weekEarnings;
      case 'month':
        return earnings.monthEarnings;
      default:
        return earnings.todayEarnings;
    }
  };

  const getCurrentPeriodLabel = () => {
    switch (period) {
      case 'today':
        return 'Сегодня';
      case 'week':
        return 'На этой неделе';
      case 'month':
        return 'В этом месяце';
      default:
        return 'Сегодня';
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Загрузка данных о заработках...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex space-x-2">
        {(['today', 'week', 'month'] as const).map((p) => (
          <Button
            key={p}
            variant={period === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(p)}
          >
            {p === 'today' && 'Сегодня'}
            {p === 'week' && 'Неделя'}
            {p === 'month' && 'Месяц'}
          </Button>
        ))}
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {getCurrentPeriodLabel()}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {getCurrentPeriodEarnings()}€
            </div>
            <p className="text-xs text-muted-foreground">
              +12% по сравнению с прошлым периодом
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Доставки {period === 'today' ? 'сегодня' : 'всего'}
            </CardTitle>
            <Package2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {period === 'today' ? earnings.todayDeliveries : earnings.totalDeliveries}
            </div>
            <p className="text-xs text-muted-foreground">
              Средний чек: {earnings.totalDeliveries > 0 ? Math.round((earnings.totalEarnings / earnings.totalDeliveries) * 6.67) : 0}€
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Рейтинг</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnings.avgRating}</div>
            <p className="text-xs text-muted-foreground">
              ⭐ Отличная работа!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Часы работы</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnings.hoursWorked}ч</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(getCurrentPeriodEarnings() / Math.max(earnings.hoursWorked, 1))}€/час
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Stats */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Статистика за неделю</CardTitle>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: ru }) : <span>Выберите дату</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date || new Date());
                    setIsCalendarOpen(false);
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dailyStats.map((stat, index) => (
              <div key={stat.date} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm font-medium">
                    {format(new Date(stat.date), 'dd MMMM', { locale: ru })}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <Badge variant="outline">{stat.deliveries} заказов</Badge>
                  <span className="text-muted-foreground">{stat.hours}ч</span>
                  <span className="font-medium text-green-600">{stat.earnings}€</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start" variant="outline">
            <DollarSign className="mr-2 h-4 w-4" />
            Запросить выплату
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <TrendingUp className="mr-2 h-4 w-4" />
            Подробная аналитика
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Clock className="mr-2 h-4 w-4" />
            История смен
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverEarningsPanel;