import { Plus, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  description?: string;
  tags?: string[];
  inStock?: boolean;
}

const ProductCard = ({ 
  name, 
  image, 
  price,
  originalPrice,
  description,
  tags,
  inStock = true
}: ProductCardProps) => {
  return (
    <Card className="group cursor-pointer overflow-hidden shadow-card hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <Button variant="ghost" size="icon" className="bg-white/80 hover:bg-white">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
        {originalPrice && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-accent text-accent-foreground">
              Скидка {Math.round(((originalPrice - price) / originalPrice) * 100)}%
            </Badge>
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary" className="text-sm">Нет в наличии</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors mb-1">
            {name}
          </h3>
          {description && (
            <p className="text-muted-foreground text-sm line-clamp-2">{description}</p>
          )}
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Price & Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">{price}€</span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">{originalPrice}€</span>
            )}
          </div>
          <Button 
            size="sm" 
            disabled={!inStock}
            className="bg-gradient-primary hover:shadow-glow transition-all"
          >
            <Plus className="w-4 h-4 mr-1" />
            В корзину
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;