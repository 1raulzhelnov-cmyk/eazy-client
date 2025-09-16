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
  CheckCircle,
  Euro,
  TrendingUp,
  Calendar,
  MessageSquare,
  BarChart,
  Star,
  Percent,
  Users
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useRestaurantOrders } from '@/hooks/useRestaurantOrders';
import { RestaurantOrderManagement } from '@/components/RestaurantOrderManagement';
import { useNavigate, Link } from 'react-router-dom';

const RestaurantDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { restaurant, loading: restaurantLoading, error: restaurantError } = useRestaurant();
  const { orders, stats, loading: ordersLoading } = useRestaurantOrders(restaurant?.id);

  if (restaurantLoading || ordersLoading) return <div>Загрузка...</div>;
  if (restaurantError) return <div>Ошибка загрузки ресторана</div>;
  if (!restaurant) return <div>Ресторан не найден</div>;

  const dashboardStats = [
    { title: 'Новые заказы', value: stats?.newOrders || '0', icon: ShoppingBag, color: 'text-blue-600' },
    { title: 'В обработке', value: stats?.inProgress || '0', icon: Clock, color: 'text-yellow-600' },
    { title: 'Выполнено сегодня', value: stats?.completedToday || '0', icon: CheckCircle, color: 'text-green-600' },
    { title: 'Выручка за день', value: `€${stats?.todayRevenue || '0'}`, icon: BarChart3, color: 'text-purple-600' }
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
                {restaurant.business_name} - {restaurant.registration_status}
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
          {dashboardStats.map((stat, index) => (
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
                Управление заказами
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RestaurantOrderManagement restaurantId={restaurant.id} />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/menu-management')}
              >
                <Menu className="h-4 w-4 mr-2" />
                Управление меню
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/restaurant-profile">
                  <Store className="h-4 w-4 mr-2" />
                  Профиль ресторана
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/restaurant-analytics">
                  <BarChart className="h-4 w-4 mr-2" />
                  Аналитика
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/restaurant-reviews">
                  <Star className="h-4 w-4 mr-2" />
                  Отзывы
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Extended Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Управление бизнесом</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/restaurant-support">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Поддержка
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/restaurant-finances">
                  <Euro className="h-4 w-4 mr-2" />
                  Финансы
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/restaurant-promotions">
                  <Percent className="h-4 w-4 mr-2" />
                  Промокоды
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/restaurant-personnel">
                  <Users className="h-4 w-4 mr-2" />
                  Персонал
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Статус развития проекта</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Badge variant="default">P007 - Аналитика</Badge>
                  <p className="text-xs text-green-600">✅ Завершено</p>
                </div>
                <div className="space-y-1">
                  <Badge variant="default">P008 - Отзывы</Badge>
                  <p className="text-xs text-green-600">✅ Завершено</p>
                </div>
                <div className="space-y-1">
                  <Badge variant="default">P009 - Финансы</Badge>
                  <p className="text-xs text-green-600">✅ Завершено</p>
                </div>
                <div className="space-y-1">
                  <Badge variant="default">P010 - Промо</Badge>
                  <p className="text-xs text-green-600">✅ Завершено</p>
                </div>
                <div className="space-y-1">
                  <Badge variant="default">P011 - Поддержка</Badge>
                  <p className="text-xs text-green-600">✅ Завершено</p>
                </div>
                <div className="space-y-1">
                  <Badge variant="default">P012 - Персонал</Badge>
                  <p className="text-xs text-green-600">✅ Завершено</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Development Status */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Статус разработки - 100% ГОТОВО!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Badge variant="default">P000 - Настройка проекта</Badge>
                <p className="text-sm text-green-600">✅ Завершено</p>
              </div>
              <div className="space-y-2">
                <Badge variant="default">P001 - Регистрация</Badge>
                <p className="text-sm text-green-600">✅ Завершено</p>
              </div>
              <div className="space-y-2">
                <Badge variant="default">P002 - Профиль бизнеса</Badge>
                <p className="text-sm text-green-600">✅ Завершено</p>
              </div>
              <div className="space-y-2">
                <Badge variant="default">P003 - Управление меню</Badge>
                <p className="text-sm text-green-600">✅ Завершено</p>
              </div>
              <div className="space-y-2">
                <Badge variant="default">P004 - Переключатель наличия</Badge>
                <p className="text-sm text-green-600">✅ Завершено</p>
              </div>
              <div className="space-y-2">
                <Badge variant="default">P005 - Уведомления заказов</Badge>
                <p className="text-sm text-green-600">✅ Завершено</p>
              </div>
              <div className="space-y-2">
                <Badge variant="default">P006 - Панель заказов</Badge>
                <p className="text-sm text-green-600">✅ Завершено</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RestaurantDashboard;