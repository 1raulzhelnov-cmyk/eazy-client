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

    // Search
    'search.popular': 'Популярные запросы:',
    'search.pizza': 'Пицца',
    'search.sushi': 'Суши',
    'search.burgers': 'Бургеры',
    'search.coffee': 'Кофе',
    'search.salads': 'Салаты',
    'search.desserts': 'Десерты',

    // Categories
    'categories.all': 'Все',
    'categories.food': 'Еда',
    'categories.pizza': 'Пицца',
    'categories.sushi': 'Суши',
    'categories.burger': 'Бургеры',
    'categories.coffee': 'Кофе',
    'categories.flowers': 'Цветы',
    'categories.balloons': 'Шары',
    'categories.gifts': 'Подарки',
    'categories.dessert': 'Десерты',

    // Flowers page
    'flowers.hero.title': 'Свежие цветы',
    'flowers.hero.subtitle': 'Собираем и доставляем самые красивые букеты в Нарву',
    'flowers.hero.fresh': 'Свежие каждый день',
    'flowers.hero.production': 'Собственное производство',
    'flowers.hero.delivery': 'Доставка 30 мин',
    'flowers.hero.create': 'Создать свой букет',
    'flowers.categories.all': 'Все цветы',
    'flowers.categories.roses': 'Розы',
    'flowers.categories.tulips': 'Тюльпаны',
    'flowers.categories.bouquets': 'Букеты',
    'flowers.categories.wedding': 'Свадебные',
    'flowers.categories.plants': 'Растения',
    'flowers.title.all': 'Все цветы',
    'flowers.title.found': 'Найденные товары',
    'flowers.products.count': 'товаров',
    'flowers.back': 'Назад к каталогу',

    // Balloons page
    'balloons.hero.title': 'Праздничные шары',
    'balloons.hero.subtitle': 'Создаем яркие праздники с нашими воздушными шарами',
    'balloons.hero.helium': 'Гелий в подарок',
    'balloons.hero.ready': 'Готовые композиции',
    'balloons.hero.fast': 'Быстрая доставка',
    'balloons.categories.all': 'Все шары',
    'balloons.categories.helium': 'Гелиевые',
    'balloons.categories.foil': 'Фольгированные',
    'balloons.categories.birthday': 'День рождения',
    'balloons.categories.wedding': 'Свадебные',
    'balloons.categories.numbers': 'Цифры',
    'balloons.title.all': 'Все шары',
    'balloons.title.found': 'Найденные товары',
    'balloons.products.count': 'товаров',
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

    // Search
    'search.popular': 'Populaarsed otsingud:',
    'search.pizza': 'Pizza',
    'search.sushi': 'Sushi',
    'search.burgers': 'Burgerid',
    'search.coffee': 'Kohv',
    'search.salads': 'Salatid',
    'search.desserts': 'Magustoidud',

    // Categories
    'categories.all': 'Kõik',
    'categories.food': 'Toit',
    'categories.pizza': 'Pizza',
    'categories.sushi': 'Sushi',
    'categories.burger': 'Burgerid',
    'categories.coffee': 'Kohv',
    'categories.flowers': 'Lilled',
    'categories.balloons': 'Pallid',
    'categories.gifts': 'Kingitused',
    'categories.dessert': 'Magustoidud',

    // Flowers page
    'flowers.hero.title': 'Värsked lilled',
    'flowers.hero.subtitle': 'Kogume ja toimetame kõige ilusamaid bukette Narvas',
    'flowers.hero.fresh': 'Värsked iga päev',
    'flowers.hero.production': 'Oma tootmine',
    'flowers.hero.delivery': 'Kohaletoimetamine 30 min',
    'flowers.hero.create': 'Loo oma bukett',
    'flowers.categories.all': 'Kõik lilled',
    'flowers.categories.roses': 'Roosid',
    'flowers.categories.tulips': 'Tulbid',
    'flowers.categories.bouquets': 'Buketid',
    'flowers.categories.wedding': 'Pulmad',
    'flowers.categories.plants': 'Taimed',
    'flowers.title.all': 'Kõik lilled',
    'flowers.title.found': 'Leitud tooted',
    'flowers.products.count': 'toodet',
    'flowers.back': 'Tagasi kataloogi',

    // Balloons page
    'balloons.hero.title': 'Pidulikud pallid',
    'balloons.hero.subtitle': 'Loome helgeid pidusid meie õhupallidegataga',
    'balloons.hero.helium': 'Heelium kingiks',
    'balloons.hero.ready': 'Valmis kompositsioonid',
    'balloons.hero.fast': 'Kiire kohaletoimetamine',
    'balloons.categories.all': 'Kõik pallid',
    'balloons.categories.helium': 'Heeliumpallid',
    'balloons.categories.foil': 'Fooliumist',
    'balloons.categories.birthday': 'Sünnipäev',
    'balloons.categories.wedding': 'Pulmad',
    'balloons.categories.numbers': 'Numbrid',
    'balloons.title.all': 'Kõik pallid',
    'balloons.title.found': 'Leitud tooted',
    'balloons.products.count': 'toodet',
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

    // Search
    'search.popular': 'Popular searches:',
    'search.pizza': 'Pizza',
    'search.sushi': 'Sushi',
    'search.burgers': 'Burgers',
    'search.coffee': 'Coffee',
    'search.salads': 'Salads',
    'search.desserts': 'Desserts',

    // Categories
    'categories.all': 'All',
    'categories.food': 'Food',
    'categories.pizza': 'Pizza',
    'categories.sushi': 'Sushi',
    'categories.burger': 'Burgers',
    'categories.coffee': 'Coffee',
    'categories.flowers': 'Flowers',
    'categories.balloons': 'Balloons',
    'categories.gifts': 'Gifts',
    'categories.dessert': 'Desserts',

    // Flowers page
    'flowers.hero.title': 'Fresh Flowers',
    'flowers.hero.subtitle': 'We collect and deliver the most beautiful bouquets in Narva',
    'flowers.hero.fresh': 'Fresh every day',
    'flowers.hero.production': 'Own production',
    'flowers.hero.delivery': 'Delivery 30 min',
    'flowers.hero.create': 'Create your bouquet',
    'flowers.categories.all': 'All flowers',
    'flowers.categories.roses': 'Roses',
    'flowers.categories.tulips': 'Tulips',
    'flowers.categories.bouquets': 'Bouquets',
    'flowers.categories.wedding': 'Wedding',
    'flowers.categories.plants': 'Plants',
    'flowers.title.all': 'All flowers',
    'flowers.title.found': 'Found products',
    'flowers.products.count': 'products',
    'flowers.back': 'Back to catalog',

    // Balloons page
    'balloons.hero.title': 'Festive Balloons',
    'balloons.hero.subtitle': 'Creating bright celebrations with our balloons',
    'balloons.hero.helium': 'Free helium',
    'balloons.hero.ready': 'Ready compositions',
    'balloons.hero.fast': 'Fast delivery',
    'balloons.categories.all': 'All balloons',
    'balloons.categories.helium': 'Helium',
    'balloons.categories.foil': 'Foil',
    'balloons.categories.birthday': 'Birthday',
    'balloons.categories.wedding': 'Wedding',
    'balloons.categories.numbers': 'Numbers',
    'balloons.title.all': 'All balloons',
    'balloons.title.found': 'Found products',
    'balloons.products.count': 'products',
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