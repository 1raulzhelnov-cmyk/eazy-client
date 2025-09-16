import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Gift, Star, Crown, Zap, Clock, ArrowRight } from 'lucide-react';

const Promotions = () => {
  const loyaltyPoints = 450;
  const nextRewardAt = 500;
  const progress = (loyaltyPoints / nextRewardAt) * 100;

  const activePromotions = [
    {
      id: 1,
      title: 'Добро пожаловать!',
      description: '10% скидка на первый заказ',
      code: 'WELCOME10',
      discount: '10%',
      validUntil: '31 декабря',
      type: 'new-user',
      icon: <Gift className="w-6 h-6" />
    },
    {
      id: 2,
      title: 'Бесплатная доставка',
      description: 'При заказе от 1000₽',
      code: 'DELIVERY0',
      discount: 'Бесплатно',
      validUntil: '30 ноября',
      type: 'delivery',
      icon: <Zap className="w-6 h-6" />
    },
    {
      id: 3,
      title: 'Скидка выходного дня',
      description: '15% в субботу и воскресенье',
      code: 'WEEKEND15',
      discount: '15%',
      validUntil: 'Каждые выходные',
      type: 'weekend',
      icon: <Star className="w-6 h-6" />
    }
  ];

  const loyaltyTiers = [
    {
      name: 'Бронзовый',
      points: 0,
      benefits: ['1 балл за каждые 100₽', 'Уведомления о скидках'],
      current: loyaltyPoints < 500
    },
    {
      name: 'Серебряный', 
      points: 500,
      benefits: ['2 балла за каждые 100₽', '5% дополнительная скидка', 'Приоритетная поддержка'],
      current: loyaltyPoints >= 500 && loyaltyPoints < 1000
    },
    {
      name: 'Золотой',
      points: 1000,
      benefits: ['3 балла за каждые 100₽', '10% дополнительная скидка', 'Бесплатная доставка', 'Эксклюзивные предложения'],
      current: loyaltyPoints >= 1000
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Акции и предложения</h1>
          <p className="text-muted-foreground">Экономьте больше с нашими специальными предложениями</p>
        </div>

        {/* Программа лояльности */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              Программа лояльности
            </CardTitle>
            <CardDescription>
              Зарабатывайте баллы с каждым заказом и получайте эксклюзивные привилегии
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Ваши баллы</span>
                  <span className="text-2xl font-bold text-primary">{loyaltyPoints}</span>
                </div>
                <Progress value={progress} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  До следующего уровня: {nextRewardAt - loyaltyPoints} баллов
                </p>
              </div>
              
              <div className="space-y-3">
                {loyaltyTiers.map((tier, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${tier.current ? 'bg-primary/5 border-primary' : 'bg-muted/30'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{tier.name}</h4>
                      <Badge variant={tier.current ? 'default' : 'secondary'}>
                        {tier.points}+ баллов
                      </Badge>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {tier.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Активные акции */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Активные акции</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePromotions.map((promo) => (
              <Card key={promo.id} className="relative overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {promo.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{promo.title}</CardTitle>
                      <CardDescription>{promo.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Скидка:</span>
                      <Badge variant="secondary" className="font-bold">
                        {promo.discount}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Промокод:</span>
                      <Badge variant="outline" className="font-mono">
                        {promo.code}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>До {promo.validUntil}</span>
                    </div>
                    <Button className="w-full mt-4">
                      Использовать промокод
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Как это работает */}
        <Card>
          <CardHeader>
            <CardTitle>Как получить скидки?</CardTitle>
            <CardDescription>
              Простые шаги для экономии на ваших заказах
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-medium mb-2">Выберите промокод</h4>
                <p className="text-sm text-muted-foreground">
                  Найдите подходящую акцию из доступных предложений
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h4 className="font-medium mb-2">Скопируйте код</h4>
                <p className="text-sm text-muted-foreground">
                  Нажмите на промокод и он автоматически скопируется
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-medium mb-2">Получите скидку</h4>
                <p className="text-sm text-muted-foreground">
                  Введите код при оформлении заказа и экономьте
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Promotions;