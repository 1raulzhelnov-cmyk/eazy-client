import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { MapPin, Clock, Package, Star, User, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DriverRegistrationForm from '@/components/DriverRegistrationForm';
import DriverApplicationStatus from '@/components/DriverApplicationStatus';
import DriverOrderNotifications from '@/components/DriverOrderNotifications';

interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  vehicle_type: string;
  license_plate: string | null;
  status: string;
  rating: number;
  total_deliveries: number;
  is_verified: boolean;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  customer_info: any;
  delivery_address: any;
  items: any;
  estimated_delivery_time: string | null;
  created_at: string;
}

const DriverApp = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [application, setApplication] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDriverProfile();
      fetchDriverApplication();
    }
  }, [user]);

  const fetchDriverProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching driver profile:', error);
        return;
      }

      setDriver(data);
      
      if (data) {
        fetchAssignedOrders();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverApplication = async () => {
    try {
      const { data, error } = await supabase
        .from('driver_applications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching application:', error);
        return;
      }

      setApplication(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAssignedOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('driver_id', driver?.id)
        .in('status', ['assigned', 'picked_up', 'in_delivery'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleOnlineStatus = async () => {
    if (!driver) return;

    const newStatus = driver.status === 'online' ? 'offline' : 'online';
    
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ status: newStatus })
        .eq('id', driver.id);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось изменить статус",
          variant: "destructive"
        });
        return;
      }

      setDriver({ ...driver, status: newStatus });
      toast({
        title: "Статус изменен",
        description: `Вы теперь ${newStatus === 'online' ? 'онлайн' : 'оффлайн'}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      
      if (newStatus === 'picked_up') {
        updates.pickup_time = new Date().toISOString();
      } else if (newStatus === 'in_delivery') {
        updates.delivery_started_at = new Date().toISOString();
      } else if (newStatus === 'delivered') {
        updates.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось обновить статус заказа",
          variant: "destructive"
        });
        return;
      }

      fetchAssignedOrders();
      toast({
        title: "Статус обновлен",
        description: "Статус заказа успешно изменен",
      });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'Назначен';
      case 'picked_up':
        return 'Забран';
      case 'in_delivery':
        return 'В доставке';
      case 'delivered':
        return 'Доставлен';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!driver && !application) {
    return (
      <div className="min-h-screen bg-background p-4">
        <DriverRegistrationForm />
      </div>
    );
  }

  if (!driver && application) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <DriverApplicationStatus />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {driver.first_name} {driver.last_name}
                </h2>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{driver.phone}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">{driver.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({driver.total_deliveries} доставок)
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm">Статус:</span>
                <Switch
                  checked={driver.status === 'online'}
                  onCheckedChange={toggleOnlineStatus}
                />
              </div>
              <Badge className={`${getStatusColor(driver.status)} text-white`}>
                {driver.status === 'online' ? 'Онлайн' : 'Оффлайн'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Notifications for Online Drivers */}
      {driver && driver.status === 'online' && (
        <DriverOrderNotifications />
      )}

      {/* Orders */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Мои заказы</h3>
        
        {orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Нет активных заказов</p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Заказ #{order.order_number}</CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(order.estimated_delivery_time).toLocaleString('ru')}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {getOrderStatusText(order.status)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Адрес доставки:</p>
                    <p className="text-muted-foreground">
                      {order.delivery_address.address_line_1}
                      {order.delivery_address.address_line_2 && 
                        `, ${order.delivery_address.address_line_2}`
                      }
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-sm mb-2">Товары:</p>
                  <div className="space-y-1">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span>{item.price}€</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-bold">Сумма: {order.total_amount}€</span>
                </div>

                <div className="flex space-x-2">
                  {order.status === 'assigned' && (
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'picked_up')}
                      className="flex-1"
                    >
                      Забрать заказ
                    </Button>
                  )}
                  
                  {order.status === 'picked_up' && (
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'in_delivery')}
                      className="flex-1"
                    >
                      Начать доставку
                    </Button>
                  )}
                  
                  {order.status === 'in_delivery' && (
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="flex-1"
                    >
                      Доставлено
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DriverApp;