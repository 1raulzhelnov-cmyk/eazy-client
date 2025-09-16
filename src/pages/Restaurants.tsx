import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import RestaurantCard from "@/components/RestaurantCard";
import SearchFilters from "@/components/SearchFilters";
import useSearch from "@/hooks/useSearch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Star } from "lucide-react";

// Enhanced restaurant data with more details for filtering
const restaurants = [
  {
    id: "1",
    name: "Piccola Italia",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop&crop=faces",
    cuisine: "Итальянская",
    rating: 4.8,
    deliveryTime: "25-35 мин",
    deliveryFee: 0,
    price: 25,
    tags: ["Пицца", "Паста", "Популярное"],
    category: "pizza",
    description: "Аутентичная итальянская кухня с дровяной печью для пиццы",
    address: "ул. Пушкина, 15",
    workingHours: "10:00 - 23:00",
    minOrder: 15
  },
  {
    id: "2", 
    name: "Суши Мастер",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=400&fit=crop&crop=faces",
    cuisine: "Японская",
    rating: 4.7,
    deliveryTime: "30-40 мин",
    deliveryFee: 0,
    price: 35,
    tags: ["Суши", "Роллы", "Свежее"],
    category: "sushi",
    description: "Свежие суши и роллы от японского мастера",
    address: "ул. Кренгольма, 8",
    workingHours: "11:00 - 22:00",
    minOrder: 20
  },
  {
    id: "3",
    name: "Burger Club",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop&crop=faces",
    cuisine: "Американская", 
    rating: 4.6,
    deliveryTime: "20-30 мин",
    deliveryFee: 0,
    price: 18,
    tags: ["Бургеры", "Картофель фри", "Быстро"],
    category: "burger",
    description: "Сочные бургеры из мраморной говядины",
    address: "пр. Мира, 22",
    workingHours: "12:00 - 24:00",
    minOrder: 12
  },
  {
    id: "4",
    name: "Coffee & More",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop&crop=faces",
    cuisine: "Кофейня",
    rating: 4.9,
    deliveryTime: "15-25 мин", 
    deliveryFee: 0,
    price: 12,
    tags: ["Кофе", "Десерты", "Завтраки"],
    category: "coffee",
    description: "Свежеобжаренный кофе и домашние десерты",
    address: "ул. Вокзальная, 5",
    workingHours: "07:00 - 22:00",
    minOrder: 8
  },
  {
    id: "5",
    name: "Азиатский Дворик",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop&crop=faces",
    cuisine: "Азиатская",
    rating: 4.5,
    deliveryTime: "35-45 мин",
    deliveryFee: 0,
    price: 22,
    tags: ["Лапша", "Димсамы", "Острое"],
    category: "asian",
    description: "Традиционные блюда Азии с ароматными специями",
    address: "ул. Таллинская, 30",
    workingHours: "11:00 - 23:00",
    minOrder: 18
  },
  {
    id: "6",
    name: "Салатная Лавка",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop&crop=faces",
    cuisine: "Здоровая еда",
    rating: 4.7,
    deliveryTime: "20-30 мин",
    deliveryFee: 0,
    price: 16,
    tags: ["Салаты", "Смузи", "Веган"],
    category: "healthy",
    description: "Свежие салаты и полезные блюда для здорового питания",
    address: "ул. Рийа, 12",
    workingHours: "08:00 - 21:00",
    minOrder: 10
  },
  {
    id: "7",
    name: "Мясная Лавка",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop&crop=faces",
    cuisine: "Европейская",
    rating: 4.4,
    deliveryTime: "40-50 мин",
    deliveryFee: 0,
    price: 45,
    tags: ["Стейки", "Гриль", "Премиум"],
    category: "steakhouse",
    description: "Премиальные стейки и блюда на гриле",
    address: "ул. Петри, 7",
    workingHours: "16:00 - 24:00",
    minOrder: 30
  },
  {
    id: "8",
    name: "Домашняя Кухня",
    image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&h=400&fit=crop&crop=faces",
    cuisine: "Русская",
    rating: 4.3,
    deliveryTime: "30-40 мин",
    deliveryFee: 0,
    price: 20,
    tags: ["Борщ", "Блины", "Домашнее"],
    category: "russian",
    description: "Традиционные русские блюда как дома",
    address: "ул. Ленина, 45",
    workingHours: "09:00 - 22:00",
    minOrder: 15
  }
];

const Restaurants = () => {
  const location = useLocation();
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    filteredAndSortedItems,
    availableCuisines,
    clearFilters,
  } = useSearch(restaurants);

  // Handle URL search parameter
  const searchParams = new URLSearchParams(location.search);
  const urlSearchQuery = searchParams.get('search');
  
  useEffect(() => {
    if (urlSearchQuery && urlSearchQuery !== searchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [urlSearchQuery, searchQuery, setSearchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            🍽️ Рестораны Нарвы
          </h1>
          <p className="text-lg mb-6 opacity-90">
            Лучшие рестораны с бесплатной доставкой за 30 минут
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-6 border-b">
        <div className="container mx-auto px-4">
          <SearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            onFiltersChange={setFilters}
            availableCuisines={availableCuisines}
            onClearFilters={clearFilters}
          />
        </div>
      </section>

      {/* Results Summary */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {searchQuery ? `Результаты поиска: "${searchQuery}"` : "Все рестораны"}
            </h2>
            <div className="text-muted-foreground">
              Найдено: {filteredAndSortedItems.length} из {restaurants.length}
            </div>
          </div>
        </div>
      </section>

      {/* Restaurants Grid */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          {filteredAndSortedItems.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Ничего не найдено</h3>
              <p className="text-muted-foreground mb-6">
                Попробуйте изменить параметры поиска или очистить фильтры
              </p>
              <Button onClick={clearFilters} className="bg-gradient-primary hover:shadow-glow">
                Очистить фильтры
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedItems.map((restaurant) => (
                <RestaurantCard key={restaurant.id} {...restaurant} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Restaurants;