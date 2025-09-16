import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, Heart, Star, Clock, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Favorite {
  id: string;
  item_id: string;
  item_type: 'restaurant' | 'product';
  item_data: any;
  created_at: string;
}

const Favorites = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchFavorites();
  }, [user, navigate]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setFavorites((data as Favorite[]) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить избранное",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) {
        throw error;
      }

      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
      
      toast({
        title: "Удалено из избранного",
        description: "Элемент удален из вашего списка избранного",
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить из избранного",
        variant: "destructive",
      });
    }
  };

  const restaurants = favorites.filter(fav => fav.item_type === 'restaurant');
  const products = favorites.filter(fav => fav.item_type === 'product');

  const filteredRestaurants = restaurants.filter(fav =>
    fav.item_data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fav.item_data.cuisine?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(fav =>
    fav.item_data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fav.item_data.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">Загрузка избранного...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Link to="/profile">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к профилю
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold">Избранное</h1>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Поиск в избранном..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="restaurants" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="restaurants">
                Рестораны ({filteredRestaurants.length})
              </TabsTrigger>
              <TabsTrigger value="products">
                Товары ({filteredProducts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="restaurants" className="mt-6">
              {filteredRestaurants.length === 0 ? (
                <Card className="p-8 text-center">
                  <h2 className="text-xl font-semibold mb-4">Нет избранных ресторанов</h2>
                  <p className="text-muted-foreground mb-6">
                    Добавляйте рестораны в избранное для быстрого доступа
                  </p>
                  <Link to="/restaurants">
                    <Button className="bg-gradient-primary hover:shadow-glow">
                      Перейти к ресторанам
                    </Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRestaurants.map((favorite) => (
                    <Card key={favorite.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex gap-4">
                        <img
                          src={favorite.item_data.image}
                          alt={favorite.item_data.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg">{favorite.item_data.name}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFavorite(favorite.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            {favorite.item_data.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm">{favorite.item_data.rating}</span>
                              </div>
                            )}
                            {favorite.item_data.deliveryTime && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{favorite.item_data.deliveryTime}</span>
                              </div>
                            )}
                          </div>

                          {favorite.item_data.cuisine && (
                            <Badge variant="secondary" className="mb-2">
                              {favorite.item_data.cuisine}
                            </Badge>
                          )}

                          <Link to={`/restaurant/${favorite.item_id}`}>
                            <Button size="sm" className="w-full">
                              Открыть меню
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="products" className="mt-6">
              {filteredProducts.length === 0 ? (
                <Card className="p-8 text-center">
                  <h2 className="text-xl font-semibold mb-4">Нет избранных товаров</h2>
                  <p className="text-muted-foreground mb-6">
                    Добавляйте товары в избранное для быстрого доступа
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link to="/restaurants">
                      <Button className="bg-gradient-primary hover:shadow-glow">
                        Еда
                      </Button>
                    </Link>
                    <Link to="/flowers">
                      <Button variant="outline">
                        Цветы
                      </Button>
                    </Link>
                    <Link to="/balloons">
                      <Button variant="outline">
                        Шары
                      </Button>
                    </Link>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((favorite) => (
                    <Card key={favorite.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="relative mb-3">
                        <img
                          src={favorite.item_data.image}
                          alt={favorite.item_data.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFavorite(favorite.id)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-600 bg-white/80 backdrop-blur-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <h3 className="font-semibold mb-2">{favorite.item_data.name}</h3>
                      
                      {favorite.item_data.price && (
                        <p className="text-lg font-bold text-primary mb-2">
                          {favorite.item_data.price.toFixed(2)}€
                        </p>
                      )}

                      {favorite.item_data.category && (
                        <Badge variant="secondary" className="mb-3">
                          {favorite.item_data.category}
                        </Badge>
                      )}

                      <Button size="sm" className="w-full">
                        В корзину
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Favorites;