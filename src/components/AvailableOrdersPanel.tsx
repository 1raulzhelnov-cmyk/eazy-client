import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, DollarSign, Route, Car, Bike, Timer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AvailableOrder {
  id: string;
  order_number: string;
  restaurant_name: string;
  restaurant_address: string;
  delivery_address: any;
  total_amount: number;
  estimated_delivery_time: string;
  distance: number;
  estimated_payment: number;
  created_at: string;
  preparation_time: number;
  customer_info: any;
}

const AvailableOrdersPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [availableOrders, setAvailableOrders] = useState<AvailableOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchAvailableOrders();
      subscribeToNewOrders();
    }
  }, [user]);

  const fetchAvailableOrders = async () => {
    try {
      // Получаем заказы готовые к забору
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'ready_for_pickup')
        .is('driver_id', null)
        .order('created_at', { ascending: true })
        .limit(10);

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      // Преобразуем в нужный формат с расчетами
      const processedOrders: AvailableOrder[] = (orders || []).map(order => ({
        id: order.id,
        order_number: order.order_number,
        restaurant_name: getRestaurantName(order.items),
        restaurant_address: getRestaurantAddress(order.items),
        delivery_address: order.delivery_address,
        total_amount: order.total_amount,
        estimated_delivery_time: order.estimated_delivery_time || '',
        distance: calculateDistance(order.delivery_address),
        estimated_payment: Math.round(order.total_amount * 0.15 * 100) / 100,
        created_at: order.created_at,
        preparation_time: 15, // Заглушка
        customer_info: order.customer_info
      }));

      setAvailableOrders(processedOrders);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNewOrders = () => {
    const channel = supabase
      .channel('available-orders')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: 'status=eq.ready_for_pickup'
        },
        (payload) => {
          // Обновить список заказов
          fetchAvailableOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const acceptOrder = async (orderId: string) => {
    setProcessingOrders(prev => new Set([...prev, orderId]));

    try {
      // Получаем ID курьера
      const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!driver) {
        throw new Error('Driver profile not found');
      }

      // Назначаем заказ курьеру
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'assigned',
          driver_id: driver.id
        })
        .eq('id', orderId)
        .eq('status', 'ready_for_pickup'); // Проверяем, что заказ все еще доступен

      if (error) {
        throw error;
      }

      // Убираем заказ из списка доступных
      setAvailableOrders(prev => prev.filter(order => order.id !== orderId));

      toast({
        title: "Заказ принят!",
        description: "Заказ назначен на вас. Направляйтесь в ресторан для забора.",
      });

    } catch (error: any) {
      console.error('Error accepting order:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось принять заказ. Возможно, его уже взял другой курьер.",
        variant: "destructive"
      });
    } finally {
      setProcessingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  // Вспомогательные функции
  const getRestaurantName = (items: any) => {
    try {
      if (Array.isArray(items) && items.length > 0) {
        return items[0].restaurant_name || 'Ресторан';
      }
      return 'Ресторан';
    } catch {
      return 'Ресторан';
    }
  };

  const getRestaurantAddress = (items: any) => {
    return 'ул. Пушкина, 12'; // Заглушка
  };

  const calculateDistance = (deliveryAddress: any) => {
    // Заглушка для расчета расстояния
    return Math.floor(Math.random() * 5) + 1;
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleTimeString('ru', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUrgencyColor = (createdAt: string) => {
    const orderTime = new Date(createdAt);
    const now = new Date();
    const minutesAgo = Math.floor((now.getTime() - orderTime.getTime()) / 60000);

    if (minutesAgo > 30) return 'bg-red-500';
    if (minutesAgo > 15) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getUrgencyText = (createdAt: string) => {
    const orderTime = new Date(createdAt);
    const now = new Date();
    const minutesAgo = Math.floor((now.getTime() - orderTime.getTime()) / 60000);

    if (minutesAgo > 30) return 'Срочно!';
    if (minutesAgo > 15) return 'Важно';
    return 'Новый';
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Поиск доступных заказов...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Доступные заказы</h3>
        <Button variant="outline" size="sm" onClick={fetchAvailableOrders}>
          Обновить
        </Button>
      </div>

      {availableOrders.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Нет доступных заказов</p>
            <p className="text-sm text-muted-foreground mt-2">
              Когда появятся новые заказы, мы вас уведомим
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {availableOrders.map((order) => (
            <Card key={order.id} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <span>Заказ #{order.order_number}</span>
                      <Badge className={`${getUrgencyColor(order.created_at)} text-white text-xs`}>
                        {getUrgencyText(order.created_at)}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {order.restaurant_name}
                    </p>
                  </div>
                  <Badge className="bg-green-500 text-white">
                    +{order.estimated_payment}€
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Забрать из:</p>
                        <p className="text-muted-foreground">{order.restaurant_address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Доставить в:</p>
                        <p className="text-muted-foreground">
                          {order.delivery_address?.address_line_1}
                          {order.delivery_address?.address_line_2 && 
                            `, ${order.delivery_address.address_line_2}`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Route className="w-4 h-4 text-muted-foreground" />
                    <span>{order.distance} км</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>{order.total_amount}€</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>~{Math.ceil(order.distance * 3 + order.preparation_time)} мин</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Timer className="w-4 h-4 text-muted-foreground" />
                    <span>Готов: {formatTime(order.estimated_delivery_time)}</span>
                  </div>
                </div>

                {/* Customer Info */}
                {order.customer_info?.name && (
                  <div className="text-sm">
                    <span className="font-medium">Клиент:</span> {order.customer_info.name}
                    {order.customer_info.phone && (
                      <span className="text-muted-foreground ml-2">
                        • {order.customer_info.phone}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    onClick={() => acceptOrder(order.id)}
                    disabled={processingOrders.has(order.id)}
                    className="flex-1"
                  >
                    {processingOrders.has(order.id) ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Принимаю...
                      </>
                    ) : (
                      <>
                        <Bike className="w-4 h-4 mr-2" />
                        Принять заказ
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" className="px-3">
                    <Route className="w-4 h-4" />
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground text-center">
                  Заказ создан {Math.floor((new Date().getTime() - new Date(order.created_at).getTime()) / 60000)} мин назад
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableOrdersPanel;