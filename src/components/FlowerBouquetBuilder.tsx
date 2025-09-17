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
import { useLanguage } from '@/contexts/LanguageContext';

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

const getFlowers = (t: (key: string) => string): Flower[] => [
  {
    id: '1',
    name: t('flower.red.rose'),
    price: 3.50,
    color: 'red',
    meaning: t('meaning.love.passion'),
    season: 'all',
    image: '🌹',
    available: true
  },
  {
    id: '2',
    name: t('flower.white.rose'),
    price: 3.50,
    color: 'white',
    meaning: t('meaning.purity.innocence'),
    season: 'all',
    image: '🤍',
    available: true
  },
  {
    id: '3',
    name: t('flower.tulip'),
    price: 2.80,
    color: 'pink',
    meaning: t('meaning.perfect.love'),
    season: 'spring',
    image: '🌷',
    available: true
  },
  {
    id: '4',
    name: t('flower.lily'),
    price: 4.20,
    color: 'white',
    meaning: t('meaning.rebirth.hope'),
    season: 'summer',
    image: '🌺',
    available: true
  },
  {
    id: '5',
    name: t('flower.carnation'),
    price: 2.20,
    color: 'pink',
    meaning: t('meaning.maternal.love'),
    season: 'all',
    image: '🌸',
    available: true
  },
  {
    id: '6',
    name: t('flower.chrysanthemum'),
    price: 3.00,
    color: 'yellow',
    meaning: t('meaning.friendship.joy'),
    season: 'autumn',
    image: '🌻',
    available: true
  }
];

const getWrappingOptions = (t: (key: string) => string) => [
  { id: 'paper', name: t('wrap.kraft'), price: 2.50 },
  { id: 'silk', name: t('wrap.silk'), price: 4.00 },
  { id: 'luxury', name: t('wrap.luxury'), price: 8.00 },
  { id: 'eco', name: t('wrap.eco'), price: 3.50 }
];

const getOccasionTemplates = (t: (key: string) => string) => [
  {
    name: t('builder.template.birthday'),
    flowers: [
      { flowerId: '1', quantity: 7 }, // Red roses
      { flowerId: '4', quantity: 3 }  // Lilies
    ],
    wrapping: 'silk'
  },
  {
    name: t('builder.template.romantic'),
    flowers: [
      { flowerId: '1', quantity: 11 } // Red roses
    ],
    wrapping: 'luxury'
  },
  {
    name: t('builder.template.march'),
    flowers: [
      { flowerId: '3', quantity: 8 }, // Tulips
      { flowerId: '5', quantity: 3 }  // Carnations
    ],
    wrapping: 'silk'
  },
  {
    name: t('builder.template.apology'),
    flowers: [
      { flowerId: '2', quantity: 9 } // White roses
    ],
    wrapping: 'paper'
  }
];

export const FlowerBouquetBuilder = ({ onAddToCart, occasion }: BouquetBuilderProps) => {
  const [bouquetItems, setBouquetItems] = useState<BouquetItem[]>([]);
  const [selectedWrapping, setSelectedWrapping] = useState('paper');
  const [cardMessage, setCardMessage] = useState('');
  const [bouquetName, setBouquetName] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const { t } = useLanguage();

  const FLOWERS = getFlowers(t);
  const WRAPPING_OPTIONS = getWrappingOptions(t);
  const OCCASION_TEMPLATES = getOccasionTemplates(t);

  // Initialize bouquet name
  useEffect(() => {
    setBouquetName(t('builder.my.bouquet'));
  }, [t]);

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
    setBouquetName(`${t('builder.my.bouquet')} "${template.name}"`);
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
        title: t('builder.empty.bouquet'),
        description: t('builder.add.flower'),
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
      occasion: occasion || t('builder.special.occasion'),
      deliveryDate: new Date().toISOString()
    };

    onAddToCart(customBouquet);
    
    toast({
      title: t('builder.bouquet.added'),
      description: `${bouquetName} ${calculateTotal().toFixed(2)}€`
    });
  };

  const getBouquetPreview = () => {
    return bouquetItems.map(item => 
      Array(item.quantity).fill(item.flower.image).join('')
    ).join(' ');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Constructor */}
      <div className="lg:col-span-2 space-y-6">
        {/* Templates by occasions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {t('builder.ready.ideas')}
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
                    {template.flowers.reduce((sum, f) => sum + f.quantity, 0)} {t('builder.flowers.count')}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Flower selection */}
        <Card>
          <CardHeader>
            <CardTitle>{t('builder.select.flowers')}</CardTitle>
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

        {/* Wrapping */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              {t('builder.wrapping')}
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

        {/* Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('builder.card.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={t('builder.card.placeholder')}
              value={cardMessage}
              onChange={(e) => setCardMessage(e.target.value)}
              maxLength={200}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {cardMessage.length}/200 {t('builder.card.symbols')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <div className="space-y-4">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              {t('builder.your.bouquet')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Visual preview */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950 rounded-lg p-6 text-center min-h-[120px] flex items-center justify-center">
              <div className="text-4xl leading-relaxed">
                {getBouquetPreview() || `🌸 ${t('builder.choose.flowers')}`}
              </div>
            </div>

            {/* Bouquet details */}
            {bouquetItems.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">{t('builder.bouquet.composition')}</h4>
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
                    <span>{t('builder.flowers')} ({getTotalFlowers()} {t('builder.flowers.pieces')})</span>
                    <span>{(calculateTotal() - (WRAPPING_OPTIONS.find(w => w.id === selectedWrapping)?.price || 0)).toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('builder.wrapping.package')}</span>
                    <span>{(WRAPPING_OPTIONS.find(w => w.id === selectedWrapping)?.price || 0).toFixed(2)}€</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t('builder.total')}</span>
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
              {t('builder.add.cart')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FlowerBouquetBuilder;