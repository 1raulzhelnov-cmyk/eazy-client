import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Truck, UtensilsCrossed, MapPin } from "lucide-react";

export interface OrderStatus {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  timestamp?: Date;
  estimatedTime?: string;
}

interface OrderTrackingProps {
  orderId: string;
  restaurantName: string;
  orderItems: string[];
  totalAmount: number;
  deliveryAddress: string;
  onStatusUpdate?: (status: OrderStatus[]) => void;
}

const OrderTracking = ({
  orderId,
  restaurantName,
  orderItems,
  totalAmount,
  deliveryAddress,
  onStatusUpdate
}: OrderTrackingProps) => {
  const [orderStatus, setOrderStatus] = useState<OrderStatus[]>([
    {
      id: "confirmed",
      label: "Заказ подтвержден",
      description: "Ресторан принял ваш заказ",
      completed: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 10) // 10 minutes ago
    },
    {
      id: "preparing",
      label: "Готовится",
      description: "Ресторан готовит ваш заказ",
      completed: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      estimatedTime: "15-20 мин"
    },
    {
      id: "ready",
      label: "Готов к выдаче",
      description: "Заказ готов и ожидает курьера",
      completed: false,
      estimatedTime: "5-10 мин"
    },
    {
      id: "pickup",
      label: "Курьер забрал заказ",
      description: "Курьер направляется к вам",
      completed: false,
      estimatedTime: "20-25 мин"
    },
    {
      id: "delivered",
      label: "Доставлен",
      description: "Заказ успешно доставлен",
      completed: false
    }
  ]);

  const completedSteps = orderStatus.filter(status => status.completed).length;
  const progressValue = (completedSteps / orderStatus.length) * 100;

  const getStatusIcon = (statusId: string, completed: boolean) => {
    const iconClass = `w-6 h-6 ${completed ? 'text-green-500' : 'text-muted-foreground'}`;
    
    switch (statusId) {
      case 'confirmed':
        return <CheckCircle className={iconClass} />;
      case 'preparing':
        return <UtensilsCrossed className={iconClass} />;
      case 'ready':
        return <Clock className={iconClass} />;
      case 'pickup':
        return <Truck className={iconClass} />;
      case 'delivered':
        return <MapPin className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Simulate order progress for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setOrderStatus(prev => {
        const updated = [...prev];
        const nextIncomplete = updated.find(status => !status.completed);
        
        if (nextIncomplete && Math.random() < 0.3) { // 30% chance every 10 seconds
          const index = updated.findIndex(s => s.id === nextIncomplete.id);
          updated[index] = {
            ...nextIncomplete,
            completed: true,
            timestamp: new Date()
          };
          
          onStatusUpdate?.(updated);
          return updated;
        }
        return prev;
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [onStatusUpdate]);

  const getCurrentStatus = () => {
    const currentStep = orderStatus.find(status => !status.completed);
    return currentStep || orderStatus[orderStatus.length - 1];
  };

  const currentStatus = getCurrentStatus();
  const isCompleted = orderStatus.every(status => status.completed);

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Заказ #{orderId}</h2>
            <p className="text-muted-foreground">{restaurantName}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{totalAmount}€</div>
            <Badge 
              variant={isCompleted ? "default" : "secondary"}
              className={isCompleted ? "bg-green-500" : ""}
            >
              {isCompleted ? "Доставлен" : currentStatus.label}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Progress Bar */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Статус заказа</h3>
            <span className="text-sm text-muted-foreground">
              {completedSteps} из {orderStatus.length} этапов
            </span>
          </div>
          
          <Progress value={progressValue} className="h-2" />
          
          {!isCompleted && currentStatus.estimatedTime && (
            <p className="text-sm text-muted-foreground">
              Ожидаемое время: {currentStatus.estimatedTime}
            </p>
          )}
        </div>
      </Card>

      {/* Status Timeline */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Этапы доставки</h3>
        
        <div className="space-y-4">
          {orderStatus.map((status, index) => (
            <div key={status.id} className="flex items-start gap-4">
              <div className={`
                flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center
                ${status.completed 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-muted bg-background'
                }
              `}>
                {getStatusIcon(status.id, status.completed)}
              </div>
              
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-medium ${
                    status.completed ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {status.label}
                  </h4>
                  {status.completed && status.timestamp && (
                    <span className="text-xs text-muted-foreground">
                      {formatTime(status.timestamp)}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {status.description}
                </p>
                
                {!status.completed && status.estimatedTime && (
                  <p className="text-xs text-primary mt-1">
                    ~{status.estimatedTime}
                  </p>
                )}
              </div>
              
              {index < orderStatus.length - 1 && (
                <div className={`
                  absolute left-5 mt-10 w-0.5 h-8
                  ${status.completed ? 'bg-green-500' : 'bg-muted'}
                `} />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Order Details */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Детали заказа</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Товары:</h4>
            <ul className="space-y-1">
              {orderItems.map((item, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Адрес доставки:</h4>
            <p className="text-sm text-muted-foreground">{deliveryAddress}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OrderTracking;