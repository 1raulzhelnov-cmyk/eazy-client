import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Gift, Percent, Star, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Promo {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'freeDelivery';
  value: number;
  title: string;
  description: string;
  minOrder?: number;
  validUntil: Date;
  isActive: boolean;
}

interface PromoSystemProps {
  onApplyPromo?: (discount: number, type: string) => void;
}

const PromoSystem: React.FC<PromoSystemProps> = ({ onApplyPromo }) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<Promo | null>(null);

  const availablePromos: Promo[] = [
    {
      id: '1',
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      title: 'Скидка для новых клиентов',
      description: '10% скидка на первый заказ',
      minOrder: 500,
      validUntil: new Date('2024-12-31'),
      isActive: true
    },
    {
      id: '2',
      code: 'DELIVERY0',
      type: 'freeDelivery',
      value: 0,
      title: 'Бесплатная доставка',
      description: 'Бесплатная доставка при заказе от 1000₽',
      minOrder: 1000,
      validUntil: new Date('2024-12-31'),
      isActive: true
    },
    {
      id: '3',
      code: 'SAVE200',
      type: 'fixed',
      value: 200,
      title: 'Фиксированная скидка',
      description: 'Скидка 200₽ при заказе от 1500₽',
      minOrder: 1500,
      validUntil: new Date('2024-12-31'),
      isActive: true
    }
  ];

  const handleApplyPromo = () => {
    const promo = availablePromos.find(p => p.code.toLowerCase() === promoCode.toLowerCase() && p.isActive);
    
    if (!promo) {
      toast.error('Промокод не найден или не активен');
      return;
    }

    if (promo.validUntil < new Date()) {
      toast.error('Срок действия промокода истек');
      return;
    }

    setAppliedPromo(promo);
    onApplyPromo?.(promo.value, promo.type);
    toast.success(`Промокод ${promo.code} применен!`);
  };

  const removePromo = () => {
    setAppliedPromo(null);
    onApplyPromo?.(0, 'none');
    toast.info('Промокод удален');
  };

  const getPromoIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'fixed': return <Gift className="w-4 h-4" />;
      case 'freeDelivery': return <Star className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Применение промокода */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Промокод
          </CardTitle>
          <CardDescription>
            Введите промокод для получения скидки
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appliedPromo ? (
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                {getPromoIcon(appliedPromo.type)}
                <span className="font-medium">{appliedPromo.code}</span>
                <Badge variant="secondary">{appliedPromo.title}</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={removePromo}>
                Удалить
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Введите промокод"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleApplyPromo}>
                Применить
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Доступные промокоды */}
      <div className="space-y-3">
        <h3 className="font-medium">Доступные промокоды</h3>
        {availablePromos.map((promo) => (
          <Card key={promo.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setPromoCode(promo.code)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getPromoIcon(promo.type)}
                  </div>
                  <div>
                    <h4 className="font-medium">{promo.title}</h4>
                    <p className="text-sm text-muted-foreground">{promo.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        До {promo.validUntil.toLocaleDateString()}
                      </span>
                      {promo.minOrder && (
                        <span>Мин. заказ: {promo.minOrder}₽</span>
                      )}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="font-mono">
                  {promo.code}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PromoSystem;