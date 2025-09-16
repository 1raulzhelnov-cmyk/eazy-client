import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X, Star, Clock, Euro } from "lucide-react";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: {
    cuisine: string[];
    priceRange: [number, number];
    rating: number;
    deliveryTime: number;
    sortBy: string;
  };
  onFiltersChange: (filters: any) => void;
  availableCuisines: string[];
  onClearFilters: () => void;
}

const SearchFilters = ({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  availableCuisines,
  onClearFilters,
}: SearchFiltersProps) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleCuisineToggle = (cuisine: string) => {
    const newCuisines = filters.cuisine.includes(cuisine)
      ? filters.cuisine.filter(c => c !== cuisine)
      : [...filters.cuisine, cuisine];

    onFiltersChange({
      ...filters,
      cuisine: newCuisines,
    });
  };

  const handlePriceRangeChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      priceRange: [value[0], value[1]] as [number, number],
    });
  };

  const handleRatingChange = (rating: number) => {
    onFiltersChange({
      ...filters,
      rating: filters.rating === rating ? 0 : rating,
    });
  };

  const handleDeliveryTimeChange = (time: number) => {
    onFiltersChange({
      ...filters,
      deliveryTime: filters.deliveryTime === time ? 0 : time,
    });
  };

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({
      ...filters,
      sortBy,
    });
  };

  const activeFiltersCount = 
    filters.cuisine.length + 
    (filters.rating > 0 ? 1 : 0) + 
    (filters.deliveryTime > 0 ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 50 ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Поиск ресторанов, блюд, кухни..."
          className="pl-10 pr-4"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Quick Filters and Sort */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={filters.sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Сортировка" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">По рейтингу</SelectItem>
            <SelectItem value="delivery_time">По времени доставки</SelectItem>
            <SelectItem value="price_asc">По цене (возрастание)</SelectItem>
            <SelectItem value="price_desc">По цене (убывание)</SelectItem>
            <SelectItem value="popularity">По популярности</SelectItem>
          </SelectContent>
        </Select>

        <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="w-4 h-4 mr-2" />
              Фильтры
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Фильтры</SheetTitle>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {/* Cuisine Filter */}
              <div>
                <h3 className="font-semibold mb-3">Кухня</h3>
                <div className="space-y-2">
                  {availableCuisines.map((cuisine) => (
                    <div key={cuisine} className="flex items-center space-x-2">
                      <Checkbox
                        id={cuisine}
                        checked={filters.cuisine.includes(cuisine)}
                        onCheckedChange={() => handleCuisineToggle(cuisine)}
                      />
                      <label
                        htmlFor={cuisine}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {cuisine}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold mb-3">Ценовой диапазон</h3>
                <div className="px-3">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={handlePriceRangeChange}
                    max={50}
                    min={0}
                    step={5}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{filters.priceRange[0]}€</span>
                    <span>{filters.priceRange[1]}€</span>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h3 className="font-semibold mb-3">Рейтинг</h3>
                <div className="space-y-2">
                  {[5, 4, 3].map((rating) => (
                    <Button
                      key={rating}
                      variant={filters.rating === rating ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleRatingChange(rating)}
                      className="w-full justify-start"
                    >
                      <div className="flex items-center gap-1">
                        {Array.from({ length: rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                        ))}
                        <span className="ml-2">от {rating}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Delivery Time */}
              <div>
                <h3 className="font-semibold mb-3">Время доставки</h3>
                <div className="space-y-2">
                  {[15, 30, 45, 60].map((time) => (
                    <Button
                      key={time}
                      variant={filters.deliveryTime === time ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleDeliveryTimeChange(time)}
                      className="w-full justify-start"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      до {time} мин
                    </Button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onClearFilters();
                    setIsFiltersOpen(false);
                  }}
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Очистить фильтры
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {filters.cuisine.map((cuisine) => (
              <Badge key={cuisine} variant="secondary" className="text-xs">
                {cuisine}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 hover:bg-transparent"
                  onClick={() => handleCuisineToggle(cuisine)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
            
            {filters.rating > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Star className="w-3 h-3 mr-1 fill-current" />
                от {filters.rating}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 hover:bg-transparent"
                  onClick={() => handleRatingChange(filters.rating)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}

            {filters.deliveryTime > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                до {filters.deliveryTime} мин
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 hover:bg-transparent"
                  onClick={() => handleDeliveryTimeChange(filters.deliveryTime)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}

            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 50) && (
              <Badge variant="secondary" className="text-xs">
                <Euro className="w-3 h-3 mr-1" />
                {filters.priceRange[0]}€ - {filters.priceRange[1]}€
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 hover:bg-transparent"
                  onClick={() => handlePriceRangeChange([0, 50])}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;