import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { UtensilsCrossed, Flower2, PartyPopper, Truck, Clock, Target } from "lucide-react";
import DriverApp from "./DriverApp";

const Index = () => {
  const [appMode, setAppMode] = useState<'customer' | 'driver'>('customer');

  if (appMode === 'driver') {
    return (
      <div className="min-h-screen bg-background">
        <DriverApp />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* App Mode Switcher */}
      <div className="fixed top-4 right-4 z-50 flex bg-background border rounded-lg p-1 shadow-lg">
        <Button
          variant={appMode === 'customer' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setAppMode('customer')}
          className="text-xs"
        >
          👤 Клиент
        </Button>
        <Button
          variant={appMode !== 'customer' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setAppMode('driver')}
          className="text-xs"
        >
          🚚 Курьер
        </Button>
        <Link to="/restaurant-dashboard">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            🏪 Ресторан
          </Button>
        </Link>
      </div>
      
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white/20"></div>
          <div className="absolute top-32 right-20 w-8 h-8 rounded-full bg-white/15"></div>
          <div className="absolute bottom-16 left-1/4 w-12 h-12 rounded-full bg-white/10"></div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Добро пожаловать в 
              <span className="inline-block ml-2 text-primary-glow transform -rotate-1"> Eazy</span>
            </h1>
            <div className="space-y-3 mb-8">
              <p className="text-lg md:text-xl opacity-95">
                Доставка еды, цветов и шаров в Нарву за 30 минут
              </p>
              <p className="text-base md:text-lg opacity-85 max-w-2xl mx-auto">
                Выберите категорию и начните делать заказы прямо сейчас!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Что вы хотите заказать?</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Свежие продукты, красивые цветы и праздничные шары
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-stretch">
            {/* Restaurants */}
            <Link to="/restaurants" className="group">
              <Card className="cursor-pointer overflow-hidden shadow-card hover:shadow-glow transition-all duration-300 hover:scale-[1.02] p-6 md:p-8 text-center border-2 hover:border-primary/20 h-full flex flex-col">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <UtensilsCrossed className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                  Рестораны
                </h3>
                <p className="text-muted-foreground mb-6 text-sm md:text-base leading-relaxed flex-grow">
                  Лучшие рестораны города с бесплатной доставкой
                </p>
                <Button className="w-full bg-gradient-primary hover:shadow-glow transform hover:-translate-y-0.5 transition-all">
                  Заказать еду
                </Button>
              </Card>
            </Link>

            {/* Flowers */}
            <Link to="/flowers" className="group">
              <Card className="cursor-pointer overflow-hidden shadow-card hover:shadow-glow transition-all duration-300 hover:scale-[1.02] p-6 md:p-8 text-center border-2 hover:border-primary/20 h-full flex flex-col">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Flower2 className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                  Цветы
                </h3>
                <p className="text-muted-foreground mb-6 text-sm md:text-base leading-relaxed flex-grow">
                  Свежие букеты и композиции собственного производства
                </p>
                <Button className="w-full bg-gradient-primary hover:shadow-glow transform hover:-translate-y-0.5 transition-all">
                  Выбрать цветы
                </Button>
              </Card>
            </Link>

            {/* Balloons */}
            <Link to="/balloons" className="group">
              <Card className="cursor-pointer overflow-hidden shadow-card hover:shadow-glow transition-all duration-300 hover:scale-[1.02] p-6 md:p-8 text-center border-2 hover:border-primary/20 h-full flex flex-col">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <PartyPopper className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                  Шары
                </h3>
                <p className="text-muted-foreground mb-6 text-sm md:text-base leading-relaxed flex-grow">
                  Праздничные шары и композиции для любого торжества
                </p>
                <Button className="w-full bg-gradient-primary hover:shadow-glow transform hover:-translate-y-0.5 transition-all">
                  Купить шары
                </Button>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gradient-to-br from-muted/20 to-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Почему выбирают Eazy?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-glow">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Бесплатная доставка</h3>
              <p className="text-muted-foreground leading-relaxed">Доставляем всё абсолютно бесплатно по Нарве</p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-glow">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Быстро</h3>
              <p className="text-muted-foreground leading-relaxed">Доставка за 30 минут в любую точку города</p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-glow">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Качество</h3>
              <p className="text-muted-foreground leading-relaxed">Только свежие продукты и качественные товары</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">💕</span>
                </div>
                <h3 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Eazy
                </h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Быстрая доставка еды, цветов и шаров в Нарву за 30 минут
              </p>
              <p className="text-sm text-muted-foreground">
                © 2024 Eazy. Все права защищены.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Быстрые ссылки</h4>
              <div className="space-y-2">
                <Link to="/restaurants" className="block text-muted-foreground hover:text-primary transition-colors">
                  Рестораны
                </Link>
                <Link to="/flowers" className="block text-muted-foreground hover:text-primary transition-colors">
                  Цветы
                </Link>
                <Link to="/balloons" className="block text-muted-foreground hover:text-primary transition-colors">
                  Шары
                </Link>
                <Link to="/favorites" className="block text-muted-foreground hover:text-primary transition-colors">
                  Избранное
                </Link>
              </div>
            </div>

            {/* Account */}
            <div>
              <h4 className="font-semibold mb-4">Аккаунт</h4>
              <div className="space-y-2">
                <Link to="/profile" className="block text-muted-foreground hover:text-primary transition-colors">
                  Профиль
                </Link>
                <Link to="/orders" className="block text-muted-foreground hover:text-primary transition-colors">
                  Мои заказы
                </Link>
                <Link to="/addresses" className="block text-muted-foreground hover:text-primary transition-colors">
                  Адреса
                </Link>
                <Link to="/auth" className="block text-muted-foreground hover:text-primary transition-colors">
                  Войти
                </Link>
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Поддержка</h4>
              <div className="space-y-2">
                <Link to="/support" className="block text-muted-foreground hover:text-primary transition-colors">
                  Центр поддержки
                </Link>
                <a href="tel:+37255551234" className="block text-muted-foreground hover:text-primary transition-colors">
                  +372 5555-1234
                </a>
                <a href="mailto:support@eazy.ee" className="block text-muted-foreground hover:text-primary transition-colors">
                  support@eazy.ee
                </a>
                <p className="text-sm text-muted-foreground">
                  Пн-Вс 8:00-23:00
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
