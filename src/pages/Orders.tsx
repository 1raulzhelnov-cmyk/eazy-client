import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Clock, CheckCircle, XCircle, Truck, Package, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  order_number: string;
  status: string;
  items: any[];
  total_amount: number;
  payment_status: string;
  payment_method: string;
  delivery_address: any;
  customer_info: any;
  special_instructions?: string;
  estimated_delivery_time?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // For demo purposes, add mock orders if no orders exist
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      let ordersData = (data as Order[]) || [];
      
      // Add mock orders for demo if no orders exist
      if (ordersData.length === 0) {
        ordersData = [
          {
            id: "1",
            order_number: "1234",
            status: "delivering",
            items: [
              { 
                name: "Пицца Маргарита (большая)", 
                quantity: 1, 
                price: 15, 
                image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=100&h=100&fit=crop",
                restaurantName: "Piccola Italia"
              },
              { 
                name: "Кола 0.5л", 
                quantity: 2, 
                price: 2.5, 
                image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=100&h=100&fit=crop"
              }
            ],
            total_amount: 20,
            payment_status: "paid",
            payment_method: "card",
            delivery_address: { address: "ул. Пушкина, д. 10, кв. 5", city: "Нарва" },
            customer_info: {},
            special_instructions: "Позвоните перед доставкой",
            estimated_delivery_time: "20:30",
            created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            updated_at: new Date(Date.now() - 1000 * 60 * 10).toISOString()
          },
          {
            id: "2",
            order_number: "1235",
            status: "delivered",
            items: [
              { 
                name: "Сет Филадельфия (8 шт)", 
                quantity: 1, 
                price: 22, 
                image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=100&h=100&fit=crop",
                restaurantName: "Tokyo Sushi"
              },
              { 
                name: "Суп Мисо", 
                quantity: 1, 
                price: 8, 
                image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=100&h=100&fit=crop",
                restaurantName: "Tokyo Sushi"
              }
            ],
            total_amount: 30,
            payment_status: "paid", 
            payment_method: "cash",
            delivery_address: { address: "пр. Мира, д. 25, офис 301", city: "Нарва" },
            customer_info: {},
            delivered_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            updated_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
          }
        ];
      }

      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить заказы",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-purple-100 text-purple-800';
      case 'delivering': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает подтверждения';
      case 'confirmed': return 'Подтвержден';
      case 'preparing': return 'Готовится';
      case 'ready': return 'Готов к выдаче';
      case 'delivering': return 'В пути';
      case 'delivered': return 'Доставлен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'preparing': return <Package className="w-4 h-4" />;
      case 'ready': return <Package className="w-4 h-4" />;
      case 'delivering': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatPrice = (price: number) => `${price.toFixed(2)}€`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.items as any[]).some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">Загрузка заказов...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Link to="/profile">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к профилю
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Мои заказы</h1>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Поиск по номеру заказа или товарам..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">У вас пока нет заказов</h2>
              <p className="text-muted-foreground mb-6">
                Сделайте свой первый заказ прямо сейчас!
              </p>
              <Link to="/restaurants">
                <Button className="bg-gradient-primary hover:shadow-glow">
                  Перейти к ресторанам
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">Заказ #{order.order_number}</h3>
                        <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                          {getStatusIcon(order.status)}
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">{formatPrice(order.total_amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.payment_method === 'card' ? 'Картой' : 'Наличными'}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 mb-4">
                    {(order.items as any[]).map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          {item.restaurantName && (
                            <p className="text-xs text-muted-foreground">{item.restaurantName}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm">x{item.quantity}</p>
                          <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Delivery Address */}
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Адрес доставки:</p>
                    <p>{order.delivery_address.address}, {order.delivery_address.city}</p>
                  </div>

                  {order.special_instructions && (
                    <div className="mt-2 text-sm">
                      <p className="font-medium mb-1">Комментарий:</p>
                      <p className="text-muted-foreground">{order.special_instructions}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    {/* Show tracking for active orders */}
                    {['confirmed', 'preparing', 'ready', 'delivering'].includes(order.status) && (
                      <Link to={`/order-tracking/${order.id}`}>
                        <Button variant="outline" size="sm" className="bg-primary/10 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                          <Eye className="w-4 h-4 mr-2" />
                          Отследить заказ
                        </Button>
                      </Link>
                    )}
                    
                    <Button variant="outline" size="sm">
                      Повторить заказ
                    </Button>
                    
                    {order.status === 'delivered' && (
                      <Button variant="outline" size="sm">
                        Оставить отзыв
                      </Button>
                    )}
                    
                    {order.status === 'pending' && (
                      <Button variant="outline" size="sm" className="text-destructive">
                        Отменить заказ
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;