import { Plus, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface MenuItemProps {
  id: string;
  name: string;
  image: string;
  price: number;
  description: string;
  tags?: string[];
  ingredients?: string[];
  weight?: string;
  popular?: boolean;
}

const MenuItem = ({ 
  name, 
  image, 
  price,
  description,
  tags,
  ingredients,
  weight,
  popular = false
}: MenuItemProps) => {
  const [quantity, setQuantity] = useState(0);

  const addToCart = () => {
    setQuantity(prev => prev + 1);
  };

  const removeFromCart = () => {
    setQuantity(prev => Math.max(0, prev - 1));
  };

  return (
    <Card className="group cursor-pointer overflow-hidden shadow-card hover:shadow-glow transition-all duration-300">
      <div className="flex gap-4 p-4">
        {/* Image */}
        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {popular && (
            <div className="absolute top-1 left-1">
              <Badge className="bg-accent text-accent-foreground text-xs px-2 py-1">
                Хит
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {name}
            </h3>
            <span className="text-xl font-bold text-primary ml-4">{price}€</span>
          </div>

          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {description}
          </p>

          {/* Weight */}
          {weight && (
            <p className="text-xs text-muted-foreground mb-2">{weight}</p>
          )}

          {/* Ingredients */}
          {ingredients && ingredients.length > 0 && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
              Состав: {ingredients.join(", ")}
            </p>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Add to Cart */}
          <div className="flex items-center gap-3">
            {quantity === 0 ? (
              <Button 
                size="sm" 
                onClick={addToCart}
                className="bg-gradient-primary hover:shadow-glow transition-all"
              >
                <Plus className="w-4 h-4 mr-1" />
                В корзину
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={removeFromCart}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-lg font-semibold min-w-[2rem] text-center">{quantity}</span>
                <Button 
                  size="sm" 
                  onClick={addToCart}
                  className="bg-gradient-primary hover:shadow-glow"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MenuItem;