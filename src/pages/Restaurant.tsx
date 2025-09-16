import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import MenuItem from "@/components/MenuItem";
import Map from "@/components/Map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Star, Truck } from "lucide-react";

// Mock restaurant data
const restaurantsData = {
  "1": {
    id: "1",
    name: "Piccola Italia",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=400&fit=crop",
    cuisine: "Итальянская кухня",
    rating: 4.8,
    reviewsCount: 234,
    deliveryTime: "25-35 мин",
    deliveryFee: 0,
    tags: ["Пицца", "Паста", "Популярное"],
    description: "Аутентичная итальянская кухня с семейными рецептами. Свежие ингредиенты и традиционные методы приготовления.",
    address: "ул. Пушкина 15, Нарва",
    workingHours: "10:00 - 23:00"
  },
  "2": {
    id: "2",
    name: "Суши Мастер", 
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=400&fit=crop",
    cuisine: "Японская кухня",
    rating: 4.7,
    reviewsCount: 189,
    deliveryTime: "30-40 мин",
    deliveryFee: 0,
    tags: ["Суши", "Роллы", "Свежее"],
    description: "Свежие суши и роллы от японских мастеров. Только качественная рыба и оригинальные рецепты.",
    address: "ул. Вокзальная 8, Нарва", 
    workingHours: "11:00 - 22:00"
  },
  // Add more restaurants as needed
};

// Mock menu data
const menuData = {
  "1": { // Piccola Italia
    categories: [
      {
        id: "pizza",
        name: "Пицца",
        items: [
          {
            id: "pizza-1",
            name: "Маргарита",
            image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300&h=200&fit=crop",
            price: 12,
            description: "Классическая пицца с томатным соусом, моцареллой и свежим базиликом",
            weight: "500г",
            ingredients: ["томатный соус", "моцарелла", "базилик", "оливковое масло"],
            popular: true,
            customizable: true,
            sizes: [
              { id: "small", name: "Маленькая (25см)", priceModifier: -3 },
              { id: "medium", name: "Средняя (30см)", priceModifier: 0 },
              { id: "large", name: "Большая (35см)", priceModifier: 5 }
            ],
            addons: [
              { id: "extra-cheese", name: "Дополнительный сыр", price: 2, category: "Сыры" },
              { id: "mozzarella", name: "Буффало моцарелла", price: 3, category: "Сыры" },
              { id: "mushrooms", name: "Грибы", price: 2, category: "Овощи" },
              { id: "olives", name: "Оливки", price: 1.5, category: "Овощи" },
              { id: "tomatoes", name: "Черри томаты", price: 2, category: "Овощи" }
            ]
          },
          {
            id: "pizza-2",
            name: "Пепперони",
            image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&h=200&fit=crop",
            price: 15,
            description: "Острая пицца с пепперони, моцареллой и томатным соусом",
            weight: "520г",
            ingredients: ["томатный соус", "моцарелла", "пепперони", "орегано"],
            customizable: true,
            sizes: [
              { id: "small", name: "Маленькая (25см)", priceModifier: -3 },
              { id: "medium", name: "Средняя (30см)", priceModifier: 0 },
              { id: "large", name: "Большая (35см)", priceModifier: 5 }
            ],
            addons: [
              { id: "extra-pepperoni", name: "Дополнительный пепперони", price: 3, category: "Мясо" },
              { id: "extra-cheese", name: "Дополнительный сыр", price: 2, category: "Сыры" },
              { id: "jalapenos", name: "Халапеньо", price: 1.5, category: "Острое" },
              { id: "bell-peppers", name: "Болгарский перец", price: 1.5, category: "Овощи" },
              { id: "onions", name: "Красный лук", price: 1, category: "Овощи" }
            ]
          },
          {
            id: "pizza-3", 
            name: "Четыре сыра",
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop",
            price: 18,
            description: "Изысканная пицца с четырьмя видами сыра на белом соусе",
            weight: "480г",
            ingredients: ["белый соус", "моцарелла", "горгонзола", "пармезан", "рикотта"],
            customizable: true,
            sizes: [
              { id: "small", name: "Маленькая (25см)", priceModifier: -4 },
              { id: "medium", name: "Средняя (30см)", priceModifier: 0 },
              { id: "large", name: "Большая (35см)", priceModifier: 6 }
            ],
            addons: [
              { id: "gorgonzola-extra", name: "Дополнительная горгонзола", price: 3, category: "Сыры" },
              { id: "parmesan-extra", name: "Дополнительный пармезан", price: 2.5, category: "Сыры" },
              { id: "truffle-oil", name: "Трюфельное масло", price: 4, category: "Премиум" },
              { id: "walnuts", name: "Грецкие орехи", price: 2, category: "Орехи" },
              { id: "honey", name: "Мед", price: 1.5, category: "Сладкое" }
            ]
          }
        ]
      },
      {
        id: "pasta",
        name: "Паста",
        items: [
          {
            id: "pasta-1",
            name: "Карбонара",
            image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop",
            price: 14,
            description: "Классическая римская паста с беконом, яйцом и пармезаном",
            weight: "350г",
            ingredients: ["спагетти", "бекон", "яйца", "пармезан", "черный перец"],
            popular: true
          },
          {
            id: "pasta-2",
            name: "Болоньезе",
            image: "https://images.unsplash.com/photo-1572441713132-51c75654db73?w=300&h=200&fit=crop",
            price: 13,
            description: "Паста с мясным соусом по традиционному болонскому рецепту",
            weight: "380г",
            ingredients: ["спагетти", "говядина", "томаты", "морковь", "сельдерей", "вино"]
          }
        ]
      },
      {
        id: "salads",
        name: "Салаты",
        items: [
          {
            id: "salad-1",
            name: "Цезарь",
            image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=200&fit=crop",
            price: 11,
            description: "Классический салат с курицей, пармезаном и соусом цезарь",
            weight: "280г",
            ingredients: ["салат айсберг", "курица", "пармезан", "гренки", "соус цезарь"],
            tags: ["Популярный"]
          }
        ]
      }
    ]
  },
  "2": { // Суши Мастер
    categories: [
      {
        id: "sushi",
        name: "Суши",
        items: [
          {
            id: "sushi-1", 
            name: "Сет «Классический»",
            image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop",
            price: 22,
            description: "Ассорти из 12 классических суши с лососем, тунцом и креветкой",
            weight: "340г",
            ingredients: ["лосось", "тунец", "креветка", "рис", "нори", "васаби"],
            popular: true
          },
          {
            id: "sushi-2",
            name: "Филадельфия",
            image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=300&h=200&fit=crop",
            price: 18,
            description: "Популярный ролл с лососем, сливочным сыром и огурцом",
            weight: "280г",
            ingredients: ["лосось", "сливочный сыр", "огурец", "рис", "нори"]
          }
        ]
      },
      {
        id: "rolls",
        name: "Роллы",
        items: [
          {
            id: "roll-1",
            name: "Калифорния",
            image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=300&h=200&fit=crop",
            price: 16,
            description: "Ролл с крабом, авокадо и огурцом в кунжуте",
            weight: "260г", 
            ingredients: ["краб", "авокадо", "огурец", "рис", "нори", "кунжут"],
            popular: true
          }
        ]
      }
    ]
  }
};

const Restaurant = () => {
  const { id } = useParams();
  const [selectedCategory, setSelectedCategory] = useState("");
  
  const restaurant = restaurantsData[id as keyof typeof restaurantsData];
  const menu = menuData[id as keyof typeof menuData];

  if (!restaurant || !menu) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Ресторан не найден</h1>
          <Link to="/restaurants">
            <Button>Вернуться к ресторанам</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Set initial category
  if (!selectedCategory && menu.categories.length > 0) {
    setSelectedCategory(menu.categories[0].id);
  }

  const currentCategory = menu.categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Link to="/restaurants">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к ресторанам
          </Button>
        </Link>
      </div>

      {/* Restaurant Header */}
      <section className="relative">
        <div className="h-64 overflow-hidden">
          <img 
            src={restaurant.image} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 text-white p-6">
          <div className="container mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{restaurant.name}</h1>
            <p className="text-lg opacity-90 mb-4">{restaurant.description}</p>
            
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{restaurant.rating}</span>
                <span className="text-sm opacity-75">({restaurant.reviewsCount})</span>
              </div>
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-lg">
                <Clock className="w-4 h-4" />
                <span>{restaurant.deliveryTime}</span>
              </div>
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-lg">
                <Truck className="w-4 h-4" />
                <span>Бесплатная доставка</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Restaurant Info */}
      <section className="py-6 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {restaurant.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>📍 {restaurant.address}</div>
            <div>🕒 {restaurant.workingHours}</div>
          </div>
        </div>
      </section>

      {/* Menu Categories */}
      <section className="py-6 sticky top-[72px] bg-background/95 backdrop-blur-md border-b z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {menu.categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  selectedCategory === category.id 
                    ? "bg-gradient-primary text-white shadow-glow" 
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Items */}
      <section className="pb-16">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {currentCategory && (
                <>
                  <h2 className="text-2xl font-bold mb-6">{currentCategory.name}</h2>
                  <div className="space-y-4">
                    {currentCategory.items.map((item) => (
                      <MenuItem 
                        key={item.id} 
                        {...item} 
                        restaurantId={restaurant.id}
                        restaurantName={restaurant.name}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="space-y-6">
              {/* Location Map */}
              <div>
                <h3 className="text-xl font-bold mb-4">Местоположение</h3>
                <Map 
                  restaurants={[{
                    id: restaurant.id,
                    name: restaurant.name,
                    address: restaurant.address,
                    lat: 55.7558,
                    lng: 37.6173,
                    rating: restaurant.rating
                  }]}
                  height="250px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Restaurant;