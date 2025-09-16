import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, Gift, Clock, MapPin, Users, 
  CalendarIcon, Truck, Receipt, AlertCircle 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface CheckoutItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  customizations?: string[];
}

interface CheckoutAddress {
  id: string;
  title: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  postal_code: string;
  delivery_instructions?: string;
  is_default: boolean;
}

interface GiftOptions {
  enabled: boolean;
  wrapping: string;
  message: string;
  recipientName: string;
  recipientPhone: string;
}

interface ScheduledDelivery {
  enabled: boolean;
  date: Date | null;
  timeSlot: string;
}

interface EnhancedCheckoutProps {
  items: CheckoutItem[];
  addresses: CheckoutAddress[];
  onPlaceOrder: (orderData: any) => void;
  onAddAddress: () => void;
}

const WRAPPING_OPTIONS = [
  { id: 'none', name: 'Без упаковки', price: 0 },
  { id: 'standard', name: 'Стандартная упаковка', price: 2.50 },
  { id: 'gift', name: 'Подарочная упаковка', price: 5.00 },
  { id: 'premium', name: 'Премиум упаковка', price: 8.50 }
];

const TIME_SLOTS = [
  '09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00'
];

const PAYMENT_METHODS = [
  { id: 'card', name: 'Банковская карта', icon: CreditCard },
  { id: 'cash', name: 'Наличными при доставке', icon: Receipt },
  { id: 'split', name: 'Раздельная оплата', icon: Users }
];

export const EnhancedCheckout = ({ 
  items, 
  addresses, 
  onPlaceOrder, 
  onAddAddress 
}: EnhancedCheckoutProps) => {
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [giftOptions, setGiftOptions] = useState<GiftOptions>({
    enabled: false,
    wrapping: 'none',
    message: '',
    recipientName: '',
    recipientPhone: ''
  });
  
  const [scheduledDelivery, setScheduledDelivery] = useState<ScheduledDelivery>({
    enabled: false,
    date: null,
    timeSlot: ''
  });
  
  const [splitPayment, setSplitPayment] = useState({
    enabled: false,
    splits: [{ amount: 0, email: '', method: 'card' }]
  });
  
  const [corporateInvoice, setCorporateInvoice] = useState({
    enabled: false,
    companyName: '',
    taxId: '',
    address: ''
  });
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddress = addresses.find(addr => addr.is_default);
      setSelectedAddress(defaultAddress?.id || addresses[0].id);
    }
  }, [addresses]);

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateDeliveryFee = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 25 ? 0 : 2.50; // Бесплатная доставка от 25€
  };

  const calculateGiftWrappingFee = () => {
    if (!giftOptions.enabled) return 0;
    const wrapping = WRAPPING_OPTIONS.find(w => w.id === giftOptions.wrapping);
    return wrapping?.price || 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDeliveryFee() + calculateGiftWrappingFee();
  };

  const addSplitPayment = () => {
    setSplitPayment(prev => ({
      ...prev,
      splits: [...prev.splits, { amount: 0, email: '', method: 'card' }]
    }));
  };

  const updateSplitPayment = (index: number, field: string, value: any) => {
    setSplitPayment(prev => ({
      ...prev,
      splits: prev.splits.map((split, i) => 
        i === index ? { ...split, [field]: value } : split
      )
    }));
  };

  const removeSplitPayment = (index: number) => {
    setSplitPayment(prev => ({
      ...prev,
      splits: prev.splits.filter((_, i) => i !== index)
    }));
  };

  const validateOrder = () => {
    if (!selectedAddress) {
      toast({
        title: "Выберите адрес доставки",
        variant: "destructive"
      });
      return false;
    }

    if (!termsAccepted) {
      toast({
        title: "Примите условия обслуживания",
        variant: "destructive"
      });
      return false;
    }

    if (scheduledDelivery.enabled && (!scheduledDelivery.date || !scheduledDelivery.timeSlot)) {
      toast({
        title: "Выберите дату и время доставки",
        variant: "destructive"
      });
      return false;
    }

    if (giftOptions.enabled && (!giftOptions.recipientName || !giftOptions.recipientPhone)) {
      toast({
        title: "Заполните данные получателя подарка",
        variant: "destructive"
      });
      return false;
    }

    if (splitPayment.enabled) {
      const totalSplits = splitPayment.splits.reduce((sum, split) => sum + split.amount, 0);
      if (Math.abs(totalSplits - calculateTotal()) > 0.01) {
        toast({
          title: "Сумма разделения не соответствует общей сумме заказа",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handlePlaceOrder = () => {
    if (!validateOrder()) return;

    const orderData = {
      items,
      address: addresses.find(addr => addr.id === selectedAddress),
      paymentMethod,
      giftOptions: giftOptions.enabled ? giftOptions : null,
      scheduledDelivery: scheduledDelivery.enabled ? scheduledDelivery : null,
      splitPayment: splitPayment.enabled ? splitPayment : null,
      corporateInvoice: corporateInvoice.enabled ? corporateInvoice : null,
      specialInstructions,
      subtotal: calculateSubtotal(),
      deliveryFee: calculateDeliveryFee(),
      giftWrappingFee: calculateGiftWrappingFee(),
      total: calculateTotal()
    };

    onPlaceOrder(orderData);
  };

  const selectedAddressData = addresses.find(addr => addr.id === selectedAddress);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная форма */}
        <div className="lg:col-span-2 space-y-6">
          {/* Адрес доставки */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Адрес доставки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">У вас нет сохраненных адресов</p>
                  <Button onClick={onAddAddress}>Добавить адрес</Button>
                </div>
              ) : (
                <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                  {addresses.map((address) => (
                    <div key={address.id} className="flex items-start space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={address.id} className="cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{address.title}</span>
                            {address.is_default && (
                              <Badge variant="secondary" className="text-xs">По умолчанию</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {address.address_line_1}
                            {address.address_line_2 && `, ${address.address_line_2}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.postal_code}
                          </p>
                          {address.delivery_instructions && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Инструкции: {address.delivery_instructions}
                            </p>
                          )}
                        </Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              )}
              
              <Button variant="outline" onClick={onAddAddress} className="w-full">
                Добавить новый адрес
              </Button>
            </CardContent>
          </Card>

          {/* Запланированная доставка */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Время доставки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="scheduled-delivery"
                  checked={scheduledDelivery.enabled}
                  onCheckedChange={(checked) => 
                    setScheduledDelivery(prev => ({ ...prev, enabled: checked }))
                  }
                />
                <Label htmlFor="scheduled-delivery">Запланировать доставку</Label>
              </div>

              {scheduledDelivery.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Дата доставки</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduledDelivery.date ? format(scheduledDelivery.date, "PPP", { locale: ru }) : "Выберите дату"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={scheduledDelivery.date || undefined}
                          onSelect={(date) => 
                            setScheduledDelivery(prev => ({ ...prev, date: date || null }))
                          }
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>Временной слот</Label>
                    <Select 
                      value={scheduledDelivery.timeSlot} 
                      onValueChange={(value) => 
                        setScheduledDelivery(prev => ({ ...prev, timeSlot: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите время" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map(slot => (
                          <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Подарочная упаковка */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Подарочная упаковка
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="gift-wrapping"
                  checked={giftOptions.enabled}
                  onCheckedChange={(checked) => 
                    setGiftOptions(prev => ({ ...prev, enabled: checked }))
                  }
                />
                <Label htmlFor="gift-wrapping">Это подарок</Label>
              </div>

              {giftOptions.enabled && (
                <div className="space-y-4">
                  <div>
                    <Label>Тип упаковки</Label>
                    <Select 
                      value={giftOptions.wrapping} 
                      onValueChange={(value) => 
                        setGiftOptions(prev => ({ ...prev, wrapping: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WRAPPING_OPTIONS.map(option => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name} {option.price > 0 && `(+${option.price.toFixed(2)}€)`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Имя получателя</Label>
                      <Input
                        value={giftOptions.recipientName}
                        onChange={(e) => 
                          setGiftOptions(prev => ({ ...prev, recipientName: e.target.value }))
                        }
                        placeholder="Имя получателя"
                      />
                    </div>
                    <div>
                      <Label>Телефон получателя</Label>
                      <Input
                        value={giftOptions.recipientPhone}
                        onChange={(e) => 
                          setGiftOptions(prev => ({ ...prev, recipientPhone: e.target.value }))
                        }
                        placeholder="+372 xxx xxxx"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Сообщение на открытке</Label>
                    <Textarea
                      value={giftOptions.message}
                      onChange={(e) => 
                        setGiftOptions(prev => ({ ...prev, message: e.target.value }))
                      }
                      placeholder="Ваше поздравление..."
                      maxLength={200}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Способ оплаты */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Способ оплаты
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div key={method.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="flex items-center gap-2 cursor-pointer">
                        <Icon className="w-4 h-4" />
                        {method.name}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>

              {/* Раздельная оплата */}
              {paymentMethod === 'split' && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <div className="flex items-center justify-between">
                    <Label>Разделить счет</Label>
                    <Button size="sm" variant="outline" onClick={addSplitPayment}>
                      Добавить участника
                    </Button>
                  </div>
                  
                  {splitPayment.splits.map((split, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        placeholder="Сумма €"
                        value={split.amount || ''}
                        onChange={(e) => updateSplitPayment(index, 'amount', parseFloat(e.target.value) || 0)}
                      />
                      <Input
                        type="email"
                        placeholder="Email участника"
                        value={split.email}
                        onChange={(e) => updateSplitPayment(index, 'email', e.target.value)}
                      />
                      <div className="flex gap-1">
                        <Select 
                          value={split.method} 
                          onValueChange={(value) => updateSplitPayment(index, 'method', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="card">Карта</SelectItem>
                            <SelectItem value="cash">Наличные</SelectItem>
                          </SelectContent>
                        </Select>
                        {index > 0 && (
                          <Button size="sm" variant="outline" onClick={() => removeSplitPayment(index)}>
                            ×
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Корпоративный счет */}
          {paymentMethod === 'card' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Корпоративный счет
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="corporate-invoice"
                    checked={corporateInvoice.enabled}
                    onCheckedChange={(checked) => 
                      setCorporateInvoice(prev => ({ ...prev, enabled: checked }))
                    }
                  />
                  <Label htmlFor="corporate-invoice">Нужен счет на юридическое лицо</Label>
                </div>

                {corporateInvoice.enabled && (
                  <div className="space-y-4">
                    <Input
                      placeholder="Название компании"
                      value={corporateInvoice.companyName}
                      onChange={(e) => 
                        setCorporateInvoice(prev => ({ ...prev, companyName: e.target.value }))
                      }
                    />
                    <Input
                      placeholder="Налоговый номер"
                      value={corporateInvoice.taxId}
                      onChange={(e) => 
                        setCorporateInvoice(prev => ({ ...prev, taxId: e.target.value }))
                      }
                    />
                    <Textarea
                      placeholder="Юридический адрес"
                      value={corporateInvoice.address}
                      onChange={(e) => 
                        setCorporateInvoice(prev => ({ ...prev, address: e.target.value }))
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Особые инструкции */}
          <Card>
            <CardHeader>
              <CardTitle>Особые инструкции</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Дополнительные инструкции для доставки..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {specialInstructions.length}/500 символов
              </p>
            </CardContent>
          </Card>

          {/* Согласие с условиями */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                  Я согласен с{' '}
                  <a href="/terms" className="text-primary underline">условиями обслуживания</a>
                  {' '}и{' '}
                  <a href="/privacy" className="text-primary underline">политикой конфиденциальности</a>
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Сводка заказа */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Сводка заказа</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Товары */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      {item.customizations && item.customizations.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {item.customizations.join(', ')}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × {item.price.toFixed(2)}€
                      </p>
                    </div>
                    <span className="font-medium">
                      {(item.price * item.quantity).toFixed(2)}€
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Расчеты */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Сумма товаров</span>
                  <span>{calculateSubtotal().toFixed(2)}€</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Доставка</span>
                  <span>
                    {calculateDeliveryFee() === 0 ? (
                      <span className="text-green-600">Бесплатно</span>
                    ) : (
                      `${calculateDeliveryFee().toFixed(2)}€`
                    )}
                  </span>
                </div>

                {giftOptions.enabled && calculateGiftWrappingFee() > 0 && (
                  <div className="flex justify-between">
                    <span>Подарочная упаковка</span>
                    <span>{calculateGiftWrappingFee().toFixed(2)}€</span>
                  </div>
                )}

                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Итого</span>
                  <span className="text-primary">{calculateTotal().toFixed(2)}€</span>
                </div>
              </div>

              {/* Информация о доставке */}
              {selectedAddressData && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div className="text-xs">
                      <p className="font-medium">{selectedAddressData.title}</p>
                      <p className="text-muted-foreground">{selectedAddressData.address_line_1}</p>
                    </div>
                  </div>
                </div>
              )}

              {scheduledDelivery.enabled && scheduledDelivery.date && (
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <div className="text-xs">
                      <p className="font-medium text-primary">Запланированная доставка</p>
                      <p className="text-muted-foreground">
                        {format(scheduledDelivery.date, "PPP", { locale: ru })} в {scheduledDelivery.timeSlot}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={handlePlaceOrder} 
                className="w-full"
                disabled={!termsAccepted || items.length === 0}
              >
                Оформить заказ {calculateTotal().toFixed(2)}€
              </Button>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="w-3 h-3" />
                <span>Ожидаемое время доставки: 25-35 минут</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCheckout;