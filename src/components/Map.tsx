import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

interface MapProps {
  restaurants?: Array<{
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    rating?: number;
  }>;
  deliveryLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  showCurrentLocation?: boolean;
  height?: string;
}

const Map: React.FC<MapProps> = ({ 
  restaurants = [], 
  deliveryLocation,
  showCurrentLocation = false,
  height = "400px" 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [needsToken, setNeedsToken] = useState(false);

  // Mock restaurants data for demo
  const mockRestaurants = [
    {
      id: '1',
      name: 'Пиццерия "Итальяно"',
      address: 'ул. Пушкина, 10',
      lat: 55.7558,
      lng: 37.6173,
      rating: 4.5
    },
    {
      id: '2', 
      name: 'Суши "Токио"',
      address: 'ул. Ленина, 25',
      lat: 55.7478,
      lng: 37.6236,
      rating: 4.8
    },
    {
      id: '3',
      name: 'Бургерная "Гриль"',
      address: 'пр. Мира, 15',
      lat: 55.7658,
      lng: 37.6094,
      rating: 4.2
    }
  ];

  const restaurantData = restaurants.length > 0 ? restaurants : mockRestaurants;

  useEffect(() => {
    // Try to get token from environment first
    const envToken = process.env.MAPBOX_PUBLIC_TOKEN;
    if (envToken) {
      setMapboxToken(envToken);
      initializeMap(envToken);
    } else {
      setNeedsToken(true);
    }
  }, []);

  const initializeMap = (token: string) => {
    if (!mapContainer.current || !token) return;

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [37.6173, 55.7558], // Moscow center
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add restaurant markers
    restaurantData.forEach((restaurant) => {
      const el = document.createElement('div');
      el.className = 'restaurant-marker';
      el.innerHTML = '🍽️';
      el.style.fontSize = '24px';
      el.style.cursor = 'pointer';

      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">${restaurant.name}</h3>
            <p class="text-sm text-gray-600">${restaurant.address}</p>
            ${restaurant.rating ? `<p class="text-sm">⭐ ${restaurant.rating}</p>` : ''}
          </div>
        `);

      new mapboxgl.Marker(el)
        .setLngLat([restaurant.lng, restaurant.lat])
        .setPopup(popup)
        .addTo(map.current!);
    });

    // Add delivery location marker if provided
    if (deliveryLocation) {
      const el = document.createElement('div');
      el.className = 'delivery-marker';
      el.innerHTML = '📍';
      el.style.fontSize = '24px';

      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">Адрес доставки</h3>
            <p class="text-sm text-gray-600">${deliveryLocation.address}</p>
          </div>
        `);

      new mapboxgl.Marker(el)
        .setLngLat([deliveryLocation.lng, deliveryLocation.lat])
        .setPopup(popup)
        .addTo(map.current!);
    }

    // Get user location if requested
    if (showCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          const el = document.createElement('div');
          el.className = 'user-marker';
          el.innerHTML = '📱';
          el.style.fontSize = '20px';

          new mapboxgl.Marker(el)
            .setLngLat([longitude, latitude])
            .addTo(map.current!);

          map.current!.flyTo({
            center: [longitude, latitude],
            zoom: 14
          });
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }

    return () => {
      map.current?.remove();
    };
  };

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setNeedsToken(false);
      initializeMap(mapboxToken);
    }
  };

  if (needsToken) {
    return (
      <Card className="w-full" style={{ height }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Настройка карты
          </CardTitle>
          <CardDescription>
            Для отображения карты необходим токен Mapbox. 
            Получите его на <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Введите ваш Mapbox Public Token"
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
          />
          <Button onClick={handleTokenSubmit} className="w-full">
            <Navigation className="w-4 h-4 mr-2" />
            Инициализировать карту
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden shadow-lg" style={{ height }}>
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-background/5 rounded-lg" />
    </div>
  );
};

export default Map;