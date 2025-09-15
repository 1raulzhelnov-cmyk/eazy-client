import { Clock, Star, Truck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface RestaurantCardProps {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  tags?: string[];
}

const RestaurantCard = ({ 
  id,
  name, 
  image, 
  cuisine, 
  rating, 
  deliveryTime, 
  deliveryFee, 
  tags 
}: RestaurantCardProps) => {
  return (
    <Link to={`/restaurant/${id}`}>
      <Card className="group cursor-pointer overflow-hidden shadow-card hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            {deliveryFee === 0 && (
              <Badge className="bg-secondary text-secondary-foreground">
                Бесплатная доставка
              </Badge>
            )}
          </div>
          <div className="absolute top-3 right-3">
            <div className="bg-black/70 text-white px-2 py-1 rounded-md text-sm flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {deliveryTime}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                {name}
              </h3>
              <p className="text-muted-foreground text-sm">{cuisine}</p>
            </div>
            <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-lg">
              <Star className="w-4 h-4 fill-food-yellow text-food-yellow" />
              <span className="text-sm font-medium">{rating}</span>
            </div>
          </div>

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

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Truck className="w-4 h-4" />
              {deliveryFee === 0 ? "Бесплатно" : `${deliveryFee}€`}
            </div>
            <span>{deliveryTime}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default RestaurantCard;