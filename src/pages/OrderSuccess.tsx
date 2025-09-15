import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Clock, MapPin, Phone } from "lucide-react";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const orderData = location.state?.orderData;
  const items = location.state?.items || [];
  const total = location.state?.total || 0;

  // Redirect if no order data
  useEffect(() => {
    if (!orderData) {
      navigate("/");
    }
  }, [orderData, navigate]);

  if (!orderData) {
    return null;
  }

  const formatPrice = (price: number) => `${price.toFixed(2)}€`;
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
                    {orderData.address}, {orderData.city}, {orderData.postalCode}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Контакт:</p>
                  <p className="text-muted-foreground">
                    {orderData.firstName} {orderData.lastName}
                  </p>
                  <p className="text-muted-foreground">{orderData.phone}</p>
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

            {/* Order Items */}
            <div className="border-t pt-6">
              <h3 className="font-medium mb-4">Состав заказа:</h3>
              <div className="space-y-3">
                {items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                      {item.restaurantName && (
                        <p className="text-xs text-muted-foreground">{item.restaurantName}</p>
                      )}
                    </div>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 mt-4 border-t text-lg font-semibold">
                <span>Итого:</span>
                <span>{formatPrice(total)}</span>
              </div>
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