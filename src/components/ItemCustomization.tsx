import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus } from "lucide-react";

export interface Size {
  id: string;
  name: string;
  priceModifier: number;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  category?: string;
}

interface ItemCustomizationProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemImage: string;
  basePrice: number;
  sizes?: Size[];
  addons?: Addon[];
  onAddToCart: (customization: {
    sizeId?: string;
    selectedAddons: string[];
    totalPrice: number;
    quantity: number;
  }) => void;
}

const ItemCustomization = ({
  isOpen,
  onClose,
  itemName,
  itemImage,
  basePrice,
  sizes = [],
  addons = [],
  onAddToCart,
}: ItemCustomizationProps) => {
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0]?.id || "");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  const currentSize = sizes.find(s => s.id === selectedSize);
  const sizedPrice = basePrice + (currentSize?.priceModifier || 0);
  const addonsPrice = selectedAddons.reduce((sum, addonId) => {
    const addon = addons.find(a => a.id === addonId);
    return sum + (addon?.price || 0);
  }, 0);
  const totalPrice = (sizedPrice + addonsPrice) * quantity;

  const handleAddonToggle = (addonId: string) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleAddToCart = () => {
    onAddToCart({
      sizeId: selectedSize,
      selectedAddons,
      totalPrice,
      quantity,
    });
    onClose();
  };

  // Group addons by category
  const groupedAddons = addons.reduce((groups, addon) => {
    const category = addon.category || "Добавки";
    if (!groups[category]) groups[category] = [];
    groups[category].push(addon);
    return groups;
  }, {} as Record<string, Addon[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Настройка заказа</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Info */}
          <div className="flex items-center gap-4">
            <img
              src={itemImage}
              alt={itemName}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h3 className="font-semibold text-lg">{itemName}</h3>
              <p className="text-muted-foreground">Базовая цена: {basePrice}€</p>
            </div>
          </div>

          {/* Size Selection */}
          {sizes.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Размер</Label>
              <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                {sizes.map((size) => (
                  <div key={size.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={size.id} id={size.id} />
                    <Label htmlFor={size.id} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span>{size.name}</span>
                        <span className="text-muted-foreground">
                          {size.priceModifier > 0 ? `+${size.priceModifier}€` : 
                           size.priceModifier < 0 ? `${size.priceModifier}€` : 'Базовая'}
                        </span>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Addons */}
          {Object.keys(groupedAddons).map((category) => (
            <div key={category} className="space-y-3">
              <Separator />
              <Label className="text-base font-medium">{category}</Label>
              <div className="space-y-2">
                {groupedAddons[category].map((addon) => (
                  <div key={addon.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={addon.id}
                      checked={selectedAddons.includes(addon.id)}
                      onCheckedChange={() => handleAddonToggle(addon.id)}
                    />
                    <Label htmlFor={addon.id} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span>{addon.name}</span>
                        <span className="text-muted-foreground">+{addon.price}€</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="space-y-3">
            <Separator />
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Количество</Label>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-lg font-semibold min-w-[2rem] text-center">
                  {quantity}
                </span>
                <Button
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="bg-gradient-primary"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <Card className="p-4 bg-muted/50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Базовая цена:</span>
                <span>{sizedPrice}€</span>
              </div>
              {addonsPrice > 0 && (
                <div className="flex justify-between">
                  <span>Добавки:</span>
                  <span>+{addonsPrice}€</span>
                </div>
              )}
              {quantity > 1 && (
                <div className="flex justify-between">
                  <span>Количество:</span>
                  <span>×{quantity}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Итого:</span>
                <span>{totalPrice.toFixed(2)}€</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleAddToCart}
              className="flex-1 bg-gradient-primary hover:shadow-glow"
            >
              Добавить в корзину - {totalPrice.toFixed(2)}€
            </Button>
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemCustomization;