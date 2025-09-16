import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationTrackerProps {
  driverStatus: string;
  onLocationUpdate?: (position: { lat: number; lng: number }) => void;
}

const LocationTracker = ({ driverStatus, onLocationUpdate }: LocationTrackerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { position, error, loading, refreshPosition } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000,
    watchPosition: driverStatus === 'online'
  });

  useEffect(() => {
    if (position && driverStatus === 'online') {
      updateDriverLocation(position);
      onLocationUpdate?.(position);
    }
  }, [position, driverStatus]);

  const updateDriverLocation = async (location: { lat: number; lng: number }) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({
          current_location: {
            lat: location.lat,
            lng: location.lng,
            timestamp: new Date().toISOString(),
            accuracy: position?.accuracy
          }
        })
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error updating location:', error);
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permission.state === 'denied') {
        toast({
          title: "Доступ к геолокации запрещен",
          description: "Разрешите доступ к местоположению в настройках браузера",
          variant: "destructive"
        });
      } else {
        refreshPosition();
      }
    } catch (error) {
      refreshPosition();
    }
  };

  const getLocationStatusColor = () => {
    if (loading) return 'bg-yellow-500';
    if (error) return 'bg-red-500';
    if (position) return 'bg-green-500';
    return 'bg-gray-500';
  };

  const getLocationStatusText = () => {
    if (loading) return 'Определение...';
    if (error) return 'Ошибка';
    if (position) return 'Активно';
    return 'Отключено';
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const formatAccuracy = (accuracy?: number) => {
    if (!accuracy) return 'Неизвестно';
    if (accuracy < 10) return 'Высокая';
    if (accuracy < 50) return 'Средняя';
    return 'Низкая';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Отслеживание местоположения</span>
          </CardTitle>
          <Badge className={`${getLocationStatusColor()} text-white`}>
            {getLocationStatusText()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error ? (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-800 dark:text-red-200">
                  Ошибка геолокации
                </p>
                <p className="text-red-700 dark:text-red-300">
                  {error.message}
                </p>
              </div>
            </div>
            <Button
              onClick={requestLocationPermission}
              size="sm"
              className="mt-2 w-full"
              variant="outline"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Разрешить доступ к геолокации
            </Button>
          </div>
        ) : position ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Координаты:</p>
                <p className="text-muted-foreground font-mono">
                  {formatCoordinates(position.lat, position.lng)}
                </p>
              </div>
              <div>
                <p className="font-medium">Точность:</p>
                <p className="text-muted-foreground">
                  {formatAccuracy(position.accuracy)} ({position.accuracy?.toFixed(0)}м)
                </p>
              </div>
            </div>

            {position.speed !== undefined && position.speed > 0 && (
              <div className="text-sm">
                <p className="font-medium">Скорость:</p>
                <p className="text-muted-foreground">
                  {Math.round(position.speed * 3.6)} км/ч
                </p>
              </div>
            )}

            {driverStatus === 'online' && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <Wifi className="w-4 h-4" />
                <span>Местоположение передается клиентам</span>
              </div>
            )}

            {driverStatus === 'offline' && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <WifiOff className="w-4 h-4" />
                <span>Отслеживание приостановлено (вы оффлайн)</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Местоположение не определено
            </p>
            <Button onClick={refreshPosition} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Определение...' : 'Определить местоположение'}
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>
            💡 Точное местоположение необходимо для:
          </p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Показа вашего местоположения клиентам</li>
            <li>Получения ближайших заказов</li>
            <li>Навигации к клиентам</li>
          </ul>
        </div>

        {driverStatus === 'online' && position && (
          <Button
            variant="outline"
            size="sm"
            onClick={refreshPosition}
            disabled={loading}
            className="w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Обновить местоположение
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationTracker;