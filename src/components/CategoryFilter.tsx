import { Badge } from "@/components/ui/badge";

const categories = [
  { id: "all", name: "Все", icon: "🍽️" },
  { id: "pizza", name: "Пицца", icon: "🍕" },
  { id: "sushi", name: "Суши", icon: "🍣" },
  { id: "burger", name: "Бургеры", icon: "🍔" },
  { id: "coffee", name: "Кофе", icon: "☕" },
  { id: "dessert", name: "Десерты", icon: "🧁" },
  { id: "healthy", name: "Здоровое", icon: "🥗" },
  { id: "asian", name: "Азиатская", icon: "🥢" },
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
          <span>{category.icon}</span>
          {category.name}
        </Badge>
      ))}
    </div>
  );
};

export default CategoryFilter;