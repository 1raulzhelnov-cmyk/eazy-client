import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrderTrackingComponent from "@/components/OrderTracking";
import DeliveryTracking from "@/components/DeliveryTracking";

// Mock order data
const mockOrderData: Record<string, any> = {
  "1": {
    orderId: "1234",
    restaurantName: "Piccola Italia",
    orderItems: [
      "Пицца Маргарита (большая)",
      "Паста Карбонара",
      "Кола 0.5л"
    ],
    totalAmount: 28.50,
    deliveryAddress: "ул. Пушкина, д. 10, кв. 5"
  },
  "2": {
    orderId: "1235",
    restaurantName: "Tokyo Sushi",
    orderItems: [
      "Сет Филадельфия (8 шт)",
      "Суп Мисо",
      "Зеленый чай"
    ],
    totalAmount: 35.00,
    deliveryAddress: "пр. Мира, д. 25, офис 301"
  }
};

const OrderTrackingPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  
  if (!orderId) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Заказ не найден</h1>
            <p className="text-muted-foreground mb-6">
              Проверьте правильность ссылки или номера заказа
            </p>
            <Button asChild>
              <Link to="/orders">Вернуться к заказам</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const orderData = mockOrderData[orderId];
  
  if (!orderData) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Заказ не найден</h1>
            <p className="text-muted-foreground mb-6">
              Заказ с номером #{orderId} не существует
            </p>
            <Button asChild>
              <Link to="/orders">Вернуться к заказам</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/orders">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Отслеживание заказа</h1>
        </div>

        {/* Order Tracking Components */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <div>
            <OrderTrackingComponent
              orderId={orderData.orderId}
              restaurantName={orderData.restaurantName}
              orderItems={orderData.orderItems}
              totalAmount={orderData.totalAmount}
              deliveryAddress={orderData.deliveryAddress}
              onStatusUpdate={(statuses) => {
                console.log('Order status updated:', statuses);
              }}
            />
          </div>
          
          <div>
            <DeliveryTracking
              orderId={orderData.orderId}
              deliveryAddress={orderData.deliveryAddress}
              estimatedTime="19:15"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;