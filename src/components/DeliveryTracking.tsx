import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Map from './Map';
import { MapPin, Clock, Phone, MessageCircle } from 'lucide-react';

interface DeliveryTrackingProps {
  orderId: string;
  deliveryAddress: string;
  estimatedTime: string;
  courierName?: string;
  courierPhone?: string;
}

const DeliveryTracking: React.FC<DeliveryTrackingProps> = ({
  orderId,
  deliveryAddress,
  estimatedTime,
  courierName = "Александр",
  courierPhone = "+7 (999) 123-45-67"
}) => {
  const [courierLocation, setCourierLocation] = useState({
    lat: 55.7528,
    lng: 37.6200
  });

  const deliveryLocation = {
    lat: 55.7558,
    lng: 37.6173,
    address: deliveryAddress
  };

  // Simulate courier movement
  useEffect(() => {
    const interval = setInterval(() => {
      setCourierLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const trackingSteps = [
    {
      id: 1,
      title: 'Заказ принят',
      description: 'Ресторан готовит ваш заказ',
      completed: true,
      time: '18:30'
    },
    {
      id: 2,
      title: 'Готовится',
      description: 'Ваш заказ готовится',
      completed: true,
      time: '18:45'
    },
    {
      id: 3,
      title: 'Готов к доставке',
      description: 'Курьер забрал заказ',
      completed: true,
      time: '19:00'
    },
    {
      id: 4,
      title: 'В пути',
      description: 'Курьер едет к вам',
      completed: true,
      time: 'Сейчас'
    },
    {
      id: 5,
      title: 'Доставлен',
      description: 'Заказ доставлен',
      completed: false,
      time: estimatedTime
    }
  ];

  return (
    <div className="space-y-6">
      {/* Информация о курьере */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Курьер в пути
          </CardTitle>
          <CardDescription>
            Ваш заказ #{orderId} доставляется
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-lg">🚗</span>
              </div>
              <div>
                <h4 className="font-semibold">{courierName}</h4>
                <p className="text-sm text-muted-foreground">Курьер</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4 mr-1" />
                Позвонить
              </Button>
              <Button variant="outline" size="sm">
                <MessageCircle className="w-4 h-4 mr-1" />
                Написать
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span>Прибытие: {estimatedTime}</span>
            <Badge variant="secondary">В пути</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Карта с отслеживанием */}
      <Card>
        <CardHeader>
          <CardTitle>Отслеживание на карте</CardTitle>
          <CardDescription>
            Текущее местоположение курьера и адрес доставки
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Map 
            restaurants={[{
              id: 'courier',
              name: `Курьер ${courierName}`,
              address: 'Текущее местоположение',
              lat: courierLocation.lat,
              lng: courierLocation.lng
            }]}
            deliveryLocation={deliveryLocation}
            height="300px"
          />
        </CardContent>
      </Card>

      {/* Этапы доставки */}
      <Card>
        <CardHeader>
          <CardTitle>Этапы доставки</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trackingSteps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.completed 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step.completed ? '✓' : step.id}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.title}
                    </h4>
                    <span className="text-sm text-muted-foreground">{step.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryTracking;