import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RestaurantAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  averageRating: number;
  totalReviews: number;
  revenueGrowth: number;
  orderGrowth: number;
  returningCustomers: number;
  conversionRate: number;
  ordersPerDay: number;
  averageCookTime: number;
  revenueByDay: Array<{ date: string; revenue: number }>;
  popularItems: Array<{ name: string; orders: number }>;
  ordersByHour: Array<{ time: string; orders: number }>;
  orderSources: Array<{ name: string; value: number }>;
}

export const useRestaurantAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<RestaurantAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
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

      // Fetch orders for analytics
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .eq('payment_status', 'completed');

      // Fetch reviews
      const { data: reviews } = await supabase
        .rpc('get_restaurant_reviews', { restaurant_id_param: restaurant.id });

      // Calculate analytics
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const totalOrders = orders?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const averageRating = reviews?.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

      // Mock data for demo
      const mockAnalytics: RestaurantAnalytics = {
        totalRevenue: Math.round(totalRevenue),
        totalOrders,
        averageOrderValue: Math.round(averageOrderValue),
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews: reviews?.length || 0,
        revenueGrowth: 12.5,
        orderGrowth: 8.3,
        returningCustomers: 65,
        conversionRate: 15.2,
        ordersPerDay: Math.round(totalOrders / 30) || 8,
        averageCookTime: 25,
        revenueByDay: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 500) + 200
        })),
        popularItems: [
          { name: 'Пицца Маргарита', orders: 45 },
          { name: 'Паста Карбонара', orders: 38 },
          { name: 'Салат Цезарь', orders: 32 },
          { name: 'Суп дня', orders: 28 },
          { name: 'Тирамису', orders: 25 }
        ],
        ordersByHour: [
          { time: '12:00', orders: 15 },
          { time: '13:00', orders: 28 },
          { time: '14:00', orders: 22 },
          { time: '18:00', orders: 35 },
          { time: '19:00', orders: 42 },
          { time: '20:00', orders: 38 },
          { time: '21:00', orders: 25 }
        ],
        orderSources: [
          { name: 'Мобильное приложение', value: 45 },
          { name: 'Веб-сайт', value: 30 },
          { name: 'Телефон', value: 15 },
          { name: 'В ресторане', value: 10 }
        ]
      };

      setAnalytics(mockAnalytics);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error instanceof Error ? error.message : 'Ошибка загрузки аналитики');
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = () => {
    fetchAnalytics();
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  return {
    analytics,
    loading,
    error,
    refreshAnalytics,
  };
};