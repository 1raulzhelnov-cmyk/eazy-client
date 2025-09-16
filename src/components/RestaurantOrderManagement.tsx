import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, 
  CheckCircle, 
  Package, 
  Truck,
  AlertCircle,
  Phone,
  MapPin,
  Euro
} from 'lucide-react';
import { useRestaurantOrders } from '@/hooks/useRestaurantOrders';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface RestaurantOrderManagementProps {
  restaurantId: string;
}

export const RestaurantOrderManagement = ({ restaurantId }: RestaurantOrderManagementProps) => {
  const { 
    orders, 
    loading, 
    error, 
    updateOrderStatus, 
    getStatusLabel, 
    getOrderStatusColor 
  } = useRestaurantOrders(restaurantId);

  const getNextStatus = (currentStatus: string): string | null => {
    const statusFlow: Record<string, string> = {
      'pending': 'confirmed',
      'confirmed': 'preparing',
      'preparing': 'ready',
      'ready': 'picked_up'
    };
    return statusFlow[currentStatus] || null;
  };

  const getNextStatusLabel = (currentStatus: string): string => {
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) return '';
    return getStatusLabel(nextStatus);
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      'pending': AlertCircle,
      'confirmed': CheckCircle,
      'preparing': Clock,
      'ready': Package,
      'picked_up': Truck,
      'in_transit': Truck,
      'delivered': CheckCircle,
      'cancelled': AlertCircle
    };
    const Icon = icons[status] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  if (loading) return <div>Загрузка заказов...</div>;
  if (error) return <div className="text-red-600">Ошибка: {error}</div>;

  const activeOrders = orders.filter(order => 
    !['delivered', 'cancelled'].includes(order.status)
  );

  if (activeOrders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Нет активных заказов</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeOrders.map((order) => (
        <Card key={order.id} className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {getStatusIcon(order.status)}
                Заказ #{order.order_number}
              </CardTitle>
              <Badge className={getOrderStatusColor(order.status)}>
                {getStatusLabel(order.status)}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(order.created_at), 'dd MMMM, HH:mm', { locale: ru })}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Customer Info */}
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {order.customer_info?.name || 'Имя не указано'}
                  </span>
                  <span className="text-muted-foreground">
                    {order.customer_info?.phone || 'Телефон не указан'}
                  </span>
                </div>
                
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <div>{order.delivery_address?.address_line_1}</div>
                    {order.delivery_address?.address_line_2 && (
                      <div className="text-muted-foreground">
                        {order.delivery_address.address_line_2}
                      </div>
                    )}
                    {order.delivery_address?.delivery_instructions && (
                      <div className="text-muted-foreground italic">
                        Примечание: {order.delivery_address.delivery_instructions}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1 text-lg font-bold">
                  <Euro className="h-4 w-4" />
                  {Number(order.total_amount).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {order.payment_method === 'card' ? 'Картой' : 'Наличными'}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-muted/50 rounded-lg p-3">
              <h4 className="font-medium mb-2">Состав заказа:</h4>
              <div className="space-y-1">
                {Array.isArray(order.items) && order.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name} x {item.quantity}</span>
                    <span>€{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Instructions */}
            {order.special_instructions && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="font-medium text-yellow-800 mb-1">Особые пожелания:</div>
                <div className="text-yellow-700 text-sm">{order.special_instructions}</div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {getNextStatus(order.status) && (
                <Button
                  onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                  className="flex-1"
                >
                  {getNextStatusLabel(order.status)}
                </Button>
              )}
              
              {order.status === 'confirmed' && (
                <Button
                  variant="destructive"
                  onClick={() => updateOrderStatus(order.id, 'cancelled')}
                >
                  Отменить
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};