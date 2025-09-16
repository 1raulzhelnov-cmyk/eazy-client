import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, DollarSign, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderOffer {
  id: string;
  order_number: string;
  restaurant_name: string;
  pickup_address: string;
  delivery_address: any;
  total_amount: number;
  estimated_delivery_time: string;
  distance: number;
  payment_amount: number;
  created_at: string;
}

const DriverOrderNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orderOffers, setOrderOffers] = useState<OrderOffer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Подписка на новые заказы для курьеров в реальном времени
      const channel = supabase
        .channel('driver-order-offers')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'orders',
            filter: 'status=eq.ready_for_pickup'
          },
          (payload) => {
            // Проверить, подходит ли заказ для этого курьера
            checkOrderEligibility(payload.new);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const checkOrderEligibility = async (order: any) => {
    // Логика для проверки, может ли курьер взять этот заказ
    // (геолокация, статус курьера и т.д.)
    
    if (!user) return;

    try {
      const { data: driver } = await supabase
        .from('drivers')
        .select('status, current_location')
        .eq('user_id', user.id)
        .single();

      if (!driver || driver.status !== 'online') return;

      // Добавить заказ в список предложений
      const orderOffer: OrderOffer = {
        id: order.id,
        order_number: order.order_number,
        restaurant_name: 'Ресторан', // В реальности получить из связанных данных
        pickup_address: 'Адрес ресторана',
        delivery_address: order.delivery_address,
        total_amount: order.total_amount,
        estimated_delivery_time: order.estimated_delivery_time,
        distance: 2.5, // Рассчитать реальное расстояние
        payment_amount: Math.round(order.total_amount * 0.15), // 15% от суммы заказа
        created_at: order.created_at
      };

      setOrderOffers(prev => [orderOffer, ...prev]);

      // Показать уведомление
      toast({
        title: "Новый заказ!",
        description: `Заказ #${order.order_number} на сумму ${order.total_amount}€`,
      });

      // Автоматически убрать предложение через 30 секунд
      setTimeout(() => {
        setOrderOffers(prev => prev.filter(o => o.id !== order.id));
      }, 30000);

    } catch (error) {
      console.error('Error checking order eligibility:', error);
    }
  };

  const acceptOrder = async (orderId: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'assigned',
          driver_id: user?.id 
        })
        .eq('id', orderId);

      if (error) throw error;

      // Убрать заказ из списка предложений
      setOrderOffers(prev => prev.filter(o => o.id !== orderId));

      toast({
        title: "Заказ принят!",
        description: "Заказ назначен на вас. Переходите к ресторану для забора.",
      });

    } catch (error) {
      console.error('Error accepting order:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось принять заказ",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const rejectOrder = (orderId: string) => {
    setOrderOffers(prev => prev.filter(o => o.id !== orderId));
  };

  if (orderOffers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Новые заказы</h3>
      
      {orderOffers.map((offer) => (
        <Card key={offer.id} className="border-primary shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">Заказ #{offer.order_number}</CardTitle>
                <p className="text-sm text-muted-foreground">{offer.restaurant_name}</p>
              </div>
              <Badge className="bg-green-500 text-white">
                +{offer.payment_amount}€
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Забрать:</p>
                    <p className="text-muted-foreground">{offer.pickup_address}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Доставить:</p>
                    <p className="text-muted-foreground">
                      {offer.delivery_address.address_line_1}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>~{offer.distance} км</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span>Сумма заказа: {offer.total_amount}€</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <Button
                onClick={() => acceptOrder(offer.id)}
                disabled={loading}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-2" />
                Принять
              </Button>
              
              <Button
                onClick={() => rejectOrder(offer.id)}
                variant="outline"
                disabled={loading}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Отклонить
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              Предложение исчезнет через 30 секунд
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DriverOrderNotifications;