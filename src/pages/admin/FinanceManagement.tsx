import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Download,
  CalendarIcon,
  CreditCard,
  Wallet,
  PieChart,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface FinancialMetrics {
  totalRevenue: number;
  totalCommission: number;
  totalPayouts: number;
  netProfit: number;
  monthlyGrowth: number;
  pendingPayouts: number;
}

interface PayoutRequest {
  id: string;
  recipient_id: string;
  recipient_type: 'restaurant' | 'driver';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  business_name?: string;
  driver_name?: string;
}

export default function FinanceManagement() {
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    totalCommission: 0,
    totalPayouts: 0,
    netProfit: 0,
    monthlyGrowth: 0,
    pendingPayouts: 0
  });
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });

  useEffect(() => {
    fetchFinancialData();
    fetchPayoutRequests();
  }, [dateRange]);

  const fetchFinancialData = async () => {
    try {
      // Call financial management API
      const { data, error } = await supabase.functions.invoke('financial-management-api', {
        body: {
          start_date: dateRange.from.toISOString(),
          end_date: dateRange.to.toISOString()
        }
      });

      if (error) throw error;

      // Mock data for demonstration
      setMetrics({
        totalRevenue: 125430.50,
        totalCommission: 18814.58,
        totalPayouts: 106615.92,
        netProfit: 18814.58,
        monthlyGrowth: 15.4,
        pendingPayouts: 8
      });
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
    }
  };

  const fetchPayoutRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mock additional data for relations
      const formatted = data?.map(payout => ({
        ...payout,
        business_name: 'Ресторан',
        driver_name: 'Водитель'
      })) || [];

      setPayoutRequests(formatted as PayoutRequest[]);
    } catch (error) {
      console.error('Failed to fetch payout requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const processPayout = async (payoutId: string, action: 'approve' | 'reject') => {
    try {
      const { error } = await supabase.functions.invoke('financial-management-api', {
        body: {
          action: 'process-payout',
          payout_id: payoutId,
          status: action === 'approve' ? 'processing' : 'rejected'
        }
      });

      if (error) throw error;

      // Refresh payout requests
      fetchPayoutRequests();
    } catch (error) {
      console.error(`Failed to ${action} payout:`, error);
    }
  };

  const exportFinancialReport = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('financial-management-api', {
        body: {
          action: 'generate-report',
          start_date: dateRange.from.toISOString(),
          end_date: dateRange.to.toISOString(),
          format: 'pdf'
        }
      });

      if (error) throw error;

      // Mock download
      console.log('Financial report exported');
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Финансовое управление</h1>
          <p className="text-muted-foreground">
            Управление доходами, комиссиями и выплатами
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-80">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Выберите период</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  if (range?.from) {
                    setDateRange({
                      from: range.from,
                      to: range.to || range.from
                    });
                  }
                }}
                numberOfMonths={2}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <Button onClick={exportFinancialReport}>
            <Download className="mr-2 h-4 w-4" />
            Экспорт отчета
          </Button>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общий доход</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{metrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
              +{metrics.monthlyGrowth}% от прошлого месяца
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Комиссия платформы</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{metrics.totalCommission.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              15% от общего дохода
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Выплаты партнерам</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{metrics.totalPayouts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Ожидает: {metrics.pendingPayouts} заявок
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Чистая прибыль</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{metrics.netProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              После всех выплат
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payouts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payouts">Заявки на выплаты</TabsTrigger>
          <TabsTrigger value="transactions">Транзакции</TabsTrigger>
          <TabsTrigger value="reports">Отчеты</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
        </TabsList>

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ожидающие выплаты</CardTitle>
              <CardDescription>
                Заявки на выплаты от ресторанов и водителей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payoutRequests.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {payout.recipient_type === 'restaurant' ? (
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Wallet className="h-5 w-5 text-green-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {payout.recipient_type === 'restaurant' 
                            ? payout.business_name || 'Ресторан'
                            : payout.driver_name || 'Водитель'
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {payout.recipient_type === 'restaurant' ? 'Ресторан' : 'Водитель'} • 
                          {format(new Date(payout.created_at), 'dd.MM.yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">€{payout.amount.toFixed(2)}</p>
                        <Badge variant="outline">{payout.status}</Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => processPayout(payout.id, 'approve')}
                        >
                          Одобрить
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => processPayout(payout.id, 'reject')}
                        >
                          Отклонить
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {payoutRequests.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Нет ожидающих выплат
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>История транзакций</CardTitle>
              <CardDescription>
                Все финансовые операции в системе
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                История транзакций будет отображена здесь
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Финансовые отчеты</CardTitle>
              <CardDescription>
                Создание и экспорт финансовых отчетов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Генерация отчетов будет реализована здесь
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Финансовые настройки</CardTitle>
              <CardDescription>
                Настройка комиссий и параметров выплат
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform-commission">Комиссия платформы (%)</Label>
                  <Input id="platform-commission" defaultValue="15" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driver-commission">Комиссия водителя (%)</Label>
                  <Input id="driver-commission" defaultValue="8" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payout-threshold">Минимальная сумма выплаты (€)</Label>
                  <Input id="payout-threshold" defaultValue="50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payout-schedule">Расписание выплат</Label>
                  <Select defaultValue="weekly">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Ежедневно</SelectItem>
                      <SelectItem value="weekly">Еженедельно</SelectItem>
                      <SelectItem value="monthly">Ежемесячно</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button>Сохранить настройки</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}