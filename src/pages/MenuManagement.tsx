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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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
  EyeOff,
  Upload,
  Camera,
  Package,
  Percent,
  TrendingUp,
  Settings,
  Save,
  ChefHat,
  Tag
} from 'lucide-react';
import { useMenuManagement, MenuItem, MenuCategory } from '@/hooks/useMenuManagement';
import { useToast } from '@/hooks/use-toast';

const MenuManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const { toast } = useToast();

  const {
    menuItems,
    categories,
    loading,
    error,
    createCategory,
    createMenuItem,
    updateMenuItem,
    toggleItemAvailability,
    toggleCategoryActive,
    deleteMenuItem
  } = useMenuManagement();
  
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  const stats = {
    totalItems: menuItems.length,
    availableItems: menuItems.filter(item => item.is_available).length,
    popularItems: menuItems.filter(item => item.is_popular).length,
    avgPrice: menuItems.length > 0 ? menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length : 0,
    discountedItems: menuItems.filter(item => item.discount_percent && item.discount_percent > 0).length
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
              <Badge variant="secondary">P004 - Переключатель Наличия Товаров</Badge>
            </div>
            <div className="flex gap-2">
              <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить категорию
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Добавить категорию</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Название категории</Label>
                      <Input placeholder="Название категории" />
                    </div>
                    <div>
                      <Label>Описание</Label>
                      <Textarea placeholder="Описание категории" rows={3} />
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
                        Отмена
                      </Button>
                      <Button onClick={() => setIsAddingCategory(false)}>
                        Сохранить
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить блюдо
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Добавить новое блюдо</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="itemName">Название блюда *</Label>
                        <Input id="itemName" placeholder="Название блюда" />
                      </div>
                      <div>
                        <Label htmlFor="itemCategory">Категория *</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите категорию" />
                          </SelectTrigger>
                          <SelectContent>
                          {categories.filter(cat => cat.is_active).map(category => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="itemDescription">Описание *</Label>
                      <Textarea id="itemDescription" placeholder="Описание блюда" rows={3} />
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="itemPrice">Цена (€) *</Label>
                        <Input id="itemPrice" type="number" step="0.10" placeholder="0.00" />
                      </div>
                      <div>
                        <Label htmlFor="originalPrice">Исходная цена (€)</Label>
                        <Input id="originalPrice" type="number" step="0.10" placeholder="0.00" />
                      </div>
                      <div>
                        <Label htmlFor="discount">Скидка (%)</Label>
                        <Input id="discount" type="number" placeholder="0" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="prepTime">Время приготовления (мин) *</Label>
                      <Input id="prepTime" type="number" placeholder="15" className="max-w-32" />
                    </div>

                    {/* Images */}
                    <div>
                      <Label>Фотографии товара</Label>
                      <div className="grid grid-cols-4 gap-4 mt-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted">
                            <div className="text-center">
                              <Camera className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                              <p className="text-xs text-muted-foreground">Фото {i}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ingredients */}
                    <div>
                      <Label htmlFor="ingredients">Ингредиенты</Label>
                      <Textarea id="ingredients" placeholder="Разделите ингредиенты запятыми" rows={2} />
                    </div>

                    {/* Tags and Allergens */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tags">Теги</Label>
                        <Input id="tags" placeholder="вегетарианская, острая, популярная" />
                      </div>
                      <div>
                        <Label htmlFor="allergens">Аллергены</Label>
                        <Input id="allergens" placeholder="глютен, молочные продукты" />
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setIsAddingItem(false)}>
                        Отмена
                      </Button>
                      <Button onClick={() => setIsAddingItem(false)}>
                        <Save className="h-4 w-4 mr-2" />
                        Сохранить блюдо
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
                  <p className="text-sm font-medium text-muted-foreground">Со скидкой</p>
                  <p className="text-2xl font-bold">{stats.discountedItems}</p>
                </div>
                <Percent className="h-8 w-8 text-red-600" />
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
            <TabsTrigger value="pricing">Ценообразование</TabsTrigger>
            <TabsTrigger value="availability">Наличие</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-6">
            {/* Enhanced Filters */}
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
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={selectedCategory === 'all' ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory('all')}
                      size="sm"
                    >
                      Все ({menuItems.length})
                    </Button>
                    {categories.filter(cat => cat.is_active).map(category => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.name ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(category.name)}
                        size="sm"
                      >
                        {category.name} ({category.item_count})
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Menu Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card key={item.id} className={!item.is_available ? 'opacity-60' : ''}>
                  <CardContent className="p-0">
                    <div className="aspect-video bg-gray-100 rounded-t-lg flex items-center justify-center relative">
                      {item.images.length > 0 ? (
                        <img 
                          src={item.images[0]} 
                          alt={item.name}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      ) : (
                        <Image className="h-12 w-12 text-gray-400" />
                      )}
                      {item.discount_percent && (
                        <Badge className="absolute top-2 right-2 bg-red-500">
                          -{item.discount_percent}%
                        </Badge>
                      )}
                      {!item.is_available && (
                        <Badge className="absolute top-2 left-2 bg-gray-500">
                          Недоступно
                        </Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <Badge variant="secondary" className="mb-2">{item.category_name}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.is_popular && <Star className="h-4 w-4 text-yellow-500" />}
                          <Switch
                            checked={item.is_available}
                            onCheckedChange={() => toggleItemAvailability(item.id)}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      
                      {/* Enhanced Pricing Display */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold">€{item.price.toFixed(2)}</span>
                          {item.original_price && (
                            <span className="text-sm text-muted-foreground line-through">
                              €{item.original_price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {item.preparation_time} мин
                        </div>
                      </div>

                      {/* Tags */}
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setEditingItem(item)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Изменить
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Удалить блюдо?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Это действие нельзя отменить. Блюдо "{item.name}" будет удалено навсегда.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                                Удалить
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Enhanced Categories Management */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Управление категориями
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          {category.image_url ? (
                            <img 
                              src={category.image_url} 
                              alt={category.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <ChefHat className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{category.name}</h4>
                            <Badge variant={category.is_active ? "default" : "secondary"}>
                              {category.is_active ? "Активна" : "Неактивна"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {category.item_count} блюд
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={category.is_active}
                          onCheckedChange={() => toggleCategoryActive(category.id)}
                        />
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

          {/* Pricing Management */}
          <TabsContent value="pricing">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Массовое изменение цен
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Категория</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все категории</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Изменение цены</Label>
                    <div className="flex gap-2">
                      <Input placeholder="10" type="number" />
                      <Select>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="%" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent">%</SelectItem>
                          <SelectItem value="fixed">€</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="w-full">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Применить изменения
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Percent className="h-5 w-5 mr-2" />
                    Скидки и акции
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Скидка (%)</Label>
                    <Input placeholder="10" type="number" />
                  </div>
                  <div>
                    <Label>Применить к</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите товары" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все товары</SelectItem>
                        <SelectItem value="popular">Популярные</SelectItem>
                        <SelectItem value="category">По категории</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Tag className="h-4 w-4 mr-2" />
                    Создать акцию
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Availability Management */}
          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Управление наличием товаров
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Быстрые действия</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Включить все
                      </Button>
                      <Button variant="outline" size="sm">
                        Выключить все
                      </Button>
                    </div>
                  </div>
                  
                  {menuItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                          <ChefHat className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.category_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant={item.is_available ? "default" : "secondary"}>
                          {item.is_available ? "Доступно" : "Недоступно"}
                        </Badge>
                        <Switch
                          checked={item.is_available}
                          onCheckedChange={() => toggleItemAvailability(item.id)}
                        />
                      </div>
                    </div>
                  ))}
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