import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Map from './Map';
import { MapPin, Clock, Phone, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DeliveryTrackingProps {
  orderId: string;
  deliveryAddress: string;
  estimatedTime: string;
}

interface SafeDriverInfo {
  driver_id: string;
  first_name: string;
  last_name_initial: string;
  rating: number;
  vehicle_type: string;
  status: string;
}

const DeliveryTracking: React.FC<DeliveryTrackingProps> = ({
  orderId,
  deliveryAddress,
  estimatedTime
}) => {
  const [courierLocation, setCourierLocation] = useState({
    lat: 55.7528,
    lng: 37.6200
  });
  const [driverInfo, setDriverInfo] = useState<SafeDriverInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch safe driver info
  useEffect(() => {
    const fetchDriverInfo = async () => {
      try {
        const { data, error } = await supabase.rpc('get_safe_driver_info_for_order', {
          order_id_param: orderId
        });

        if (error) {
          console.error('Error fetching driver info:', error);
          return;
        }

        setDriverInfo(data && data.length > 0 ? data[0] : null);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchDriverInfo();
    }
  }, [orderId]);

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
                <h4 className="font-semibold">
                  {loading ? 'Загрузка...' : driverInfo ? `${driverInfo.first_name} ${driverInfo.last_name_initial}` : 'Курьер'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {driverInfo ? `${driverInfo.vehicle_type} • ⭐ ${driverInfo.rating}` : 'Курьер'}
                </p>
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
              name: driverInfo ? `Курьер ${driverInfo.first_name} ${driverInfo.last_name_initial}` : 'Курьер',
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