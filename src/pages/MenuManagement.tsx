import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Menu, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Image,
  DollarSign,
  Clock,
  Star,
  Eye,
  EyeOff
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image?: string;
  available: boolean;
  preparationTime: number;
  popular: boolean;
}

const MenuManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddingItem, setIsAddingItem] = useState(false);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: '1',
      name: 'Маргарита',
      category: 'Пицца',
      description: 'Классическая пицца с томатами, моцареллой и базиликом',
      price: 12.50,
      available: true,
      preparationTime: 15,
      popular: true
    },
    {
      id: '2',
      name: 'Пепперони',
      category: 'Пицца',
      description: 'Пицца с пепперони и сыром моцарелла',
      price: 14.90,
      available: true,
      preparationTime: 15,
      popular: true
    },
    {
      id: '3',
      name: 'Цезарь',
      category: 'Салаты',
      description: 'Салат с курицей, сыром пармезан и соусом цезарь',
      price: 8.50,
      available: false,
      preparationTime: 10,
      popular: false
    }
  ]);

  const categories = ['Пицца', 'Салаты', 'Напитки', 'Десерты', 'Супы'];
  
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleAvailability = (id: string) => {
    setMenuItems(prev => prev.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ));
  };

  const stats = {
    totalItems: menuItems.length,
    availableItems: menuItems.filter(item => item.available).length,
    popularItems: menuItems.filter(item => item.popular).length,
    avgPrice: menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Menu className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Управление Меню</h1>
              <Badge variant="secondary">P003 - Каталог (Комплексное)</Badge>
            </div>
            <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить блюдо
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Добавить новое блюдо</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="itemName">Название блюда</Label>
                      <Input id="itemName" placeholder="Название блюда" />
                    </div>
                    <div>
                      <Label htmlFor="itemCategory">Категория</Label>
                      <Input id="itemCategory" placeholder="Категория" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="itemDescription">Описание</Label>
                    <Textarea id="itemDescription" placeholder="Описание блюда" rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="itemPrice">Цена (€)</Label>
                      <Input id="itemPrice" type="number" step="0.10" placeholder="0.00" />
                    </div>
                    <div>
                      <Label htmlFor="prepTime">Время приготовления (мин)</Label>
                      <Input id="prepTime" type="number" placeholder="15" />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setIsAddingItem(false)}>
                      Отмена
                    </Button>
                    <Button onClick={() => setIsAddingItem(false)}>
                      Сохранить блюдо
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Всего блюд</p>
                  <p className="text-2xl font-bold">{stats.totalItems}</p>
                </div>
                <Menu className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Доступно</p>
                  <p className="text-2xl font-bold">{stats.availableItems}</p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Популярные</p>
                  <p className="text-2xl font-bold">{stats.popularItems}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Средняя цена</p>
                  <p className="text-2xl font-bold">€{stats.avgPrice.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="items" className="space-y-6">
          <TabsList>
            <TabsTrigger value="items">Блюда</TabsTrigger>
            <TabsTrigger value="categories">Категории</TabsTrigger>
            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Поиск блюд..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedCategory === 'all' ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory('all')}
                    >
                      Все
                    </Button>
                    {categories.map(category => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Menu Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card key={item.id} className={!item.available ? 'opacity-60' : ''}>
                  <CardContent className="p-0">
                    <div className="aspect-video bg-gray-100 rounded-t-lg flex items-center justify-center">
                      <Image className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <Badge variant="secondary" className="mb-2">{item.category}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.popular && <Star className="h-4 w-4 text-yellow-500" />}
                          <Switch
                            checked={item.available}
                            onCheckedChange={() => toggleAvailability(item.id)}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold">€{item.price.toFixed(2)}</span>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {item.preparationTime} мин
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-2" />
                          Изменить
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Управление категориями</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{category}</h4>
                        <p className="text-sm text-muted-foreground">
                          {menuItems.filter(item => item.category === category).length} блюд
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Аналитика меню</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Продвинутая аналитика меню будет доступна в следующих версиях
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    (Не включена в P003 - базовая версия)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MenuManagement;