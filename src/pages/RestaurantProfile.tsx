import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Store, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Settings,
  Camera,
  Globe,
  Star
} from 'lucide-react';

const RestaurantProfile = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [profileData, setProfileData] = useState({
    name: 'Пиццерия "Мама Мия"',
    type: 'Итальянская кухня',
    description: 'Аутентичная итальянская пиццерия с традиционными рецептами',
    address: 'ул. Пушкина 12, Нарва, Эстония',
    phone: '+372 555 1234',
    email: 'info@mamamia.ee',
    website: 'www.mamamia.ee',
    rating: 4.6,
    deliveryRadius: 5
  });

  const workingHours = {
    monday: { open: '10:00', close: '22:00', closed: false },
    tuesday: { open: '10:00', close: '22:00', closed: false },
    wednesday: { open: '10:00', close: '22:00', closed: false },
    thursday: { open: '10:00', close: '22:00', closed: false },
    friday: { open: '10:00', close: '23:00', closed: false },
    saturday: { open: '11:00', close: '23:00', closed: false },
    sunday: { open: '11:00', close: '21:00', closed: false }
  };

  const dayNames = {
    monday: 'Понедельник',
    tuesday: 'Вторник', 
    wednesday: 'Среда',
    thursday: 'Четверг',
    friday: 'Пятница',
    saturday: 'Суббота',
    sunday: 'Воскресенье'
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Управление Профилем Бизнеса</h1>
              <Badge variant="secondary">P002 - Профиль</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={isOpen ? "default" : "secondary"}>
                {isOpen ? "Открыто" : "Закрыто"}
              </Badge>
              <Switch
                checked={isOpen}
                onCheckedChange={setIsOpen}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Общая информация</TabsTrigger>
            <TabsTrigger value="hours">Часы работы</TabsTrigger>
            <TabsTrigger value="delivery">Доставка</TabsTrigger>
            <TabsTrigger value="media">Медиа</TabsTrigger>
          </TabsList>

          {/* General Information */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Основная информация</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Название заведения</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          placeholder="Название ресторана"
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Тип кухни</Label>
                        <Input
                          id="type"
                          value={profileData.type}
                          placeholder="Итальянская, Азиатская..."
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Описание</Label>
                      <Textarea
                        id="description"
                        value={profileData.description}
                        rows={4}
                        placeholder="Расскажите о вашем заведении..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Адрес</Label>
                      <Textarea
                        id="address"
                        value={profileData.address}
                        rows={2}
                        placeholder="Полный адрес заведения"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Телефон</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          placeholder="+372 XXX XXXX"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={profileData.email}
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="website">Веб-сайт</Label>
                      <Input
                        id="website"
                        value={profileData.website}
                        placeholder="www.example.com"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Restaurant Stats */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Статистика</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Рейтинг</span>
                      </div>
                      <Badge variant="secondary">{profileData.rating}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Всего заказов</span>
                      <Badge variant="secondary">1,234</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Клиентов</span>
                      <Badge variant="secondary">892</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Быстрые действия</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <Camera className="h-4 w-4 mr-2" />
                      Загрузить фото
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Настройки уведомлений
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Working Hours */}
          <TabsContent value="hours">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Часы работы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(workingHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className="font-medium w-24">{dayNames[day as keyof typeof dayNames]}</span>
                        <Switch checked={!hours.closed} />
                      </div>
                      <div className="flex items-center space-x-4">
                        <Input
                          type="time"
                          value={hours.open}
                          disabled={hours.closed}
                          className="w-32"
                        />
                        <span>-</span>
                        <Input
                          type="time"
                          value={hours.close}
                          disabled={hours.closed}
                          className="w-32"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Delivery Settings */}
          <TabsContent value="delivery">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Настройки доставки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="deliveryRadius">Радиус доставки (км)</Label>
                  <Input
                    id="deliveryRadius"
                    type="number"
                    value={profileData.deliveryRadius}
                    placeholder="5"
                    className="max-w-32"
                  />
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Зоны доставки</h4>
                  <p className="text-sm text-muted-foreground">
                    Настройка зон доставки будет доступна в следующих версиях (не включена в P002)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media */}
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Фото и медиа
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Добавить фото</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button size="lg">
            Сохранить изменения
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantProfile;