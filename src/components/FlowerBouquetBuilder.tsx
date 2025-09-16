import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Heart, Gift, Sparkles, Camera } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Flower {
  id: string;
  name: string;
  price: number;
  color: string;
  meaning: string;
  season: string;
  image: string;
  available: boolean;
}

interface BouquetItem {
  flower: Flower;
  quantity: number;
}

interface BouquetBuilderProps {
  onAddToCart: (bouquet: CustomBouquet) => void;
  occasion?: string;
}

interface CustomBouquet {
  id: string;
  name: string;
  items: BouquetItem[];
  wrapping: string;
  card: string;
  totalPrice: number;
  occasion: string;
  deliveryDate: string;
}

const FLOWERS: Flower[] = [
  {
    id: '1',
    name: 'Роза красная',
    price: 3.50,
    color: 'red',
    meaning: 'Любовь и страсть',
    season: 'all',
    image: '🌹',
    available: true
  },
  {
    id: '2',
    name: 'Роза белая',
    price: 3.50,
    color: 'white',
    meaning: 'Чистота и невинность',
    season: 'all',
    image: '🤍',
    available: true
  },
  {
    id: '3',
    name: 'Тюльпан',
    price: 2.80,
    color: 'pink',
    meaning: 'Совершенная любовь',
    season: 'spring',
    image: '🌷',
    available: true
  },
  {
    id: '4',
    name: 'Лилия',
    price: 4.20,
    color: 'white',
    meaning: 'Возрождение и надежда',
    season: 'summer',
    image: '🌺',
    available: true
  },
  {
    id: '5',
    name: 'Гвоздика', 
    price: 2.20,
    color: 'pink',
    meaning: 'Материнская любовь',
    season: 'all',
    image: '🌸',
    available: true
  },
  {
    id: '6',
    name: 'Хризантема',
    price: 3.00,
    color: 'yellow',
    meaning: 'Дружба и радость',
    season: 'autumn',
    image: '🌻',
    available: true
  }
];

const WRAPPING_OPTIONS = [
  { id: 'paper', name: 'Крафт-бумага', price: 2.50 },
  { id: 'silk', name: 'Шёлковая лента', price: 4.00 },
  { id: 'luxury', name: 'Подарочная коробка', price: 8.00 },
  { id: 'eco', name: 'Эко-упаковка', price: 3.50 }
];

const OCCASION_TEMPLATES = [
  {
    name: 'День рождения',
    flowers: [
      { flowerId: '1', quantity: 7 }, // Красные розы
      { flowerId: '4', quantity: 3 }  // Лилии
    ],
    wrapping: 'silk'
  },
  {
    name: 'Романтическое свидание',
    flowers: [
      { flowerId: '1', quantity: 11 } // Красные розы
    ],
    wrapping: 'luxury'
  },
  {
    name: '8 марта',
    flowers: [
      { flowerId: '3', quantity: 8 }, // Тюльпаны
      { flowerId: '5', quantity: 3 }  // Гвоздики
    ],
    wrapping: 'silk'
  },
  {
    name: 'Извинения',
    flowers: [
      { flowerId: '2', quantity: 9 } // Белые розы
    ],
    wrapping: 'paper'
  }
];

export const FlowerBouquetBuilder = ({ onAddToCart, occasion }: BouquetBuilderProps) => {
  const [bouquetItems, setBouquetItems] = useState<BouquetItem[]>([]);
  const [selectedWrapping, setSelectedWrapping] = useState('paper');
  const [cardMessage, setCardMessage] = useState('');
  const [bouquetName, setBouquetName] = useState('Мой букет');
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  // Автоматическое применение шаблона для случая
  useEffect(() => {
    if (occasion) {
      const template = OCCASION_TEMPLATES.find(t => 
        t.name.toLowerCase().includes(occasion.toLowerCase())
      );
      if (template) {
        applyTemplate(template);
      }
    }
  }, [occasion]);

  const applyTemplate = (template: typeof OCCASION_TEMPLATES[0]) => {
    const newItems: BouquetItem[] = template.flowers.map(tf => {
      const flower = FLOWERS.find(f => f.id === tf.flowerId);
      return flower ? { flower, quantity: tf.quantity } : null;
    }).filter(Boolean) as BouquetItem[];
    
    setBouquetItems(newItems);
    setSelectedWrapping(template.wrapping);
    setBouquetName(`Букет "${template.name}"`);
  };

  const addFlower = (flower: Flower) => {
    const existingItem = bouquetItems.find(item => item.flower.id === flower.id);
    
    if (existingItem) {
      setBouquetItems(items =>
        items.map(item =>
          item.flower.id === flower.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setBouquetItems(items => [...items, { flower, quantity: 1 }]);
    }
  };

  const removeFlower = (flowerId: string) => {
    setBouquetItems(items =>
      items.map(item =>
        item.flower.id === flowerId
          ? { ...item, quantity: Math.max(0, item.quantity - 1) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const updateQuantity = (flowerId: string, quantity: number) => {
    if (quantity === 0) {
      setBouquetItems(items => items.filter(item => item.flower.id !== flowerId));
    } else {
      setBouquetItems(items =>
        items.map(item =>
          item.flower.id === flowerId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const calculateTotal = () => {
    const flowersTotal = bouquetItems.reduce(
      (sum, item) => sum + (item.flower.price * item.quantity), 0
    );
    const wrappingPrice = WRAPPING_OPTIONS.find(w => w.id === selectedWrapping)?.price || 0;
    return flowersTotal + wrappingPrice;
  };

  const getTotalFlowers = () => {
    return bouquetItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleAddToCart = () => {
    if (bouquetItems.length === 0) {
      toast({
        title: "Пустой букет",
        description: "Добавьте хотя бы один цветок",
        variant: "destructive"
      });
      return;
    }

    const customBouquet: CustomBouquet = {
      id: `bouquet-${Date.now()}`,
      name: bouquetName,
      items: bouquetItems,
      wrapping: selectedWrapping,
      card: cardMessage,
      totalPrice: calculateTotal(),
      occasion: occasion || 'Особый случай',
      deliveryDate: new Date().toISOString()
    };

    onAddToCart(customBouquet);
    
    toast({
      title: "Букет добавлен в корзину!",
      description: `${bouquetName} за ${calculateTotal().toFixed(2)}€`
    });
  };

  const getBouquetPreview = () => {
    return bouquetItems.map(item => 
      Array(item.quantity).fill(item.flower.image).join('')
    ).join(' ');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Конструктор */}
      <div className="lg:col-span-2 space-y-6">
        {/* Шаблоны по случаям */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Готовые идеи
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {OCCASION_TEMPLATES.map((template) => (
                <Button
                  key={template.name}
                  variant="outline"
                  onClick={() => applyTemplate(template)}
                  className="h-auto p-3 text-left flex-col items-start"
                >
                  <span className="font-semibold">{template.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {template.flowers.reduce((sum, f) => sum + f.quantity, 0)} цветков
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Выбор цветов */}
        <Card>
          <CardHeader>
            <CardTitle>Выберите цветы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {FLOWERS.filter(f => f.available).map((flower) => {
                const inBouquet = bouquetItems.find(item => item.flower.id === flower.id);
                
                return (
                  <div
                    key={flower.id}
                    className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                    onClick={() => addFlower(flower)}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{flower.image}</div>
                      <h4 className="font-semibold text-sm">{flower.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{flower.meaning}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">{flower.price.toFixed(2)}€</span>
                        {inBouquet && (
                          <Badge variant="secondary">{inBouquet.quantity}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Упаковка */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Упаковка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {WRAPPING_OPTIONS.map((wrap) => (
                <Button
                  key={wrap.id}
                  variant={selectedWrapping === wrap.id ? "default" : "outline"}
                  onClick={() => setSelectedWrapping(wrap.id)}
                  className="h-auto p-3 flex-col"
                >
                  <span className="font-semibold">{wrap.name}</span>
                  <span className="text-sm">+{wrap.price.toFixed(2)}€</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Открытка */}
        <Card>
          <CardHeader>
            <CardTitle>Открытка с пожеланием</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Напишите ваше пожелание..."
              value={cardMessage}
              onChange={(e) => setCardMessage(e.target.value)}
              maxLength={200}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {cardMessage.length}/200 символов
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Предварительный просмотр */}
      <div className="space-y-4">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Ваш букет
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Визуальный предпросмотр */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950 rounded-lg p-6 text-center min-h-[120px] flex items-center justify-center">
              <div className="text-4xl leading-relaxed">
                {getBouquetPreview() || '🌸 Выберите цветы'}
              </div>
            </div>

            {/* Детали букета */}
            {bouquetItems.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">Состав букета:</h4>
                {bouquetItems.map((item) => (
                  <div key={item.flower.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>{item.flower.image}</span>
                      <span>{item.flower.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFlower(item.flower.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addFlower(item.flower)}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Цветы ({getTotalFlowers()} шт.)</span>
                    <span>{(calculateTotal() - (WRAPPING_OPTIONS.find(w => w.id === selectedWrapping)?.price || 0)).toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Упаковка</span>
                    <span>{(WRAPPING_OPTIONS.find(w => w.id === selectedWrapping)?.price || 0).toFixed(2)}€</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Итого</span>
                    <span className="text-primary">{calculateTotal().toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={handleAddToCart} 
              className="w-full"
              disabled={bouquetItems.length === 0}
            >
              <Heart className="w-4 h-4 mr-2" />
              Добавить в корзину
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FlowerBouquetBuilder;