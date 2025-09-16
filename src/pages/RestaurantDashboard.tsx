import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Store, 
  Menu, 
  ShoppingBag, 
  BarChart3, 
  Settings,
  Bell,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const RestaurantDashboard = () => {
  const { user, profile } = useAuth();

  const stats = [
    { title: 'Новые заказы', value: '12', icon: ShoppingBag, color: 'text-blue-600' },
    { title: 'В обработке', value: '8', icon: Clock, color: 'text-yellow-600' },
    { title: 'Выполнено сегодня', value: '45', icon: CheckCircle, color: 'text-green-600' },
    { title: 'Выручка за день', value: '€2,340', icon: BarChart3, color: 'text-purple-600' }
  ];

  const recentOrders = [
    { id: '#1234', customer: 'Анна М.', items: 3, amount: '€24.50', status: 'Новый', time: '2 мин назад' },
    { id: '#1235', customer: 'Петр С.', items: 2, amount: '€18.00', status: 'Готовится', time: '15 мин назад' },
    { id: '#1236', customer: 'Мария К.', items: 4, amount: '€32.80', status: 'Готов', time: '25 мин назад' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Новый': return 'bg-red-100 text-red-800';
      case 'Готовится': return 'bg-yellow-100 text-yellow-800';
      case 'Готов': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Store className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">Панель Ресторана</h1>
              </div>
              <Badge variant="secondary">
                {profile?.first_name || 'Ресторан'} - ID: REST001
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Уведомления
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Настройки
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Последние заказы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-semibold">{order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.customer}</p>
                        </div>
                        <div>
                          <p className="text-sm">{order.items} товара(ов)</p>
                          <p className="font-semibold">{order.amount}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{order.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                Все заказы
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" variant="outline">
                <Menu className="h-4 w-4 mr-2" />
                Управление меню
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Store className="h-4 w-4 mr-2" />
                Профиль ресторана
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Аналитика
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Настройки
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Development Status */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Статус разработки (P000-P003)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Badge variant="default">P000 - Настройка проекта</Badge>
                <p className="text-sm text-green-600">✅ Завершено</p>
              </div>
              <div className="space-y-2">
                <Badge variant="secondary">P001 - Регистрация</Badge>
                <p className="text-sm text-yellow-600">🔄 В разработке</p>
              </div>
              <div className="space-y-2">
                <Badge variant="secondary">P002 - Профиль бизнеса</Badge>
                <p className="text-sm text-gray-600">⏳ Планируется</p>
              </div>
              <div className="space-y-2">
                <Badge variant="secondary">P003 - Управление меню</Badge>
                <p className="text-sm text-gray-600">⏳ Планируется</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RestaurantDashboard;