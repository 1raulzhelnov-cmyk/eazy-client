import { useState } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import FlowerBouquetBuilder from "@/components/FlowerBouquetBuilder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Flower2, Heart, Flower, Sparkles, Crown, TreePine, Palette } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const getFlowerCategories = (t: (key: string) => string) => [
  { id: "all", name: t('flowers.categories.all'), Icon: Flower2 },
  { id: "roses", name: t('flowers.categories.roses'), Icon: Heart },
  { id: "tulips", name: t('flowers.categories.tulips'), Icon: Flower },
  { id: "bouquets", name: t('flowers.categories.bouquets'), Icon: Sparkles },
  { id: "wedding", name: t('flowers.categories.wedding'), Icon: Crown },
  { id: "plants", name: t('flowers.categories.plants'), Icon: TreePine },
];

// Flower products data
const flowers = [
  {
    id: "f1",
    name: "Красные розы премиум",
    image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&h=400&fit=crop",
    price: 25,
    originalPrice: 35,
    description: "Свежие красные розы высшего качества. Идеальны для романтических моментов.",
    tags: ["Премиум", "Свежие"],
    category: "roses"
  },
  {
    id: "f2",
    name: "Букет весенних тюльпанов",
    image: "https://images.unsplash.com/photo-1491931616456-aadcc7189024?w=600&h=400&fit=crop",
    price: 18,
    description: "Яркий букет из разноцветных тюльпанов. Символ весны и новых начинаний.",
    tags: ["Весенние", "Яркие"],
    category: "tulips"
  },
  {
    id: "f3",
    name: "Свадебный букет невесты",
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=600&h=400&fit=crop",
    price: 85,
    originalPrice: 100,
    description: "Элегантный белый букет с пионами и розами для самого важного дня.",
    tags: ["Эксклюзив", "Handmade"],
    category: "wedding"
  },
  {
    id: "f4",
    name: "Микс букет «Радость»",
    image: "https://images.unsplash.com/photo-1487070183336-b863922373d4?w=600&h=400&fit=crop",
    price: 32,
    description: "Яркий микс из сезонных цветов. Поднимает настроение и дарит улыбки.",
    tags: ["Популярный", "Сезонный"],
    category: "bouquets"
  },
  {
    id: "f5",
    name: "Монстера в горшке",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop",
    price: 45,
    description: "Красивое комнатное растение монстера. Очищает воздух и украшает дом.",
    tags: ["Комнатное", "Полезное"],
    category: "plants"
  },
  {
    id: "f6",
    name: "Белые розы «Облако»",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&h=400&fit=crop",
    price: 28,
    description: "Нежные белые розы в изысканной упаковке. Символ чистоты и любви.",
    tags: ["Нежные", "Элегант"],
    category: "roses"
  },
];

const FlowerCategoryFilter = ({ selectedCategory, onCategoryChange, t }: {selectedCategory: string, onCategoryChange: (category: string) => void, t: (key: string) => string}) => {
  const flowerCategories = getFlowerCategories(t);
  
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {flowerCategories.map((category) => (
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

const Flowers = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showBouquetBuilder, setShowBouquetBuilder] = useState(false);
  const { t } = useLanguage();

  const filteredFlowers = selectedCategory === "all" 
    ? flowers 
    : flowers.filter(flower => flower.category === selectedCategory);

  const handleAddToCart = (bouquet: any) => {
    console.log('Custom bouquet added to cart:', bouquet);
    // In a real app, this would add the bouquet to the cart
    alert('Букет добавлен в корзину!');
    setShowBouquetBuilder(false);
  };

  if (showBouquetBuilder) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={() => setShowBouquetBuilder(false)}
            className="mb-4"
          >
            ← {t('flowers.back')}
          </Button>
          <FlowerBouquetBuilder onAddToCart={handleAddToCart} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Flower2 className="w-8 h-8 md:w-12 md:h-12" />
            <h1 className="text-3xl md:text-5xl font-bold">
              {t('flowers.hero.title')}
            </h1>
          </div>
          <p className="text-lg mb-6 opacity-90">
            {t('flowers.hero.subtitle')}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
              {t('flowers.hero.fresh')}
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
              {t('flowers.hero.production')}
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
              {t('flowers.hero.delivery')}
            </Badge>
          </div>
          <div className="mt-6">
            <Button 
              onClick={() => setShowBouquetBuilder(true)}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-6 py-3 flex items-center gap-2"
            >
              <Palette className="w-5 h-5" />
              {t('flowers.hero.create')}
            </Button>
          </div>
        </div>
      </section>

      <Separator className="bg-white/20" />

      {/* Filters */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <FlowerCategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            t={t}
          />
        </div>
      </section>

      {/* Products Grid */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {selectedCategory === "all" ? t('flowers.title.all') : t('flowers.title.found')}
            </h2>
            <span className="text-muted-foreground">
              {filteredFlowers.length} {t('flowers.products.count')}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFlowers.map((flower) => (
              <ProductCard key={flower.id} {...flower} category="flowers" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Flowers;