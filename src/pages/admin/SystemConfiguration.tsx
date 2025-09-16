import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Shield, 
  Zap, 
  Globe, 
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface SystemConfig {
  platform_name: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  driver_registration_enabled: boolean;
  restaurant_registration_enabled: boolean;
  commission_rate: number;
  delivery_fee: number;
  min_order_amount: number;
  max_delivery_distance: number;
  currency: string;
  timezone: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
}

export default function SystemConfiguration() {
  const [config, setConfig] = useState<SystemConfig>({
    platform_name: 'FoodDelivery Platform',
    maintenance_mode: false,
    registration_enabled: true,
    driver_registration_enabled: true,
    restaurant_registration_enabled: true,
    commission_rate: 15,
    delivery_fee: 2.50,
    min_order_amount: 10,
    max_delivery_distance: 25,
    currency: 'EUR',
    timezone: 'Europe/Tallinn',
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateConfig = (key: keyof SystemConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      // Here you would implement the actual save functionality
      console.log('Saving config:', config);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving config:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetConfig = () => {
    // Reset to default values
    setConfig({
      platform_name: 'FoodDelivery Platform',
      maintenance_mode: false,
      registration_enabled: true,
      driver_registration_enabled: true,
      restaurant_registration_enabled: true,
      commission_rate: 15,
      delivery_fee: 2.50,
      min_order_amount: 10,
      max_delivery_distance: 25,
      currency: 'EUR',
      timezone: 'Europe/Tallinn',
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
    });
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Конфигурация системы</h1>
          <p className="text-muted-foreground">
            Настройки платформы и параметры системы
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={resetConfig}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Сбросить
          </Button>
          <Button 
            onClick={saveConfig}
            disabled={!hasChanges || saving}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      {config.maintenance_mode && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
              <div>
                <h3 className="font-medium text-orange-800">Режим обслуживания активен</h3>
                <p className="text-sm text-orange-700">
                  Платформа недоступна для пользователей. Только администраторы могут получить доступ.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Общие</TabsTrigger>
          <TabsTrigger value="business">Бизнес</TabsTrigger>
          <TabsTrigger value="features">Функции</TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                Основные настройки
              </CardTitle>
              <CardDescription>
                Общие параметры платформы
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="platform_name">Название платформы</Label>
                  <Input
                    id="platform_name"
                    value={config.platform_name}
                    onChange={(e) => updateConfig('platform_name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Валюта</Label>
                  <Select value={config.currency} onValueChange={(value) => updateConfig('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="RUB">RUB (₽)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Часовой пояс</Label>
                  <Select value={config.timezone} onValueChange={(value) => updateConfig('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Tallinn">Europe/Tallinn</SelectItem>
                      <SelectItem value="Europe/Moscow">Europe/Moscow</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Режим обслуживания</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Включить режим обслуживания</Label>
                    <p className="text-sm text-muted-foreground">
                      Временно отключить доступ пользователей к платформе
                    </p>
                  </div>
                  <Switch
                    checked={config.maintenance_mode}
                    onCheckedChange={(checked) => updateConfig('maintenance_mode', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Settings */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Бизнес параметры
              </CardTitle>
              <CardDescription>
                Настройки комиссий, сборов и лимитов
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="commission_rate">Комиссия платформы (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    value={config.commission_rate}
                    onChange={(e) => updateConfig('commission_rate', Number(e.target.value))}
                    min="0"
                    max="50"
                    step="0.1"
                  />
                  <p className="text-sm text-muted-foreground">
                    Комиссия с каждого заказа ресторана
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="delivery_fee">Стоимость доставки ({config.currency})</Label>
                  <Input
                    id="delivery_fee"
                    type="number"
                    value={config.delivery_fee}
                    onChange={(e) => updateConfig('delivery_fee', Number(e.target.value))}
                    min="0"
                    step="0.1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="min_order_amount">Минимальная сумма заказа ({config.currency})</Label>
                  <Input
                    id="min_order_amount"
                    type="number"
                    value={config.min_order_amount}
                    onChange={(e) => updateConfig('min_order_amount', Number(e.target.value))}
                    min="0"
                    step="0.1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_delivery_distance">Максимальное расстояние доставки (км)</Label>
                  <Input
                    id="max_delivery_distance"
                    type="number"
                    value={config.max_delivery_distance}
                    onChange={(e) => updateConfig('max_delivery_distance', Number(e.target.value))}
                    min="1"
                    max="100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Settings */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5" />
                Функции платформы
              </CardTitle>
              <CardDescription>
                Включение и отключение функций системы
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Регистрация пользователей</Label>
                    <p className="text-sm text-muted-foreground">
                      Разрешить новым пользователям регистрироваться
                    </p>
                  </div>
                  <Switch
                    checked={config.registration_enabled}
                    onCheckedChange={(checked) => updateConfig('registration_enabled', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Регистрация водителей</Label>
                    <p className="text-sm text-muted-foreground">
                      Разрешить новым водителям подавать заявки
                    </p>
                  </div>
                  <Switch
                    checked={config.driver_registration_enabled}
                    onCheckedChange={(checked) => updateConfig('driver_registration_enabled', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Регистрация ресторанов</Label>
                    <p className="text-sm text-muted-foreground">
                      Разрешить новым ресторанам подавать заявки
                    </p>
                  </div>
                  <Switch
                    checked={config.restaurant_registration_enabled}
                    onCheckedChange={(checked) => updateConfig('restaurant_registration_enabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Системы уведомлений
              </CardTitle>
              <CardDescription>
                Настройка каналов уведомлений
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email уведомления</Label>
                    <p className="text-sm text-muted-foreground">
                      Отправка уведомлений по электронной почте
                    </p>
                  </div>
                  <Switch
                    checked={config.email_notifications}
                    onCheckedChange={(checked) => updateConfig('email_notifications', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push уведомления</Label>
                    <p className="text-sm text-muted-foreground">
                      Мгновенные уведомления в приложении
                    </p>
                  </div>
                  <Switch
                    checked={config.push_notifications}
                    onCheckedChange={(checked) => updateConfig('push_notifications', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS уведомления</Label>
                    <p className="text-sm text-muted-foreground">
                      Отправка SMS сообщений (требует настройки провайдера)
                    </p>
                  </div>
                  <Switch
                    checked={config.sms_notifications}
                    onCheckedChange={(checked) => updateConfig('sms_notifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Настройки безопасности
              </CardTitle>
              <CardDescription>
                Параметры безопасности и защиты системы
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Двухфакторная аутентификация</Label>
                    <p className="text-sm text-muted-foreground">
                      Обязательная 2FA для администраторов
                    </p>
                  </div>
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Активно
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>SSL сертификаты</Label>
                    <p className="text-sm text-muted-foreground">
                      Шифрование соединений HTTPS
                    </p>
                  </div>
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Активно
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Аудит системы</Label>
                    <p className="text-sm text-muted-foreground">
                      Логирование всех действий администраторов
                    </p>
                  </div>
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Активно
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Firewall защита</Label>
                    <p className="text-sm text-muted-foreground">
                      Защита от DDoS атак и подозрительного трафика
                    </p>
                  </div>
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Активно
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Changes Warning */}
      {hasChanges && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <h3 className="font-medium text-blue-800">Есть несохраненные изменения</h3>
                  <p className="text-sm text-blue-700">
                    Не забудьте сохранить изменения перед выходом из системы.
                  </p>
                </div>
              </div>
              <Button onClick={saveConfig} disabled={saving}>
                {saving ? 'Сохранение...' : 'Сохранить сейчас'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}