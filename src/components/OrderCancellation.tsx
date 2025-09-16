import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { XCircle, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface OrderCancellationProps {
  orderId: string;
  onCancel: (orderId: string, reason: string, additionalInfo?: string) => void;
}

const CANCELLATION_REASONS = [
  {
    id: 'changed_mind',
    label: 'Передумал',
    description: 'Больше не нужен заказ'
  },
  {
    id: 'wrong_order',
    label: 'Неправильный заказ',
    description: 'Заказал не то, что хотел'
  },
  {
    id: 'too_long',
    label: 'Долгая доставка',
    description: 'Доставка занимает слишком много времени'
  },
  {
    id: 'found_cheaper',
    label: 'Нашел дешевле',
    description: 'Нашел аналогичный заказ по более низкой цене'
  },
  {
    id: 'emergency',
    label: 'Чрезвычайная ситуация',
    description: 'Возникли непредвиденные обстоятельства'
  },
  {
    id: 'other',
    label: 'Другая причина',
    description: 'Укажите причину в комментарии'
  }
];

const OrderCancellation: React.FC<OrderCancellationProps> = ({ orderId, onCancel }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    if (!selectedReason) return;
    
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const reasonLabel = CANCELLATION_REASONS.find(r => r.id === selectedReason)?.label || selectedReason;
    onCancel(orderId, reasonLabel, additionalInfo);
    
    setIsLoading(false);
  };

  const canCancel = selectedReason && (!selectedReason.includes('other') || additionalInfo.trim());

  return (
    <Card className="border-destructive/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-destructive">
          <XCircle className="w-5 h-5" />
          Отмена заказа
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cancellation Policy */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Условия отмены заказа:</p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>Бесплатная отмена до начала приготовления</li>
                <li>После начала приготовления - возможна частичная компенсация</li>
                <li>При доставке курьером - отмена за 5 минут до прибытия</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
          <Clock className="w-4 h-4 text-warning" />
          <div className="flex-1">
            <p className="text-sm font-medium">Текущий статус</p>
            <p className="text-xs text-muted-foreground">Заказ подтвержден, можно отменить бесплатно</p>
          </div>
          <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">
            Можно отменить
          </Badge>
        </div>

        {/* Cancellation Reasons */}
        <div>
          <Label className="text-base font-medium mb-3 block">
            Причина отмены заказа *
          </Label>
          <RadioGroup 
            value={selectedReason} 
            onValueChange={setSelectedReason}
            className="space-y-3"
          >
            {CANCELLATION_REASONS.map((reason) => (
              <div key={reason.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <RadioGroupItem value={reason.id} id={reason.id} className="mt-0.5" />
                <Label htmlFor={reason.id} className="flex-1 cursor-pointer">
                  <div className="font-medium">{reason.label}</div>
                  <div className="text-sm text-muted-foreground">{reason.description}</div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Additional Information */}
        {selectedReason && (
          <div>
            <Label htmlFor="additional-info" className="text-base font-medium">
              Дополнительная информация {selectedReason === 'other' && '*'}
            </Label>
            <Textarea
              id="additional-info"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder={
                selectedReason === 'other' 
                  ? "Опишите причину отмены заказа..."
                  : "Дополнительные комментарии (необязательно)..."
              }
              className="mt-2"
              rows={3}
            />
          </div>
        )}

        {/* Cancellation Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="w-full"
              disabled={!canCancel}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Отменить заказ #{orderId}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Подтверждение отмены
              </AlertDialogTitle>
              <AlertDialogDescription>
                Вы действительно хотите отменить заказ #{orderId}?
                <br />
                <span className="font-medium">
                  Причина: {CANCELLATION_REASONS.find(r => r.id === selectedReason)?.label}
                </span>
                {additionalInfo && (
                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                    <strong>Комментарий:</strong> {additionalInfo}
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Не отменять</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleCancel}
                disabled={isLoading}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Отменяем...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Подтвердить отмену
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground text-center p-3 bg-muted/30 rounded-lg">
          💡 Нужна помощь? Свяжитесь с нами по телефону +372 123 4567 или через чат поддержки
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCancellation;