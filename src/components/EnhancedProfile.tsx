import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Shield, 
  Download, 
  Bell, 
  Eye, 
  FileText, 
  Trash2,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PrivacySettings {
  shareLocation: boolean;
  orderHistory: boolean;
  personalizedAds: boolean;
  dataCollection: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
}

const EnhancedProfile = () => {
  const { user, profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    shareLocation: true,
    orderHistory: true,
    personalizedAds: false,
    dataCollection: false,
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false
    }
  });

  const handleSaveProfile = async () => {
    const { error } = await updateProfile(formData);
    if (!error) {
      setIsEditing(false);
      toast.success('Профиль обновлен');
    }
  };

  const handleExportData = () => {
    const userData = {
      profile: profile,
      privacy_settings: privacySettings,
      exported_at: new Date().toISOString()
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `user_data_${user?.id}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Данные экспортированы');
  };

  const handleDeleteAccount = () => {
    toast.error('Для удаления аккаунта обратитесь в поддержку');
  };

  const updatePrivacySetting = (key: keyof PrivacySettings, value: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateNotificationSetting = (key: keyof PrivacySettings['notifications'], value: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Профиль
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="w-4 h-4 mr-2" />
            Приватность
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Уведомления
          </TabsTrigger>
          <TabsTrigger value="data">
            <Settings className="w-4 h-4 mr-2" />
            Данные
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Личная информация</CardTitle>
              <CardDescription>
                Управляйте своими личными данными и настройками профиля
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email</Label>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <Badge variant="secondary">Подтвержден</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">Имя</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Фамилия</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  disabled={!isEditing}
                />
              </div>

              <div className="flex gap-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    Редактировать
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleSaveProfile}>Сохранить</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Отмена
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Настройки приватности</CardTitle>
              <CardDescription>
                Контролируйте, как используются ваши данные
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Делиться местоположением</Label>
                  <p className="text-sm text-muted-foreground">
                    Разрешить доступ к местоположению для улучшения сервиса
                  </p>
                </div>
                <Switch
                  checked={privacySettings.shareLocation}
                  onCheckedChange={(value) => updatePrivacySetting('shareLocation', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>История заказов</Label>
                  <p className="text-sm text-muted-foreground">
                    Сохранять историю заказов для рекомендаций
                  </p>
                </div>
                <Switch
                  checked={privacySettings.orderHistory}
                  onCheckedChange={(value) => updatePrivacySetting('orderHistory', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Персонализированная реклама</Label>
                  <p className="text-sm text-muted-foreground">
                    Показывать релевантную рекламу на основе ваших интересов
                  </p>
                </div>
                <Switch
                  checked={privacySettings.personalizedAds}
                  onCheckedChange={(value) => updatePrivacySetting('personalizedAds', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Сбор аналитических данных</Label>
                  <p className="text-sm text-muted-foreground">
                    Разрешить сбор данных для улучшения сервиса
                  </p>
                </div>
                <Switch
                  checked={privacySettings.dataCollection}
                  onCheckedChange={(value) => updatePrivacySetting('dataCollection', value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Настройки уведомлений</CardTitle>
              <CardDescription>
                Выберите, как вы хотите получать уведомления
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email уведомления</Label>
                  <p className="text-sm text-muted-foreground">
                    Получать уведомления о заказах на электронную почту
                  </p>
                </div>
                <Switch
                  checked={privacySettings.notifications.email}
                  onCheckedChange={(value) => updateNotificationSetting('email', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push уведомления</Label>
                  <p className="text-sm text-muted-foreground">
                    Получать уведомления в браузере
                  </p>
                </div>
                <Switch
                  checked={privacySettings.notifications.push}
                  onCheckedChange={(value) => updateNotificationSetting('push', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS уведомления</Label>
                  <p className="text-sm text-muted-foreground">
                    Получать SMS о статусе заказа
                  </p>
                </div>
                <Switch
                  checked={privacySettings.notifications.sms}
                  onCheckedChange={(value) => updateNotificationSetting('sms', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Маркетинговые рассылки</Label>
                  <p className="text-sm text-muted-foreground">
                    Получать информацию о акциях и скидках
                  </p>
                </div>
                <Switch
                  checked={privacySettings.notifications.marketing}
                  onCheckedChange={(value) => updateNotificationSetting('marketing', value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Управление данными</CardTitle>
              <CardDescription>
                Экспорт, просмотр и удаление ваших данных
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5" />
                  <div>
                    <h4 className="font-medium">Экспорт данных</h4>
                    <p className="text-sm text-muted-foreground">
                      Скачать копию всех ваших данных
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleExportData}>
                  <FileText className="w-4 h-4 mr-2" />
                  Экспорт
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5" />
                  <div>
                    <h4 className="font-medium">Просмотр данных</h4>
                    <p className="text-sm text-muted-foreground">
                      Посмотреть, какие данные мы храним о вас
                    </p>
                  </div>
                </div>
                <Button variant="outline">
                  Просмотреть
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-destructive" />
                  <div>
                    <h4 className="font-medium text-destructive">Удалить аккаунт</h4>
                    <p className="text-sm text-muted-foreground">
                      Безвозвратно удалить аккаунт и все связанные данные
                    </p>
                  </div>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Удалить
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedProfile;