import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Clock, MapPin, Phone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clearCart } = useCart();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        navigate("/");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId }
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.payment_status === 'paid') {
          setPaymentData(data);
          await clearCart();
        } else {
          toast({
            title: "Проблема с оплатой",
            description: "Статус оплаты: " + data.payment_status,
            variant: "destructive",
          });
          navigate("/checkout");
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast({
          title: "Ошибка проверки оплаты",
          description: "Свяжитесь с поддержкой",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, navigate, toast, clearCart]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Проверяем оплату...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return null;
  }

  const formatPrice = (amountCents: number) => `${(amountCents / 100).toFixed(2)}€`;
  const orderNumber = Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold mb-4">Заказ успешно оформлен! 🎉</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Ваш заказ принят в обработку. Курьер доставит его в течение 30 минут.
          </p>

          {/* Order Details */}
          <Card className="p-6 text-left mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Детали заказа</h2>
              <span className="text-sm text-muted-foreground">#{orderNumber}</span>
            </div>

            {/* Delivery Info */}
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Адрес доставки:</p>
                  <p className="text-muted-foreground">
                    {paymentData.customer_details?.address?.line1 || paymentData.metadata?.address}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Контакт:</p>
                  <p className="text-muted-foreground">
                    {paymentData.customer_details?.name || paymentData.metadata?.customerName}
                  </p>
                  <p className="text-muted-foreground">
                    {paymentData.customer_details?.phone || paymentData.metadata?.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Время доставки:</p>
                  <p className="text-muted-foreground">В течение 30 минут</p>
                </div>
              </div>
            </div>

            {/* Order Total */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Оплачено:</span>
                <span>{formatPrice(paymentData.amount_total)}</span>
              </div>
              
              {paymentData.metadata?.notes && (
                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm">
                    <strong>Комментарий:</strong> {paymentData.metadata.notes}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button className="w-full bg-gradient-primary hover:shadow-glow" size="lg">
              <Clock className="w-5 h-5 mr-2" />
              Отследить заказ
            </Button>
            
            <div className="flex gap-4">
              <Link to="/restaurants" className="flex-1">
                <Button variant="outline" className="w-full">
                  Заказать еще
                </Button>
              </Link>
              <Link to="/" className="flex-1">
                <Button variant="ghost" className="w-full">
                  На главную
                </Button>
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-12 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Возникли вопросы? Свяжитесь с нами:<br />
              📞 +372 123 4567 | ✉️ support@eazy.ee
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;