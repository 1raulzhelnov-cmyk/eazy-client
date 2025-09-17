import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Utensils, Pizza, Fish, Sandwich, Coffee, Flower2, Circle, Gift, Cake } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const getCategories = (t: (key: string) => string) => [
  { id: "all", name: t('categories.all'), Icon: ShoppingBag },
  { id: "food", name: t('categories.food'), Icon: Utensils },
  { id: "pizza", name: t('categories.pizza'), Icon: Pizza },
  { id: "sushi", name: t('categories.sushi'), Icon: Fish },
  { id: "burger", name: t('categories.burger'), Icon: Sandwich },
  { id: "coffee", name: t('categories.coffee'), Icon: Coffee },
  { id: "flowers", name: t('categories.flowers'), Icon: Flower2 },
  { id: "balloons", name: t('categories.balloons'), Icon: Circle },
  { id: "gifts", name: t('categories.gifts'), Icon: Gift },
  { id: "dessert", name: t('categories.dessert'), Icon: Cake },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const { t } = useLanguage();
  const categories = getCategories(t);
  
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <Badge
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "secondary"}
          className={`whitespace-nowrap cursor-pointer transition-all hover:scale-105 flex items-center gap-2 px-4 py-2 ${
            selectedCategory === category.id 
              ? "bg-gradient-primary text-white shadow-glow" 
              : "hover:bg-muted"
          }`}
          onClick={() => onCategoryChange(category.id)}
        >
          <category.Icon className="w-4 h-4" />
          {category.name}
        </Badge>
      ))}
    </div>
  );
};

export default CategoryFilter;