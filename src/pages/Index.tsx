import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Добро пожаловать в 
            <span className="text-primary-glow"> Eazy</span>
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Доставка еды, цветов и шаров в Нарву за 30 минут
          </p>
          <p className="text-lg mb-10 opacity-80">
            Выберите категорию и начните делать заказы прямо сейчас!
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Что вы хотите заказать?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Restaurants */}
            <Link to="/restaurants">
              <Card className="group cursor-pointer overflow-hidden shadow-card hover:shadow-glow transition-all duration-300 hover:scale-[1.02] p-8 text-center">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                  Рестораны
                </h3>
                <p className="text-muted-foreground mb-6">
                  Лучшие рестораны города с бесплатной доставкой
                </p>
                <Button className="w-full bg-gradient-primary hover:shadow-glow">
                  Заказать еду
                </Button>
              </Card>
            </Link>

            {/* Flowers */}
            <Link to="/flowers">
              <Card className="group cursor-pointer overflow-hidden shadow-card hover:shadow-glow transition-all duration-300 hover:scale-[1.02] p-8 text-center">
                <div className="text-6xl mb-4">🌸</div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                  Цветы
                </h3>
                <p className="text-muted-foreground mb-6">
                  Свежие букеты и композиции собственного производства
                </p>
                <Button className="w-full bg-gradient-primary hover:shadow-glow">
                  Выбрать цветы
                </Button>
              </Card>
            </Link>

            {/* Balloons */}
            <Link to="/balloons">
              <Card className="group cursor-pointer overflow-hidden shadow-card hover:shadow-glow transition-all duration-300 hover:scale-[1.02] p-8 text-center">
                <div className="text-6xl mb-4">🎈</div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                  Шары
                </h3>
                <p className="text-muted-foreground mb-6">
                  Праздничные шары и композиции для любого торжества
                </p>
                <Button className="w-full bg-gradient-primary hover:shadow-glow">
                  Купить шары
                </Button>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold mb-2">Бесплатная доставка</h3>
              <p className="text-muted-foreground">Доставляем всё абсолютно бесплатно по Нарве</p>
            </div>
            <div>
              <div className="text-4xl mb-4">⏱️</div>
              <h3 className="text-xl font-semibold mb-2">Быстро</h3>
              <p className="text-muted-foreground">Доставка за 30 минут в любую точку города</p>
            </div>
            <div>
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Качество</h3>
              <p className="text-muted-foreground">Только свежие продукты и качественные товары</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
