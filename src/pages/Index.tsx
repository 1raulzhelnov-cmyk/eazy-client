import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { UtensilsCrossed, Flower2, PartyPopper, Truck, Clock, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import DriverApp from "./DriverApp";

const Index = () => {
  const [appMode, setAppMode] = useState<'customer' | 'driver'>('customer');
  const { t } = useLanguage();

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
          {t('mode.customer')}
        </Button>
        <Button
          variant={appMode !== 'customer' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setAppMode('driver')}
          className="text-xs"
        >
          {t('mode.driver')}
        </Button>
        <Link to="/restaurant-dashboard">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            {t('mode.restaurant')}
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
              {t('home.hero.welcome')} 
              <span className="inline-block ml-2 text-primary-glow transform -rotate-1"> Eazy</span>
            </h1>
            <div className="space-y-3 mb-8">
              <p className="text-lg md:text-xl opacity-95">
                {t('home.hero.subtitle')}
              </p>
              <p className="text-base md:text-lg opacity-85 max-w-2xl mx-auto">
                {t('home.hero.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{t('home.categories.title')}</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t('home.categories.subtitle')}
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
                  {t('home.restaurants.title')}
                </h3>
                <p className="text-muted-foreground mb-6 text-sm md:text-base leading-relaxed flex-grow">
                  {t('home.restaurants.description')}
                </p>
                <Button className="w-full bg-gradient-primary hover:shadow-glow transform hover:-translate-y-0.5 transition-all">
                  {t('home.restaurants.button')}
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
                  {t('home.flowers.title')}
                </h3>
                <p className="text-muted-foreground mb-6 text-sm md:text-base leading-relaxed flex-grow">
                  {t('home.flowers.description')}
                </p>
                <Button className="w-full bg-gradient-primary hover:shadow-glow transform hover:-translate-y-0.5 transition-all">
                  {t('home.flowers.button')}
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
                  {t('home.balloons.title')}
                </h3>
                <p className="text-muted-foreground mb-6 text-sm md:text-base leading-relaxed flex-grow">
                  {t('home.balloons.description')}
                </p>
                <Button className="w-full bg-gradient-primary hover:shadow-glow transform hover:-translate-y-0.5 transition-all">
                  {t('home.balloons.button')}
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
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{t('home.features.title')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-glow">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('home.features.delivery.title')}</h3>
              <p className="text-muted-foreground leading-relaxed">{t('home.features.delivery.description')}</p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-glow">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('home.features.fast.title')}</h3>
              <p className="text-muted-foreground leading-relaxed">{t('home.features.fast.description')}</p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-glow">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('home.features.quality.title')}</h3>
              <p className="text-muted-foreground leading-relaxed">{t('home.features.quality.description')}</p>
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
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <h3 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent tracking-tight">
                    Eazy
                  </h3>
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-primary rounded-full opacity-60"></div>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                {t('footer.description')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('footer.copyright')}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">{t('footer.quicklinks')}</h4>
              <div className="space-y-2">
                <Link to="/restaurants" className="block text-muted-foreground hover:text-primary transition-colors">
                  {t('header.nav.restaurants')}
                </Link>
                <Link to="/flowers" className="block text-muted-foreground hover:text-primary transition-colors">
                  {t('header.nav.flowers')}
                </Link>
                <Link to="/balloons" className="block text-muted-foreground hover:text-primary transition-colors">
                  {t('header.nav.balloons')}
                </Link>
                <Link to="/favorites" className="block text-muted-foreground hover:text-primary transition-colors">
                  {t('header.profile.favorites')}
                </Link>
              </div>
            </div>

            {/* Account */}
            <div>
              <h4 className="font-semibold mb-4">{t('footer.account')}</h4>
              <div className="space-y-2">
                <Link to="/profile" className="block text-muted-foreground hover:text-primary transition-colors">
                  {t('header.profile.profile')}
                </Link>
                <Link to="/orders" className="block text-muted-foreground hover:text-primary transition-colors">
                  {t('header.profile.orders')}
                </Link>
                <Link to="/addresses" className="block text-muted-foreground hover:text-primary transition-colors">
                  {t('header.profile.addresses')}
                </Link>
                <Link to="/auth" className="block text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.login')}
                </Link>
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">{t('footer.support')}</h4>
              <div className="space-y-2">
                <Link to="/support" className="block text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.supportcenter')}
                </Link>
                <a href="tel:+37255551234" className="block text-muted-foreground hover:text-primary transition-colors">
                  +372 5555-1234
                </a>
                <a href="mailto:support@eazy.ee" className="block text-muted-foreground hover:text-primary transition-colors">
                  support@eazy.ee
                </a>
                <p className="text-sm text-muted-foreground">
                  {t('footer.schedule')}
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
