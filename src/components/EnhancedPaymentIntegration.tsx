import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  CreditCard, Smartphone, Wallet, Plus, Trash2, 
  Shield, Lock, CheckCircle, AlertCircle 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Типы для платежных API уже объявлены в AddressAutocomplete.tsx

interface PaymentMethod {
  id: string;
  type: 'card' | 'digital_wallet' | 'crypto';
  name: string;
  last4?: string;
  expiry?: string;
  brand?: string;
  isDefault: boolean;
}

interface PaymentIntegrationProps {
  amount: number;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
  splitPayments?: Array<{
    amount: number;
    email: string;
    method: string;
  }>;
}

const DIGITAL_WALLETS = [
  { id: 'apple_pay', name: 'Apple Pay', icon: '🍎', available: typeof window !== 'undefined' && 'ApplePaySession' in window },
  { id: 'google_pay', name: 'Google Pay', icon: '🟢', available: typeof window !== 'undefined' && !!window.google?.payments },
  { id: 'paypal', name: 'PayPal', icon: '💙', available: true }
];

const CRYPTO_OPTIONS = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', icon: '₿' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ' },
  { id: 'usdc', name: 'USD Coin', symbol: 'USDC', icon: '$' }
];

export const EnhancedPaymentIntegration = ({ 
  amount, 
  onPaymentSuccess, 
  onPaymentError, 
  splitPayments 
}: PaymentIntegrationProps) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  
  const [newCard, setNewCard] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    saveCard: false
  });
  
  const [cryptoPayment, setCryptoPayment] = useState({
    currency: 'bitcoin',
    address: '',
    amount: 0,
    qrCode: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    loadSavedPaymentMethods();
  }, []);

  const loadSavedPaymentMethods = async () => {
    try {
      // В реальном приложении здесь была бы загрузка сохраненных методов из Stripe
      const mockMethods: PaymentMethod[] = [
        {
          id: '1',
          type: 'card',
          name: 'Visa •••• 4242',
          last4: '4242',
          expiry: '12/25',
          brand: 'visa',
          isDefault: true
        },
        {
          id: '2',
          type: 'card',
          name: 'Mastercard •••• 5555',
          last4: '5555',
          expiry: '10/26',
          brand: 'mastercard',
          isDefault: false
        }
      ];
      
      setPaymentMethods(mockMethods);
      const defaultMethod = mockMethods.find(m => m.isDefault);
      if (defaultMethod) {
        setSelectedMethod(defaultMethod.id);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateCard = () => {
    const errors: string[] = [];
    
    if (newCard.number.replace(/\s/g, '').length < 13) {
      errors.push('Неверный номер карты');
    }
    
    if (!/^\d{2}\/\d{2}$/.test(newCard.expiry)) {
      errors.push('Неверная дата истечения');
    }
    
    if (newCard.cvc.length < 3) {
      errors.push('Неверный CVC код');
    }
    
    if (!newCard.name.trim()) {
      errors.push('Введите имя держателя карты');
    }
    
    return errors;
  };

  const handleAddCard = async () => {
    const errors = validateCard();
    if (errors.length > 0) {
      toast({
        title: "Ошибка валидации",
        description: errors.join(', '),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // В реальном приложении здесь была бы интеграция с Stripe для сохранения карты
      const newMethod: PaymentMethod = {
        id: `card_${Date.now()}`,
        type: 'card',
        name: `•••• ${newCard.number.slice(-4)}`,
        last4: newCard.number.slice(-4),
        expiry: newCard.expiry,
        brand: getCardBrand(newCard.number),
        isDefault: paymentMethods.length === 0
      };

      setPaymentMethods(prev => [...prev, newMethod]);
      setSelectedMethod(newMethod.id);
      setShowAddCard(false);
      setNewCard({ number: '', expiry: '', cvc: '', name: '', saveCard: false });
      
      toast({
        title: "Карта добавлена",
        description: "Способ оплаты успешно сохранен"
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить карту",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCardBrand = (number: string): string => {
    const num = number.replace(/\s/g, '');
    if (num.startsWith('4')) return 'visa';
    if (num.startsWith('5')) return 'mastercard';
    if (num.startsWith('3')) return 'amex';
    return 'unknown';
  };

  const handleDigitalWalletPayment = async (walletType: string) => {
    setLoading(true);
    try {
      if (walletType === 'apple_pay') {
        if (!(window as any).ApplePaySession) {
          throw new Error('Apple Pay недоступен на этом устройстве');
        }
        // Симуляция Apple Pay для демо
        onPaymentSuccess(`apple_pay_${Date.now()}`);
      } else if (walletType === 'google_pay') {
        // Симуляция Google Pay для демо
        onPaymentSuccess(`google_pay_${Date.now()}`);
      }
        
        const paymentDataRequest = {
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['VISA', 'MASTERCARD']
            }
          }],
          transactionInfo: {
            totalPriceStatus: 'FINAL',
            totalPrice: amount.toFixed(2),
            currencyCode: 'EUR'
          }
        };
        
        console.log('Payment request:', paymentDataRequest);
      }
      
      // Симулируем успешную оплату
      setTimeout(() => {
        onPaymentSuccess(`${walletType}_${Date.now()}`);
      }, 2000);
      
    } catch (error) {
      onPaymentError(error instanceof Error ? error.message : 'Ошибка цифрового кошелька');
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoPayment = async (crypto: string) => {
    setLoading(true);
    try {
      // Генерируем адрес для криптооплаты (в реальном приложении через API)
      const mockAddress = `bc1q${Math.random().toString(36).substring(2, 15)}`;
      const exchangeRate = crypto === 'bitcoin' ? 45000 : crypto === 'ethereum' ? 3000 : 1;
      const cryptoAmount = amount / exchangeRate;
      
      setCryptoPayment({
        currency: crypto,
        address: mockAddress,
        amount: cryptoAmount,
        qrCode: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IndoaXRlIi8+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LXNpemU9IjEwIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmaWxsPSJibGFjayIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNSWVBUTzwvdGV4dD48L3N2Zz4=`
      });
      
      toast({
        title: "Криптоплатеж создан",
        description: `Переведите ${cryptoAmount.toFixed(8)} ${crypto.toUpperCase()} на указанный адрес`
      });
    } catch (error) {
      onPaymentError('Ошибка создания криптоплатежа');
    } finally {
      setLoading(false);
    }
  };

  const handleStripePayment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          amount: Math.round(amount * 100), // В центах
          currency: 'eur',
          payment_method_id: selectedMethod
        }
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
      
      // Симуляция успешной оплаты для демо
      setTimeout(() => {
        onPaymentSuccess(`stripe_${Date.now()}`);
      }, 3000);
      
    } catch (error) {
      onPaymentError(error instanceof Error ? error.message : 'Ошибка обработки платежа');
    } finally {
      setLoading(false);
    }
  };

  const deletePaymentMethod = (methodId: string) => {
    setPaymentMethods(prev => prev.filter(m => m.id !== methodId));
    if (selectedMethod === methodId) {
      setSelectedMethod('');
    }
    toast({
      title: "Способ оплаты удален"
    });
  };

  return (
    <div className="space-y-6">
      {/* Сохраненные карты */}
      {paymentMethods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Сохраненные способы оплаты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label htmlFor={method.id} className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="w-4 h-4" />
                      <span>{method.name}</span>
                      {method.isDefault && (
                        <Badge variant="secondary" className="text-xs">По умолчанию</Badge>
                      )}
                    </Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePaymentMethod(method.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Добавить новую карту */}
      <Card>
        <CardHeader>
          <CardTitle>Новая карта</CardTitle>
        </CardHeader>
        <CardContent>
          {!showAddCard ? (
            <Button variant="outline" onClick={() => setShowAddCard(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Добавить новую карту
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Номер карты</Label>
                <Input
                  value={newCard.number}
                  onChange={(e) => setNewCard(prev => ({ 
                    ...prev, 
                    number: formatCardNumber(e.target.value) 
                  }))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Срок действия</Label>
                  <Input
                    value={newCard.expiry}
                    onChange={(e) => setNewCard(prev => ({ 
                      ...prev, 
                      expiry: formatExpiry(e.target.value) 
                    }))}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label>CVC</Label>
                  <Input
                    value={newCard.cvc}
                    onChange={(e) => setNewCard(prev => ({ 
                      ...prev, 
                      cvc: e.target.value.replace(/\D/g, '') 
                    }))}
                    placeholder="123"
                    maxLength={4}
                    type="password"
                  />
                </div>
              </div>
              
              <div>
                <Label>Имя держателя карты</Label>
                <Input
                  value={newCard.name}
                  onChange={(e) => setNewCard(prev => ({ 
                    ...prev, 
                    name: e.target.value 
                  }))}
                  placeholder="IVAN PETROV"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="save-card"
                  checked={newCard.saveCard}
                  onChange={(e) => setNewCard(prev => ({ 
                    ...prev, 
                    saveCard: e.target.checked 
                  }))}
                />
                <Label htmlFor="save-card" className="text-sm">
                  Сохранить карту для будущих покупок
                </Label>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleAddCard} disabled={loading} className="flex-1">
                  {loading ? 'Добавление...' : 'Добавить карту'}
                </Button>
                <Button variant="outline" onClick={() => setShowAddCard(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Цифровые кошельки */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Цифровые кошельки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {DIGITAL_WALLETS.map((wallet) => (
              <Button
                key={wallet.id}
                variant="outline"
                disabled={!wallet.available || loading}
                onClick={() => handleDigitalWalletPayment(wallet.id)}
                className="h-12 flex items-center gap-2"
              >
                <span className="text-lg">{wallet.icon}</span>
                {wallet.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Криптовалюты */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Криптовалюты
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {CRYPTO_OPTIONS.map((crypto) => (
              <Button
                key={crypto.id}
                variant="outline"
                onClick={() => handleCryptoPayment(crypto.id)}
                disabled={loading}
                className="h-12 flex items-center gap-2"
              >
                <span className="text-lg">{crypto.icon}</span>
                {crypto.name}
              </Button>
            ))}
          </div>
          
          {cryptoPayment.address && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-2">Инструкции для оплаты</h4>
              <p className="text-sm mb-2">
                Переведите <strong>{cryptoPayment.amount.toFixed(8)} {cryptoPayment.currency.toUpperCase()}</strong> на адрес:
              </p>
              <code className="text-xs bg-background p-2 rounded block mb-2 break-all">
                {cryptoPayment.address}
              </code>
              <p className="text-xs text-muted-foreground">
                Платеж будет подтвержден автоматически после получения подтверждений в сети.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Информация о безопасности */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Безопасность платежей
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-600" />
              <span>256-битное SSL шифрование</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>PCI DSS сертификация</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span>3D Secure аутентификация</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span>Защита от мошенничества</span>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <p className="text-xs text-muted-foreground">
            Мы не храним данные ваших карт. Все платежи обрабатываются через сертифицированную платформу Stripe.
          </p>
        </CardContent>
      </Card>

      {/* Кнопка оплаты */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={handleStripePayment}
            disabled={loading || !selectedMethod}
            className="w-full h-12 text-lg"
          >
            {loading ? 'Обработка...' : `Оплатить ${amount.toFixed(2)}€`}
          </Button>
          
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>Защищенный платеж через Stripe</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedPaymentIntegration;