import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation, MapPin, Phone, MessageCircle, Clock, Route } from 'lucide-react';
import Map from './Map';

interface NavigationProps {
  destination: {
    address: string;
    lat?: number;
    lng?: number;
  };
  orderInfo: {
    order_number: string;
    customer_name?: string;
    customer_phone?: string;
    type: 'pickup' | 'delivery';
  };
  onArrived: () => void;
}

const DriverNavigation = ({ destination, orderInfo, onArrived }: NavigationProps) => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [estimatedTime, setEstimatedTime] = useState(15);
  const [distance, setDistance] = useState(2.5);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Получаем текущее местоположение
    getCurrentLocation();
    
    // Симуляция обновления времени прибытия
    const interval = setInterval(() => {
      setEstimatedTime(prev => Math.max(1, prev - Math.random()));
      setDistance(prev => Math.max(0.1, prev - 0.1));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Заглушка для Нарвы
          setCurrentLocation({
            lat: 59.3776,
            lng: 28.1907
          });
        }
      );
    }
  };

  const startNavigation = () => {
    setIsNavigating(true);
    
    // Открыть внешнюю навигацию (Google Maps или Apple Maps)
    const query = encodeURIComponent(destination.address);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
    window.open(url, '_blank');
  };

  const callCustomer = () => {
    if (orderInfo.customer_phone) {
      window.open(`tel:${orderInfo.customer_phone}`);
    }
  };

  const getActionText = () => {
    return orderInfo.type === 'pickup' ? 'Прибыл в ресторан' : 'Прибыл к клиенту';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                {orderInfo.type === 'pickup' ? '📍 Забор заказа' : '🏠 Доставка'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Заказ #{orderInfo.order_number}
              </p>
            </div>
            <Badge variant={orderInfo.type === 'pickup' ? 'default' : 'secondary'}>
              {orderInfo.type === 'pickup' ? 'Забор' : 'Доставка'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">{destination.address}</p>
                <p className="text-sm text-muted-foreground">
                  {distance.toFixed(1)} км • ~{Math.ceil(estimatedTime)} мин
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>ETA: {new Date(Date.now() + estimatedTime * 60000).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={startNavigation} className="w-full">
              <Navigation className="w-4 h-4 mr-2" />
              {isNavigating ? 'Навигация активна' : 'Начать навигацию'}
            </Button>
            <Button onClick={onArrived} variant="outline" className="w-full">
              <MapPin className="w-4 h-4 mr-2" />
              {getActionText()}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer Info (только для доставки) */}
      {orderInfo.type === 'delivery' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Контакты клиента</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {orderInfo.customer_name && (
              <div className="flex items-center justify-between">
                <span className="text-sm">{orderInfo.customer_name}</span>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={callCustomer}
                disabled={!orderInfo.customer_phone}
                className="w-full"
              >
                <Phone className="w-4 h-4 mr-2" />
                Позвонить
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <MessageCircle className="w-4 h-4 mr-2" />
                Написать
              </Button>
            </div>

            {orderInfo.customer_phone && (
              <p className="text-xs text-muted-foreground text-center">
                {orderInfo.customer_phone}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Map */}
      <Card className="h-64">
        <CardContent className="p-0 h-full">
          <Map
            deliveryLocation={{
              lat: destination.lat || 59.3776,
              lng: destination.lng || 28.1907,
              address: destination.address
            }}
            showCurrentLocation={true}
            height="256px"
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm">
          <Route className="w-4 h-4 mr-2" />
          Альтернативный маршрут
        </Button>
        <Button variant="outline" size="sm">
          <Clock className="w-4 h-4 mr-2" />
          Сообщить о задержке
        </Button>
      </div>
    </div>
  );
};

export default DriverNavigation;