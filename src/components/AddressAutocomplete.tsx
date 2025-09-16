import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface AddressDetails {
  formatted_address: string;
  lat: number;
  lng: number;
  place_id: string;
  components: {
    street_number?: string;
    route?: string;
    locality?: string;
    country?: string;
    postal_code?: string;
  };
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressDetails) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onAddressSelect,
  placeholder = "Начните вводить адрес...",
  className = "",
  initialValue = ""
}) => {
  const [query, setQuery] = useState(initialValue);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Check if Google Places API is available
    const checkGoogleAPI = () => {
      const storedKey = localStorage.getItem('google_places_api_key');
      if (storedKey) {
        setGoogleApiKey(storedKey);
        loadGoogleScript(storedKey);
      } else {
        setNeedsApiKey(true);
      }
    };

    checkGoogleAPI();
  }, []);

  const loadGoogleScript = (apiKey: string) => {
    if (window.google && window.google.maps) {
      setIsConfigured(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => {
      setIsConfigured(true);
      setNeedsApiKey(false);
    };
    script.onerror = () => {
      toast.error('Ошибка загрузки Google Places API');
    };
    document.head.appendChild(script);
  };

  const handleApiKeySubmit = () => {
    if (!googleApiKey.trim()) {
      toast.error('Введите Google Places API ключ');
      return;
    }

    localStorage.setItem('google_places_api_key', googleApiKey);
    loadGoogleScript(googleApiKey);
    toast.success('API ключ сохранен');
  };

  const searchPlaces = async (searchText: string) => {
    if (!isConfigured || !window.google || !searchText.trim()) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);

    try {
      const service = new window.google.maps.places.AutocompleteService();
      
      service.getPlacePredictions({
        input: searchText,
        types: ['address'],
        componentRestrictions: { country: 'ee' } // Estonia
      }, (predictions, status) => {
        setIsLoading(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPredictions(predictions.slice(0, 5));
          setShowSuggestions(true);
        } else {
          setPredictions([]);
          setShowSuggestions(false);
        }
      });
    } catch (error) {
      setIsLoading(false);
      console.error('Places API error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      searchPlaces(value);
    }, 300);
  };

  const selectPlace = async (placeId: string, description: string) => {
    if (!window.google) return;

    setQuery(description);
    setShowSuggestions(false);
    setIsLoading(true);

    try {
      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );

      service.getDetails({
        placeId: placeId,
        fields: ['formatted_address', 'geometry', 'address_components', 'place_id']
      }, (place, status) => {
        setIsLoading(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const addressDetails: AddressDetails = {
            formatted_address: place.formatted_address || description,
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0,
            place_id: placeId,
            components: {}
          };

          // Parse address components
          place.address_components?.forEach(component => {
            const types = component.types;
            if (types.includes('street_number')) {
              addressDetails.components.street_number = component.long_name;
            } else if (types.includes('route')) {
              addressDetails.components.route = component.long_name;
            } else if (types.includes('locality')) {
              addressDetails.components.locality = component.long_name;
            } else if (types.includes('country')) {
              addressDetails.components.country = component.long_name;
            } else if (types.includes('postal_code')) {
              addressDetails.components.postal_code = component.long_name;
            }
          });

          onAddressSelect(addressDetails);
          toast.success('Адрес выбран');
        }
      });
    } catch (error) {
      setIsLoading(false);
      console.error('Place details error:', error);
      toast.error('Ошибка получения деталей адреса');
    }
  };

  if (needsApiKey) {
    return (
      <Card className="p-4">
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Settings className="w-4 h-4" />
            Настройка Google Places API
          </div>
          <p className="text-sm text-muted-foreground">
            Для автодополнения адресов необходим Google Places API ключ. 
            Получите его в{' '}
            <a 
              href="https://console.cloud.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Google Cloud Console
            </a>
          </p>
          <div className="space-y-2">
            <Label htmlFor="google-api-key">Google Places API Key</Label>
            <Input
              id="google-api-key"
              type="password"
              placeholder="AIzaSy..."
              value={googleApiKey}
              onChange={(e) => setGoogleApiKey(e.target.value)}
            />
          </div>
          <Button onClick={handleApiKeySubmit} className="w-full">
            Сохранить и активировать
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(predictions.length > 0)}
          onBlur={() => {
            // Delay hiding to allow selection
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showSuggestions && predictions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
          <CardContent className="p-0">
            {predictions.map((prediction) => (
              <button
                key={prediction.place_id}
                className="w-full p-3 text-left hover:bg-muted transition-colors border-b last:border-b-0"
                onClick={() => selectPlace(prediction.place_id, prediction.description)}
              >
                <div className="font-medium text-sm">
                  {prediction.structured_formatting.main_text}
                </div>
                <div className="text-xs text-muted-foreground">
                  {prediction.structured_formatting.secondary_text}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Type declarations for Google Places API
declare global {
  interface Window {
    google: any;
  }
}

export default AddressAutocomplete;