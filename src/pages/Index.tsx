import { useState } from "react";
import Header from "@/components/Header";
import CategoryFilter from "@/components/CategoryFilter";
import RestaurantCard from "@/components/RestaurantCard";

// Mock data for restaurants
const restaurants = [
  {
    id: "1",
    name: "Piccola Italia",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop&crop=faces",
    cuisine: "Итальянская кухня",
    rating: 4.8,
    deliveryTime: "25-35 мин",
    deliveryFee: 0,
    tags: ["Пицца", "Паста", "Популярное"],
    category: "pizza"
  },
  {
    id: "2", 
    name: "Суши Мастер",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=400&fit=crop&crop=faces",
    cuisine: "Японская кухня",
    rating: 4.7,
    deliveryTime: "30-40 мин",
    deliveryFee: 199,
    tags: ["Суши", "Роллы", "Свежее"],
    category: "sushi"
  },
  {
    id: "3",
    name: "Burger Club",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop&crop=faces",
    cuisine: "Американская кухня", 
    rating: 4.6,
    deliveryTime: "20-30 мин",
    deliveryFee: 0,
    tags: ["Бургеры", "Картофель фри", "Быстро"],
    category: "burger"
  },
  {
    id: "4",
    name: "Coffee & More",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop&crop=faces",
    cuisine: "Кофе и десерты",
    rating: 4.9,
    deliveryTime: "15-25 мин", 
    deliveryFee: 150,
    tags: ["Кофе", "Десерты", "Завтраки"],
    category: "coffee"
  },
  {
    id: "5",
    name: "Азиатский Дворик",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop&crop=faces",
    cuisine: "Азиатская кухня",
    rating: 4.5,
    deliveryTime: "35-45 мин",
    deliveryFee: 250,
    tags: ["Лапша", "Димсамы", "Острое"],
    category: "asian"
  },
  {
    id: "6",
    name: "Салатная Лавка",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop&crop=faces",
    cuisine: "Здоровая еда",
    rating: 4.7,
    deliveryTime: "20-30 мин",
    deliveryFee: 0,
    tags: ["Салаты", "Смузи", "Веган"],
    category: "healthy"
  },
];

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredRestaurants = selectedCategory === "all" 
    ? restaurants 
    : restaurants.filter(restaurant => restaurant.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Доставка еды за 
            <span className="text-primary-glow"> 30 минут</span>
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Лучшие рестораны города привозят вкусную еду прямо к вашей двери
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>
      </section>

      {/* Restaurants Grid */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {selectedCategory === "all" ? "Все рестораны" : "Найдено ресторанов"}
            </h2>
            <span className="text-muted-foreground">
              {filteredRestaurants.length} {selectedCategory === "all" ? "ресторанов" : "результатов"}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} {...restaurant} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
