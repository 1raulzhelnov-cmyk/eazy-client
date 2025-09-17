import { useState } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Circle, Sparkles, Gift, Heart, Hash } from "lucide-react";

const balloonCategories = [
  { id: "all", name: "Все шары", Icon: Circle },
  { id: "helium", name: "Гелиевые", Icon: Circle },
  { id: "foil", name: "Фольгированные", Icon: Sparkles },
  { id: "birthday", name: "День рождения", Icon: Gift },
  { id: "wedding", name: "Свадебные", Icon: Heart },
  { id: "numbers", name: "Цифры", Icon: Hash },
];

// Balloon products data
const balloons = [
  {
    id: "b1",
    name: "Набор гелиевых шаров «Радуга»",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop",
    price: 15,
    originalPrice: 20,
    description: "Яркий набор из 10 разноцветных гелиевых шаров. Поднимет настроение на любом празднике.",
    tags: ["10 шт", "Популярные"],
    category: "helium"
  },
  {
    id: "b2",
    name: "Фольгированная цифра «5»",
    image: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=600&h=400&fit=crop",
    price: 8,
    description: "Большая розовая цифра 5 из фольги. Высота 86 см, идеальна для детского дня рождения.",
    tags: ["86 см", "Розовая"],
    category: "numbers"
  },
  {
    id: "b3",
    name: "Свадебный набор «Любовь»",
    image: "https://images.unsplash.com/photo-1519657337289-077653f724ed?w=600&h=400&fit=crop",
    price: 45,
    originalPrice: 55,
    description: "Элегантный набор белых и золотых шаров в форме сердец. Создаст романтическую атмосферу.",
    tags: ["Эксклюзив", "Сердца"],
    category: "wedding"
  },
  {
    id: "b4",
    name: "Шар «С Днем рождения!»",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=400&fit=crop",
    price: 6,
    description: "Яркий фольгированный шар с поздравительной надписью. Обязательный атрибут праздника!",
    tags: ["Надпись", "Яркий"],
    category: "birthday"
  },
  {
    id: "b5",
    name: "Букет из воздушных шаров",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop",
    price: 22,
    description: "Стильный букет из 15 шаров разных размеров в пастельных тонах.",
    tags: ["15 шт", "Пастель"],
    category: "helium"
  },
  {
    id: "b6",
    name: "Фольгированная звезда",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop",
    price: 7,
    description: "Красивая золотая звезда из фольги. Размер 45 см, отлично смотрится в композициях.",
    tags: ["45 см", "Золотая"],
    category: "foil"
  },
];

const BalloonCategoryFilter = ({ selectedCategory, onCategoryChange }: {selectedCategory: string, onCategoryChange: (category: string) => void}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {balloonCategories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`whitespace-nowrap px-4 py-2 rounded-lg transition-all hover:scale-105 flex items-center gap-2 ${
            selectedCategory === category.id 
              ? "bg-gradient-primary text-white shadow-glow" 
              : "bg-secondary text-secondary-foreground hover:bg-muted"
          }`}
        >
          <category.Icon className="w-4 h-4" />
          {category.name}
        </button>
      ))}
    </div>
  );
};

const Balloons = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredBalloons = selectedCategory === "all" 
    ? balloons 
    : balloons.filter(balloon => balloon.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Circle className="w-8 h-8 md:w-12 md:h-12" />
            <h1 className="text-3xl md:text-5xl font-bold">
              Праздничные шары
            </h1>
          </div>
          <p className="text-lg mb-6 opacity-90">
            Создаем яркие праздники с нашими воздушными шарами
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
              Гелий в подарок
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
              Готовые композиции
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
              Быстрая доставка
            </Badge>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <BalloonCategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>
      </section>

      {/* Products Grid */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {selectedCategory === "all" ? "Все шары" : "Найденные товары"}
            </h2>
            <span className="text-muted-foreground">
              {filteredBalloons.length} товаров
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBalloons.map((balloon) => (
              <ProductCard key={balloon.id} {...balloon} category="balloons" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Balloons;