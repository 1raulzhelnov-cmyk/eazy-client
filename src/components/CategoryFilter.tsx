import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Utensils, Pizza, Fish, Sandwich, Coffee, Flower2, Circle, Gift, Cake } from "lucide-react";

const categories = [
  { id: "all", name: "Все", Icon: ShoppingBag },
  { id: "food", name: "Еда", Icon: Utensils },
  { id: "pizza", name: "Пицца", Icon: Pizza },
  { id: "sushi", name: "Суши", Icon: Fish },
  { id: "burger", name: "Бургеры", Icon: Sandwich },
  { id: "coffee", name: "Кофе", Icon: Coffee },
  { id: "flowers", name: "Цветы", Icon: Flower2 },
  { id: "balloons", name: "Шары", Icon: Circle },
  { id: "gifts", name: "Подарки", Icon: Gift },
  { id: "dessert", name: "Десерты", Icon: Cake },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
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