import { useState } from "react";
import { Plus, Minus, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import ItemCustomization, { Size, Addon } from "./ItemCustomization";

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
  restaurantId?: string;
  restaurantName?: string;
  sizes?: Size[];
  addons?: Addon[];
  customizable?: boolean;
}

const MenuItem = ({ 
  id,
  name, 
  image, 
  price,
  description,
  tags,
  ingredients,
  weight,
  popular = false,
  restaurantId,
  restaurantName,
  sizes = [],
  addons = [],
  customizable = false
}: MenuItemProps) => {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const quantity = getItemQuantity(id);
  const [showCustomization, setShowCustomization] = useState(false);

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      image,
      price,
      restaurantId,
      restaurantName,
      category: 'food'
    });
  };

  const handleUpdateQuantity = (newQuantity: number) => {
    updateQuantity(id, newQuantity);
  };

  const handleCustomAddToCart = (customization: {
    sizeId?: string;
    selectedAddons: string[];
    totalPrice: number;
    quantity: number;
  }) => {
    // For now, just add the item with the calculated price
    // In a real app, you'd store the customization details
    for (let i = 0; i < customization.quantity; i++) {
      addItem({
        id: `${id}-${Date.now()}-${i}`, // Unique ID for customized items
        name,
        image,
        price: customization.totalPrice / customization.quantity,
        restaurantId,
        restaurantName,
        category: 'food'
      });
    }
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
            {customizable ? (
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowCustomization(true)}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Настроить
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleAddToCart}
                  className="bg-gradient-primary hover:shadow-glow transition-all"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  В корзину
                </Button>
              </div>
            ) : quantity === 0 ? (
              <Button 
                size="sm" 
                onClick={handleAddToCart}
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
                  onClick={() => handleUpdateQuantity(quantity - 1)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-lg font-semibold min-w-[2rem] text-center">{quantity}</span>
                <Button 
                  size="sm" 
                  onClick={() => handleUpdateQuantity(quantity + 1)}
                  className="bg-gradient-primary hover:shadow-glow"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Item Customization Modal */}
      <ItemCustomization
        isOpen={showCustomization}
        onClose={() => setShowCustomization(false)}
        itemName={name}
        itemImage={image}
        basePrice={price}
        sizes={sizes}
        addons={addons}
        onAddToCart={handleCustomAddToCart}
      />
    </Card>
  );
};

export default MenuItem;