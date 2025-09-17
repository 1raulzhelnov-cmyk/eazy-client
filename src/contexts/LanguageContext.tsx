import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ru' | 'et' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Переводы
const translations = {
  ru: {
    // Header
    'header.search.placeholder': 'Найти рестораны, цветы, шары...',
    'header.delivery.location': 'Доставка в Нарву',
    'header.nav.restaurants': 'Рестораны',
    'header.nav.flowers': 'Цветы',
    'header.nav.balloons': 'Шары',
    'header.profile.profile': 'Профиль',
    'header.profile.orders': 'Мои заказы',
    'header.profile.favorites': 'Избранное',
    'header.profile.addresses': 'Адреса',
    'header.profile.support': 'Поддержка',
    'header.profile.driver': '🚚 Стать курьером',
    'header.profile.admin': '⚙️ Админ панель',
    'header.profile.logout': 'Выйти',

    // Home page
    'home.hero.welcome': 'Добро пожаловать в',
    'home.hero.subtitle': 'Доставка еды, цветов и шаров в Нарву за 30 минут',
    'home.hero.description': 'Выберите категорию и начните делать заказы прямо сейчас!',
    'home.categories.title': 'Что вы хотите заказать?',
    'home.categories.subtitle': 'Свежие продукты, красивые цветы и праздничные шары',
    'home.restaurants.title': 'Рестораны',
    'home.restaurants.description': 'Лучшие рестораны города с бесплатной доставкой',
    'home.restaurants.button': 'Заказать еду',
    'home.flowers.title': 'Цветы',
    'home.flowers.description': 'Свежие букеты и композиции собственного производства',
    'home.flowers.button': 'Выбрать цветы',
    'home.balloons.title': 'Шары',
    'home.balloons.description': 'Праздничные шары и композиции для любого торжества',
    'home.balloons.button': 'Купить шары',
    'home.features.title': 'Почему выбирают Eazy?',
    'home.features.delivery.title': 'Бесплатная доставка',
    'home.features.delivery.description': 'Доставляем всё абсолютно бесплатно по Нарве',
    'home.features.fast.title': 'Быстро',
    'home.features.fast.description': 'Доставка за 30 минут в любую точку города',
    'home.features.quality.title': 'Качество',
    'home.features.quality.description': 'Только свежие продукты и качественные товары',

    // App mode switcher
    'mode.customer': '👤 Клиент',
    'mode.driver': '🚚 Курьер',
    'mode.restaurant': '🏪 Ресторан',

    // Footer
    'footer.description': 'Быстрая доставка еды, цветов и шаров в Нарву за 30 минут',
    'footer.copyright': '© 2024 Eazy. Все права защищены.',
    'footer.quicklinks': 'Быстрые ссылки',
    'footer.account': 'Аккаунт',
    'footer.support': 'Поддержка',
    'footer.supportcenter': 'Центр поддержки',
    'footer.schedule': 'Пн-Вс 8:00-23:00',
    'footer.login': 'Войти',

    // Common
    'common.loading': 'Загрузка...',
    'common.error': 'Ошибка',
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.delete': 'Удалить',
    'common.edit': 'Редактировать',
  },

  et: {
    // Header
    'header.search.placeholder': 'Leia restorane, lilli, palle...',
    'header.delivery.location': 'Kohaletoimetamine Narvas',
    'header.nav.restaurants': 'Restoranid',
    'header.nav.flowers': 'Lilled',
    'header.nav.balloons': 'Pallid',
    'header.profile.profile': 'Profiil',
    'header.profile.orders': 'Minu tellimused',
    'header.profile.favorites': 'Lemmikud',
    'header.profile.addresses': 'Aadressid',
    'header.profile.support': 'Tugi',
    'header.profile.driver': '🚚 Saa kulleriks',
    'header.profile.admin': '⚙️ Admin paneel',
    'header.profile.logout': 'Logi välja',

    // Home page
    'home.hero.welcome': 'Tere tulemast',
    'home.hero.subtitle': 'Toidu, lillede ja pallide kohaletoimetamine Narvas 30 minutiga',
    'home.hero.description': 'Valige kategooria ja alustage tellimuste tegemist kohe!',
    'home.categories.title': 'Mida soovite tellida?',
    'home.categories.subtitle': 'Värske toit, ilusad lilled ja pidulikud pallid',
    'home.restaurants.title': 'Restoranid',
    'home.restaurants.description': 'Linna parimad restoranid tasuta kohaletoimetamisega',
    'home.restaurants.button': 'Telli toitu',
    'home.flowers.title': 'Lilled',
    'home.flowers.description': 'Värsked bukettid ja kompositsioonid oma tootmisest',
    'home.flowers.button': 'Vali lilled',
    'home.balloons.title': 'Pallid',
    'home.balloons.description': 'Pidulikud pallid ja kompositsioonid igale peole',
    'home.balloons.button': 'Osta palle',
    'home.features.title': 'Miks valida Eazy?',
    'home.features.delivery.title': 'Tasuta kohaletoimetamine',
    'home.features.delivery.description': 'Toimetame kõike täiesti tasuta Narvas',
    'home.features.fast.title': 'Kiire',
    'home.features.fast.description': 'Kohaletoimetamine 30 minutiga linna igasse punkti',
    'home.features.quality.title': 'Kvaliteet',
    'home.features.quality.description': 'Ainult värske toit ja kvaliteetsed tooted',

    // App mode switcher
    'mode.customer': '👤 Klient',
    'mode.driver': '🚚 Kuller',
    'mode.restaurant': '🏪 Restoran',

    // Footer
    'footer.description': 'Kiire toidu, lillede ja pallide kohaletoimetamine Narvas 30 minutiga',
    'footer.copyright': '© 2024 Eazy. Kõik õigused kaitstud.',
    'footer.quicklinks': 'Kiirlingid',
    'footer.account': 'Konto',
    'footer.support': 'Tugi',
    'footer.supportcenter': 'Tugikeskus',
    'footer.schedule': 'E-P 8:00-23:00',
    'footer.login': 'Logi sisse',

    // Common
    'common.loading': 'Laadimine...',
    'common.error': 'Viga',
    'common.save': 'Salvesta',
    'common.cancel': 'Tühista',
    'common.delete': 'Kustuta',
    'common.edit': 'Muuda',
  },

  en: {
    // Header
    'header.search.placeholder': 'Find restaurants, flowers, balloons...',
    'header.delivery.location': 'Delivery to Narva',
    'header.nav.restaurants': 'Restaurants',
    'header.nav.flowers': 'Flowers',
    'header.nav.balloons': 'Balloons',
    'header.profile.profile': 'Profile',
    'header.profile.orders': 'My Orders',
    'header.profile.favorites': 'Favorites',
    'header.profile.addresses': 'Addresses',
    'header.profile.support': 'Support',
    'header.profile.driver': '🚚 Become a Driver',
    'header.profile.admin': '⚙️ Admin Panel',
    'header.profile.logout': 'Logout',

    // Home page
    'home.hero.welcome': 'Welcome to',
    'home.hero.subtitle': 'Delivery of food, flowers and balloons in Narva in 30 minutes',
    'home.hero.description': 'Choose a category and start ordering right now!',
    'home.categories.title': 'What would you like to order?',
    'home.categories.subtitle': 'Fresh food, beautiful flowers and festive balloons',
    'home.restaurants.title': 'Restaurants',
    'home.restaurants.description': 'The best restaurants in the city with free delivery',
    'home.restaurants.button': 'Order Food',
    'home.flowers.title': 'Flowers',
    'home.flowers.description': 'Fresh bouquets and compositions of our own production',
    'home.flowers.button': 'Choose Flowers',
    'home.balloons.title': 'Balloons',
    'home.balloons.description': 'Festive balloons and compositions for any celebration',
    'home.balloons.button': 'Buy Balloons',
    'home.features.title': 'Why choose Eazy?',
    'home.features.delivery.title': 'Free Delivery',
    'home.features.delivery.description': 'We deliver everything absolutely free in Narva',
    'home.features.fast.title': 'Fast',
    'home.features.fast.description': 'Delivery in 30 minutes to any point in the city',
    'home.features.quality.title': 'Quality',
    'home.features.quality.description': 'Only fresh products and quality goods',

    // App mode switcher
    'mode.customer': '👤 Customer',
    'mode.driver': '🚚 Driver',
    'mode.restaurant': '🏪 Restaurant',

    // Footer
    'footer.description': 'Fast delivery of food, flowers and balloons in Narva in 30 minutes',
    'footer.copyright': '© 2024 Eazy. All rights reserved.',
    'footer.quicklinks': 'Quick Links',
    'footer.account': 'Account',
    'footer.support': 'Support',
    'footer.supportcenter': 'Support Center',
    'footer.schedule': 'Mon-Sun 8:00-23:00',
    'footer.login': 'Login',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'ru';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ru']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};