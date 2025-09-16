import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface FinancialStats {
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  pendingPayouts: number;
  completedPayouts: number;
  stripeConnectStatus: string;
  revenueByDay: Array<{ date: string; amount: number; orders: number }>;
}

export interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  arrival_date: string;
}

export const useRestaurantFinances = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get restaurant ID
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!restaurant) return;

      // Fetch orders for financial calculations
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, created_at, status, payment_status')
        .eq('restaurant_id', restaurant.id)
        .eq('payment_status', 'completed');

      if (ordersError) throw ordersError;

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const todayRevenue = orders?.filter(order => order.created_at.startsWith(today))
        .reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const weekRevenue = orders?.filter(order => order.created_at >= weekAgo)
        .reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const monthRevenue = orders?.filter(order => order.created_at >= monthAgo)
        .reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      // Group by day for chart
      const revenueByDay = orders?.reduce((acc: Record<string, { amount: number; orders: number }>, order) => {
        const date = order.created_at.split('T')[0];
        if (!acc[date]) {
          acc[date] = { amount: 0, orders: 0 };
        }
        acc[date].amount += Number(order.total_amount);
        acc[date].orders += 1;
        return acc;
      }, {});

      const chartData = Object.entries(revenueByDay || {})
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30); // Last 30 days

      setStats({
        totalRevenue,
        todayRevenue,
        weekRevenue,
        monthRevenue,
        totalOrders: orders?.length || 0,
        averageOrderValue: orders?.length ? totalRevenue / orders.length : 0,
        pendingPayouts: 0, // Would be fetched from Stripe
        completedPayouts: 0, // Would be fetched from Stripe
        stripeConnectStatus: 'not_connected', // Would be checked with Stripe
        revenueByDay: chartData,
      });

    } catch (error) {
      console.error('Error fetching financial stats:', error);
      setError(error instanceof Error ? error.message : 'Ошибка загрузки финансовых данных');
    } finally {
      setLoading(false);
    }
  };

  const connectStripe = async () => {
    try {
      // This would create a Stripe Connect account link
      const { data, error } = await supabase.functions.invoke('create-stripe-connect-account');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error connecting Stripe:', error);
      setError('Ошибка подключения к Stripe');
    }
  };

  useEffect(() => {
    fetchFinancialStats();
  }, [user]);

  return {
    stats,
    payouts,
    loading,
    error,
    refreshStats: fetchFinancialStats,
    connectStripe,
  };
};