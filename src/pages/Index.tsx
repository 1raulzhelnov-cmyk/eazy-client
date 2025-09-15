import { useState } from "react";
import Header from "@/components/Header";
import CategoryFilter from "@/components/CategoryFilter";
import RestaurantCard from "@/components/RestaurantCard";

// Mock data for stores (restaurants, flowers, balloons, etc.)
const stores = [
  // Food stores
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
    deliveryFee: 0,
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
    deliveryFee: 0,
    tags: ["Кофе", "Десерты", "Завтраки"],
    category: "coffee"
  },
  
  // Flower shops
  {
    id: "5",
    name: "Розовый Сад",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&h=400&fit=crop&crop=faces",
    cuisine: "Цветочный магазин",
    rating: 4.9,
    deliveryTime: "45-60 мин",
    deliveryFee: 0,
    tags: ["Розы", "Букеты", "Свадебные"],
    category: "flowers"
  },
  {
    id: "6",
    name: "Нарвские Тюльпаны",
    image: "https://images.unsplash.com/photo-1487070183336-b863922373d4?w=600&h=400&fit=crop&crop=faces",
    cuisine: "Цветы и растения",
    rating: 4.8,
    deliveryTime: "30-45 мин",
    deliveryFee: 0,
    tags: ["Тюльпаны", "Комнатные", "Сезонные"],
    category: "flowers"
  },
  
  // Balloon shops
  {
    id: "7",
    name: "Party Time",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop&crop=faces",
    cuisine: "Праздничные шары",
    rating: 4.7,
    deliveryTime: "20-30 мин",
    deliveryFee: 0,
    tags: ["День рождения", "Гелиевые", "Фольгированные"],
    category: "balloons"
  },
  {
    id: "8",
    name: "Balloon Magic",
    image: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=600&h=400&fit=crop&crop=faces",
    cuisine: "Шары и декор",
    rating: 4.6,
    deliveryTime: "15-25 мин",
    deliveryFee: 0,
    tags: ["Свадебные", "Корпоративные", "Детские"],
    category: "balloons"
  },

  // Gift shops
  {
    id: "9",
    name: "Подарочная Лавка",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&h=400&fit=crop&crop=faces",
    cuisine: "Подарки и сувениры",
    rating: 4.8,
    deliveryTime: "40-60 мин",
    deliveryFee: 0,
    tags: ["Сувениры", "Handmade", "Эксклюзив"],
    category: "gifts"
  }
];

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredStores = selectedCategory === "all" 
    ? stores 
    : selectedCategory === "food" 
    ? stores.filter(store => ["pizza", "sushi", "burger", "coffee", "dessert"].includes(store.category))
    : stores.filter(store => store.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Доставка всего в Нарву за 
            <span className="text-primary-glow"> 30 минут</span>
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Еда, цветы, шары и подарки — всё с бесплатной доставкой прямо к вашей двери
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

      {/* Stores Grid */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {selectedCategory === "all" ? "Все магазины" : 
               selectedCategory === "food" ? "Рестораны" :
               selectedCategory === "flowers" ? "Цветочные магазины" :
               selectedCategory === "balloons" ? "Магазины шаров" :
               selectedCategory === "gifts" ? "Подарочные магазины" :
               "Найденные магазины"}
            </h2>
            <span className="text-muted-foreground">
              {filteredStores.length} {selectedCategory === "all" ? "магазинов" : "результатов"}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStores.map((store) => (
              <RestaurantCard key={store.id} {...store} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
