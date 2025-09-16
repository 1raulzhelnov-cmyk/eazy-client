import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, MapPin, Phone, Star, Users, Utensils, 
  Wifi, CreditCard, Accessibility, Car, ShieldCheck,
  ThumbsUp, MessageCircle, Share2, Heart, Camera
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface RestaurantDetailsProps {
  restaurantId: string;
}

interface RestaurantInfo {
  id: string;
  name: string;
  description: string;
  cuisine: string[];
  rating: number;
  reviewCount: number;
  priceRange: string;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  address: string;
  phone: string;
  hours: {
    [day: string]: { open: string; close: string; closed?: boolean };
  };
  features: string[];
  images: string[];
  reviews: Review[];
  stats: {
    totalOrders: number;
    repeatCustomers: number;
    averageDeliveryTime: number;
    responsiveness: number;
  };
}

interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
  orderItems: string[];
  helpful: number;
  images?: string[];
}

const mockRestaurant: RestaurantInfo = {
  id: '1',
  name: 'Piccola Italia',
  description: 'Аутентичная итальянская кухня с традиционными рецептами и свежими ингредиентами прямо из Италии.',
  cuisine: ['Итальянская', 'Пицца', 'Паста'],
  rating: 4.7,
  reviewCount: 342,
  priceRange: '€€',
  deliveryTime: '25-35',
  deliveryFee: 2.50,
  minimumOrder: 15,
  address: 'ул. Пушкина 12, Нарва',
  phone: '+372 555-0123',
  hours: {
    'Понедельник': { open: '11:00', close: '22:00' },
    'Вторник': { open: '11:00', close: '22:00' },
    'Среда': { open: '11:00', close: '22:00' },
    'Четверг': { open: '11:00', close: '22:00' },
    'Пятница': { open: '11:00', close: '23:00' },
    'Суббота': { open: '12:00', close: '23:00' },
    'Воскресенье': { open: '12:00', close: '21:00' }
  },
  features: [
    'Бесплатная доставка от 25€',
    'Принимаем карты',
    'Веганские опции',
    'Безглютеновые блюда',
    'Wi-Fi для курьеров',
    'Парковка'
  ],
  images: ['🍕', '🍝', '🧄', '🍷'],
  stats: {
    totalOrders: 2847,
    repeatCustomers: 78,
    averageDeliveryTime: 28,
    responsiveness: 95
  },
  reviews: [
    {
      id: '1',
      user: 'Анна К.',
      rating: 5,
      comment: 'Превосходная пицца! Тесто тонкое, ингредиенты свежие. Доставили точно в срок, горячей.',
      date: '2024-09-10',
      orderItems: ['Пицца Маргарита', 'Тирамису'],
      helpful: 12,
      images: ['📸']
    },
    {
      id: '2',
      user: 'Михаил П.',
      rating: 4,
      comment: 'Хорошая паста карбонара, но могли бы добавить побольше бекона. В целом рекомендую.',
      date: '2024-09-08',
      orderItems: ['Паста Карбонара', 'Салат Цезарь'],
      helpful: 8
    },
    {
      id: '3',
      user: 'Елена Д.',
      rating: 5,
      comment: 'Заказываем здесь регулярно. Всегда вкусно и качественно. Любимое место для итальянской кухни!',
      date: '2024-09-05',
      orderItems: ['Лазанья', 'Брускетта'],
      helpful: 15
    }
  ]
};

export const RestaurantDetails = ({ restaurantId }: RestaurantDetailsProps) => {
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // В реальном приложении здесь был бы API вызов
    setRestaurant(mockRestaurant);
  }, [restaurantId]);

  if (!restaurant) {
    return <div>Загрузка...</div>;
  }

  const getCurrentDayHours = () => {
    const today = new Date().toLocaleDateString('ru-RU', { weekday: 'long' });
    const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);
    return restaurant.hours[todayCapitalized];
  };

  const isCurrentlyOpen = () => {
    const currentHours = getCurrentDayHours();
    if (!currentHours || currentHours.closed) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = currentHours.open.split(':').map(Number);
    const [closeHour, closeMin] = currentHours.close.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    return currentTime >= openTime && currentTime <= closeTime;
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    restaurant.reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    
    const total = restaurant.reviews.length;
    return Object.entries(distribution).reverse().map(([rating, count]) => ({
      rating: Number(rating),
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Удалено из избранного" : "Добавлено в избранное",
      description: restaurant.name
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: restaurant.name,
        text: restaurant.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Ссылка скопирована",
        description: "Поделитесь этим рестораном с друзьями"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и основная информация */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl">{restaurant.name}</CardTitle>
                <Badge variant={isCurrentlyOpen() ? "default" : "secondary"}>
                  {isCurrentlyOpen() ? 'Открыто' : 'Закрыто'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{restaurant.rating}</span>
                  <span>({restaurant.reviewCount} отзывов)</span>
                </div>
                <span>•</span>
                <span>{restaurant.cuisine.join(', ')}</span>
                <span>•</span>
                <span>{restaurant.priceRange}</span>
              </div>
              
              <p className="text-muted-foreground mb-4">{restaurant.description}</p>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{restaurant.deliveryTime} мин</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>Доставка {restaurant.deliveryFee === 0 ? 'бесплатно' : `${restaurant.deliveryFee}€`}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Utensils className="w-4 h-4" />
                  <span>Мин. заказ {restaurant.minimumOrder}€</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleLike}>
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Детальная информация в табах */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Информация</TabsTrigger>
          <TabsTrigger value="hours">Часы работы</TabsTrigger>
          <TabsTrigger value="reviews">Отзывы ({restaurant.reviewCount})</TabsTrigger>
          <TabsTrigger value="gallery">Галерея</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Статистика */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Статистика</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Всего заказов</span>
                  <span className="font-semibold">{restaurant.stats.totalOrders.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Постоянные клиенты</span>
                  <span className="font-semibold">{restaurant.stats.repeatCustomers}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Среднее время доставки</span>
                  <span className="font-semibold">{restaurant.stats.averageDeliveryTime} мин</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Отзывчивость</span>
                    <span className="font-semibold">{restaurant.stats.responsiveness}%</span>
                  </div>
                  <Progress value={restaurant.stats.responsiveness} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Особенности */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Особенности</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {restaurant.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Контакты */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Контакты</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{restaurant.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${restaurant.phone}`} className="text-sm text-primary hover:underline">
                    {restaurant.phone}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Часы работы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(restaurant.hours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between items-center">
                    <span className="font-medium">{day}</span>
                    <span className={`text-sm ${hours.closed ? 'text-muted-foreground' : ''}`}>
                      {hours.closed ? 'Закрыто' : `${hours.open} - ${hours.close}`}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="space-y-6">
            {/* Общий рейтинг */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Рейтинг и отзывы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">{restaurant.rating}</div>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= restaurant.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{restaurant.reviewCount} отзывов</p>
                  </div>
                  
                  <div className="space-y-2">
                    {getRatingDistribution().map((item) => (
                      <div key={item.rating} className="flex items-center gap-2">
                        <span className="text-sm w-3">{item.rating}</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <Progress value={item.percentage} className="flex-1 h-2" />
                        <span className="text-xs text-muted-foreground w-8">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Отзывы */}
            <div className="space-y-4">
              {restaurant.reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{review.user}</span>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </div>
                      {review.images && (
                        <Badge variant="outline" className="text-xs">
                          <Camera className="w-3 h-3 mr-1" />
                          Фото
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm mb-3">{review.comment}</p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Заказал: {review.orderItems.join(', ')}</span>
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 hover:text-foreground">
                          <ThumbsUp className="w-3 h-3" />
                          {review.helpful}
                        </button>
                        <button className="flex items-center gap-1 hover:text-foreground">
                          <MessageCircle className="w-3 h-3" />
                          Ответить
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gallery">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Галерея</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {restaurant.images.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950 rounded-lg flex items-center justify-center text-4xl cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setActiveImageIndex(index)}
                  >
                    {image}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RestaurantDetails;