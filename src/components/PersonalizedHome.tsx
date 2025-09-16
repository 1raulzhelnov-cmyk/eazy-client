import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Clock, 
  Star, 
  Zap, 
  TrendingUp,
  Heart,
  Calendar,
  Gift,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PersonalizedRecommendation {
  id: string;
  type: 'restaurant' | 'promotion' | 'category';
  title: string;
  description: string;
  image: string;
  relevanceScore: number;
  reason: string;
  action?: {
    label: string;
    href: string;
  };
}

interface UserInsight {
  totalOrders: number;
  favoriteCategory: string;
  avgOrderTime: string;
  savingsThisMonth: number;
  loyaltyPoints: number;
  nextReward: string;
}

const PersonalizedHome: React.FC = () => {
  const { user, profile } = useAuth();
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [insights, setInsights] = useState<UserInsight | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Generate personalized recommendations based on user data
    generateRecommendations();
    loadUserInsights();
    loadWeatherData();
  }, [user, profile]);

  const generateRecommendations = () => {
    const currentHour = currentTime.getHours();
    const dayOfWeek = currentTime.getDay();
    
    const baseRecommendations: PersonalizedRecommendation[] = [
      {
        id: '1',
        type: 'restaurant',
        title: 'Piccola Italia',
        description: 'На основе ваших прошлых заказов пиццы',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop',
        relevanceScore: 92,
        reason: 'Заказывали пиццу 5 раз за месяц',
        action: { label: 'Заказать', href: '/restaurant/1' }
      },
      {
        id: '2',
        type: 'promotion',
        title: 'Скидка 15% на завтрак',
        description: 'Специально для утренних заказов',
        image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=300&h=200&fit=crop',
        relevanceScore: 85,
        reason: 'Часто заказываете в 9:00-11:00',
        action: { label: 'Получить скидку', href: '/promotions' }
      },
      {
        id: '3',
        type: 'category',
        title: 'Суши сеты со скидкой',
        description: 'Новые роллы от японских мастеров',
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop',
        relevanceScore: 78,
        reason: 'Попробуйте что-то новое',
        action: { label: 'Посмотреть', href: '/restaurant/2' }
      }
    ];

    // Adjust recommendations based on time and day
    if (currentHour >= 6 && currentHour <= 11) {
      // Morning recommendations
      baseRecommendations[1].relevanceScore += 10;
    } else if (currentHour >= 12 && currentHour <= 14) {
      // Lunch recommendations
      baseRecommendations[0].relevanceScore += 8;
    } else if (currentHour >= 18 && currentHour <= 22) {
      // Dinner recommendations
      baseRecommendations[2].relevanceScore += 12;
    }

    // Weekend boost for certain categories
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      baseRecommendations.forEach(rec => {
        if (rec.type === 'restaurant') rec.relevanceScore += 5;
      });
    }

    setRecommendations(
      baseRecommendations.sort((a, b) => b.relevanceScore - a.relevanceScore)
    );
  };

  const loadUserInsights = () => {
    // Mock user insights data
    setInsights({
      totalOrders: 23,
      favoriteCategory: 'Итальянская кухня',
      avgOrderTime: '19:30',
      savingsThisMonth: 45,
      loyaltyPoints: 450,
      nextReward: 'Бесплатная доставка'
    });
  };

  const loadWeatherData = () => {
    // Mock weather data
    setWeatherData({
      temperature: 18,
      condition: 'Облачно',
      recommendation: 'Отличная погода для горячего супа!'
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  const getMealTimeRecommendation = () => {
    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 11) return 'завтрак';
    if (hour >= 11 && hour < 16) return 'обед';
    if (hour >= 16 && hour < 19) return 'полдник';
    return 'ужин';
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Personal Greeting */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {getGreeting()}, {profile?.first_name || 'друг'}! 
                <Sparkles className="w-6 h-6 inline-block ml-2 text-yellow-500" />
              </h2>
              <p className="text-muted-foreground mt-1">
                Время для {getMealTimeRecommendation()}а! 
                {weatherData && ` ${weatherData.condition}, ${weatherData.temperature}°C`}
              </p>
              {weatherData?.recommendation && (
                <p className="text-sm text-primary mt-2 font-medium">
                  💡 {weatherData.recommendation}
                </p>
              )}
            </div>
            {insights && (
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {insights.loyaltyPoints}
                </div>
                <div className="text-sm text-muted-foreground">баллов</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Insights */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{insights.totalOrders}</div>
                  <div className="text-sm text-muted-foreground">заказов</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                <div>
                  <div className="text-sm font-medium">{insights.favoriteCategory}</div>
                  <div className="text-xs text-muted-foreground">Любимая кухня</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-500" />
                <div>
                  <div className="text-sm font-medium">₽{insights.savingsThisMonth}</div>
                  <div className="text-xs text-muted-foreground">Сэкономлено в этом месяце</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loyalty Progress */}
      {insights && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">До следующей награды</CardTitle>
            <CardDescription>Осталось 50 баллов до "{insights.nextReward}"</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={90} className="h-2 mb-2" />
            <div className="text-sm text-muted-foreground">
              {insights.loyaltyPoints}/500 баллов
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personalized Recommendations */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Рекомендации для вас</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <Card key={rec.id} className="group hover:shadow-lg transition-all duration-300">
              <div className="relative overflow-hidden">
                <img 
                  src={rec.image} 
                  alt={rec.title}
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-2 right-2 bg-primary/90">
                  <Zap className="w-3 h-3 mr-1" />
                  {rec.relevanceScore}%
                </Badge>
              </div>
              
              <CardContent className="p-4">
                <h4 className="font-semibold mb-1">{rec.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {rec.description}
                </p>
                <p className="text-xs text-primary mb-3">
                  💡 {rec.reason}
                </p>
                
                {rec.action && (
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.location.href = rec.action!.href}
                  >
                    {rec.action.label}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ваша активность</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {insights?.totalOrders || 0}
              </div>
              <div className="text-sm text-muted-foreground">Всего заказов</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-green-500">
                ₽{insights?.savingsThisMonth || 0}
              </div>
              <div className="text-sm text-muted-foreground">Сэкономлено</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {insights?.avgOrderTime || 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Среднее время заказа</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-purple-500">
                5★
              </div>
              <div className="text-sm text-muted-foreground">Средний рейтинг</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizedHome;