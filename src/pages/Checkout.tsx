import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EnhancedCheckout from "@/components/EnhancedCheckout";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, total, clearCart } = useCart();
  
  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Корзина пуста</h1>
          <p className="text-muted-foreground mb-6">Добавьте товары для оформления заказа</p>
          <Link to="/restaurants">
            <Button>Перейти к ресторанам</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (orderData: any) => {
    try {
      // Call Stripe payment function
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          orderData: orderData,
          items: items,
          total: total
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.location.assign(data.url);
        return;
      } else {
        throw new Error('Не удалось создать сессию оплаты');
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Ошибка оплаты",
        description: error instanceof Error ? error.message : "Попробуйте еще раз или свяжитесь с поддержкой",
        variant: "destructive",
      });
    }
  };

  // Mock addresses for the enhanced checkout
  const mockAddresses = [
    {
      id: "1",
      title: "Дом",
      address_line_1: "ул. Пушкина, 10",
      city: "Нарва",
      postal_code: "20308",
      is_default: true,
    },
    {
      id: "2", 
      title: "Работа",
      address_line_1: "пр. Мира, 25",
      city: "Нарва",
      postal_code: "20305",
      is_default: false,
    }
  ];

  const handleAddAddress = () => {
    // In a real app, this would open a modal or navigate to add address page
    console.log('Add address clicked');
    toast({
      title: "Функция недоступна",
      description: "Добавление адресов будет доступно в следующей версии",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Link to="/restaurants">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </Link>
      </div>

      <EnhancedCheckout
        items={items}
        addresses={mockAddresses}
        onPlaceOrder={handlePlaceOrder}
        onAddAddress={handleAddAddress}
      />
    </div>
  );
};

export default Checkout;