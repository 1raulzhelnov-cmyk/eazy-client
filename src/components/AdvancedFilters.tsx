import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Filter, Star, Clock, MapPin } from 'lucide-react';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  currentFilters: FilterState;
}

export interface FilterState {
  priceRange: [number, number];
  cuisines: string[];
  rating: number;
  deliveryTime: number;
  distance: number;
  features: string[];
  sortBy: string;
}

const CUISINES = [
  'Пицца', 'Суши', 'Бургеры', 'Азиатская', 'Итальянская', 
  'Американская', 'Русская', 'Грузинская', 'Индийская', 'Мексиканская'
];

const FEATURES = [
  'Бесплатная доставка', 'Быстрая доставка', 'Веганские блюда', 
  'Халяль', 'Безглютеновые блюда', 'Алкоголь', 'Десерты', 'Завтраки'
];

const SORT_OPTIONS = [
  { value: 'rating', label: 'По рейтингу' },
  { value: 'delivery_time', label: 'По времени доставки' },
  { value: 'price_low', label: 'По цене: сначала дешевые' },
  { value: 'price_high', label: 'По цене: сначала дорогие' },
  { value: 'distance', label: 'По расстоянию' },
  { value: 'popularity', label: 'По популярности' }
];

export const AdvancedFilters = ({ onFiltersChange, currentFilters }: AdvancedFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>(currentFilters);
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const toggleCuisine = (cuisine: string) => {
    const newCuisines = filters.cuisines.includes(cuisine)
      ? filters.cuisines.filter(c => c !== cuisine)
      : [...filters.cuisines, cuisine];
    updateFilter('cuisines', newCuisines);
  };

  const toggleFeature = (feature: string) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature];
    updateFilter('features', newFeatures);
  };

  const applyFilters = () => {
    onFiltersChange(filters);
    setIsOpen(false);
  };

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      priceRange: [0, 100],
      cuisines: [],
      rating: 0,
      deliveryTime: 60,
      distance: 10,
      features: [],
      sortBy: 'rating'
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const activeFiltersCount = 
    filters.cuisines.length + 
    filters.features.length + 
    (filters.rating > 0 ? 1 : 0) + 
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 100 ? 1 : 0);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Фильтры
          {activeFiltersCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-primary text-primary-foreground">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Фильтры поиска</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Сортировка */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Сортировать по</Label>
            <div className="grid grid-cols-2 gap-2">
              {SORT_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={filters.sortBy === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter('sortBy', option.value)}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Ценовой диапазон */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Цена: {filters.priceRange[0]}€ - {filters.priceRange[1]}€
            </Label>
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Рейтинг */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Минимальный рейтинг</Label>
            <div className="flex gap-2">
              {[0, 3, 4, 4.5].map((rating) => (
                <Button
                  key={rating}
                  variant={filters.rating === rating ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter('rating', rating)}
                  className="flex items-center gap-1"
                >
                  {rating === 0 ? 'Любой' : (
                    <>
                      <Star className="w-3 h-3 fill-current" />
                      {rating}+
                    </>
                  )}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Время доставки */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              <Clock className="w-4 h-4 inline mr-1" />
              Максимальное время доставки: {filters.deliveryTime} мин
            </Label>
            <Slider
              value={[filters.deliveryTime]}
              onValueChange={(value) => updateFilter('deliveryTime', value[0])}
              max={120}
              min={15}
              step={15}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Расстояние */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              <MapPin className="w-4 h-4 inline mr-1" />
              Максимальное расстояние: {filters.distance} км
            </Label>
            <Slider
              value={[filters.distance]}
              onValueChange={(value) => updateFilter('distance', value[0])}
              max={25}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Кухни */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Тип кухни</Label>
            <div className="flex flex-wrap gap-2">
              {CUISINES.map((cuisine) => (
                <Badge
                  key={cuisine}
                  variant={filters.cuisines.includes(cuisine) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => toggleCuisine(cuisine)}
                >
                  {cuisine}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Особенности */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Особенности</Label>
            <div className="space-y-2">
              {FEATURES.map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox
                    id={feature}
                    checked={filters.features.includes(feature)}
                    onCheckedChange={() => toggleFeature(feature)}
                  />
                  <Label htmlFor={feature} className="text-sm cursor-pointer">
                    {feature}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <Button onClick={applyFilters} className="flex-1">
              Применить фильтры
            </Button>
            <Button variant="outline" onClick={resetFilters}>
              Сбросить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedFilters;