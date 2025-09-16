import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RestaurantOrder {
  id: string;
  order_number: string;
  user_id: string;
  items: any;
  total_amount: number;
  delivery_address: any;
  customer_info: any;
  special_instructions?: string;
  status: string;
  payment_status: string;
  payment_method: string;
  estimated_delivery_time?: string;
  pickup_time?: string;
  delivery_started_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderStats {
  newOrders: number;
  inProgress: number;
  completedToday: number;
  todayRevenue: number;
}

export const useRestaurantOrders = (restaurantId?: string) => {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOrders = async () => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
      calculateStats(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Ошибка загрузки заказов');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orderData: RestaurantOrder[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orderData.filter(order => 
      new Date(order.created_at) >= today
    );

    const newOrders = orderData.filter(order => 
      order.status === 'pending' || order.status === 'confirmed'
    ).length;

    const inProgress = orderData.filter(order => 
      order.status === 'preparing' || order.status === 'ready' || order.status === 'picked_up'
    ).length;

    const completedToday = todayOrders.filter(order => 
      order.status === 'delivered'
    ).length;

    const todayRevenue = todayOrders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + Number(order.total_amount), 0);

    setStats({
      newOrders,
      inProgress,
      completedToday,
      todayRevenue: Math.round(todayRevenue * 100) / 100
    });
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status, updated_at: new Date().toISOString() }
          : order
      ));

      toast({
        title: "Статус заказа обновлен",
        description: `Заказ переведен в статус: ${getStatusLabel(status)}`
      });

      // Recalculate stats
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      );
      calculateStats(updatedOrders);

    } catch (err) {
      console.error('Error updating order status:', err);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус заказа",
        variant: "destructive"
      });
      throw err;
    }
  };

  const getStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
      'pending': 'Ожидает подтверждения',
      'confirmed': 'Подтвержден',
      'preparing': 'Готовится',
      'ready': 'Готов к выдаче',
      'picked_up': 'Забран курьером',
      'in_transit': 'В доставке',
      'delivered': 'Доставлен',
      'cancelled': 'Отменен'
    };
    return statusLabels[status] || status;
  };

  const getOrderStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'preparing': 'bg-orange-100 text-orange-800',
      'ready': 'bg-green-100 text-green-800',
      'picked_up': 'bg-purple-100 text-purple-800',
      'in_transit': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    if (restaurantId) {
      fetchOrders();

      // Set up real-time subscription
      const subscription = supabase
        .channel('restaurant-orders')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `restaurant_id=eq.${restaurantId}`
          },
          () => {
            fetchOrders(); // Refresh orders when changes occur
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [restaurantId]);

  return {
    orders,
    stats,
    loading,
    error,
    updateOrderStatus,
    getStatusLabel,
    getOrderStatusColor,
    refreshOrders: fetchOrders
  };
};