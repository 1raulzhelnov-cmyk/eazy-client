import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  Search,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ContentItem {
  id: string;
  type: 'restaurant' | 'menu_item' | 'review' | 'image';
  title: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reporter?: string;
  content_data?: any;
  moderation_notes?: string;
}

interface ModerationAction {
  contentId: string;
  action: 'approve' | 'reject';
  notes?: string;
}

export default function ContentManagement() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  useEffect(() => {
    fetchContentItems();
  }, [filter]);

  const fetchContentItems = async () => {
    setLoading(true);
    try {
      // Fetch restaurants awaiting approval
      const { data: restaurants, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('registration_status', filter);

      if (restaurantsError) throw restaurantsError;

      const restaurantItems: ContentItem[] = restaurants?.map(restaurant => ({
        id: restaurant.id,
        type: 'restaurant' as const,
        title: restaurant.business_name,
        description: restaurant.description,
        status: restaurant.registration_status as 'pending' | 'approved' | 'rejected',
        created_at: restaurant.created_at,
        content_data: restaurant
      })) || [];

      // Mock additional content types for demonstration
      const mockMenuItems: ContentItem[] = [
        {
          id: 'menu-1',
          type: 'menu_item',
          title: 'Пицца Маргарита',
          description: 'Классическая итальянская пицца с томатами и моцареллой',
          status: 'pending',
          created_at: new Date().toISOString(),
          content_data: { price: 15.99, restaurant: 'Пиццерия Антонио' }
        },
        {
          id: 'menu-2',
          type: 'menu_item',
          title: 'Бургер с беконом',
          description: 'Сочный бургер с беконом и овощами',
          status: 'pending',
          created_at: new Date().toISOString(),
          content_data: { price: 12.50, restaurant: 'Burger House' }
        }
      ];

      const mockReviews: ContentItem[] = [
        {
          id: 'review-1',
          type: 'review',
          title: 'Отзыв о ресторане "Пиццерия"',
          description: 'Отличная еда, быстрая доставка! Очень доволен заказом.',
          status: 'pending',
          created_at: new Date().toISOString(),
          reporter: 'user123',
          content_data: { rating: 5, restaurant: 'Пиццерия Антонио' }
        }
      ];

      const allItems = [...restaurantItems, ...mockMenuItems, ...mockReviews];
      
      // Filter by status
      const filteredItems = filter === 'all' 
        ? allItems 
        : allItems.filter(item => item.status === filter);

      setContentItems(filteredItems);
    } catch (error) {
      console.error('Failed to fetch content items:', error);
    } finally {
      setLoading(false);
    }
  };

  const moderateContent = async ({ contentId, action, notes }: ModerationAction) => {
    try {
      const item = contentItems.find(i => i.id === contentId);
      if (!item) return;

      if (item.type === 'restaurant') {
        // Update restaurant status
        const { error } = await supabase
          .from('restaurants')
          .update({ 
            registration_status: action === 'approve' ? 'approved' : 'rejected',
            admin_notes: notes
          })
          .eq('id', contentId);

        if (error) throw error;

        // Send notification to restaurant owner
        await supabase.rpc('create_system_notification', {
          target_user_id: item.content_data.user_id,
          notification_title: action === 'approve' ? 'Ресторан одобрен' : 'Заявка отклонена',
          notification_message: action === 'approve' 
            ? `Ваш ресторан "${item.title}" был одобрен и активирован`
            : `Ваша заявка на регистрацию ресторана была отклонена. ${notes || ''}`,
          notification_type: action === 'approve' ? 'success' : 'warning'
        });
      }

      // Refresh content items
      fetchContentItems();
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to moderate content:', error);
    }
  };

  const filteredContent = contentItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Одобрено</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Отклонено</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Ожидает</Badge>;
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'restaurant':
        return <FileText className="h-5 w-5" />;
      case 'menu_item':
        return <FileText className="h-5 w-5" />;
      case 'review':
        return <Eye className="h-5 w-5" />;
      case 'image':
        return <ImageIcon className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Управление контентом</h1>
          <p className="text-muted-foreground">
            Модерация списков бизнеса, меню и отзывов
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск контента..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="pending">Ожидает модерации</SelectItem>
            <SelectItem value="approved">Одобрено</SelectItem>
            <SelectItem value="rejected">Отклонено</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="restaurants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="restaurants">Рестораны</TabsTrigger>
          <TabsTrigger value="menu_items">Меню</TabsTrigger>
          <TabsTrigger value="reviews">Отзывы</TabsTrigger>
          <TabsTrigger value="images">Изображения</TabsTrigger>
        </TabsList>

        <TabsContent value="restaurants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Заявки ресторанов</CardTitle>
              <CardDescription>
                Модерация новых регистраций ресторанов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredContent
                  .filter(item => item.type === 'restaurant')
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getContentIcon(item.type)}
                        </div>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.description?.substring(0, 100)}...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Создано: {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getStatusBadge(item.status)}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedItem(item)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Просмотр
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Модерация: {item.title}</DialogTitle>
                              <DialogDescription>
                                Просмотрите информацию и примите решение по заявке
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedItem && (
                              <div className="space-y-4">
                                <div className="grid gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Информация о ресторане</h4>
                                    <div className="bg-muted p-4 rounded-lg space-y-2">
                                      <p><strong>Название:</strong> {selectedItem.title}</p>
                                      <p><strong>Тип бизнеса:</strong> {selectedItem.content_data?.business_type}</p>
                                      <p><strong>Адрес:</strong> {selectedItem.content_data?.address}</p>
                                      <p><strong>Телефон:</strong> {selectedItem.content_data?.phone}</p>
                                      <p><strong>Email:</strong> {selectedItem.content_data?.email}</p>
                                      <p><strong>Описание:</strong> {selectedItem.description}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium mb-2">Заметки модератора</h4>
                                    <Textarea 
                                      placeholder="Добавьте заметки по решению..."
                                      id="moderation-notes"
                                    />
                                  </div>
                                </div>

                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      const notes = (document.getElementById('moderation-notes') as HTMLTextAreaElement)?.value;
                                      moderateContent({
                                        contentId: selectedItem.id,
                                        action: 'reject',
                                        notes
                                      });
                                    }}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Отклонить
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      const notes = (document.getElementById('moderation-notes') as HTMLTextAreaElement)?.value;
                                      moderateContent({
                                        contentId: selectedItem.id,
                                        action: 'approve',
                                        notes
                                      });
                                    }}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Одобрить
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu_items">
          <Card>
            <CardHeader>
              <CardTitle>Модерация меню</CardTitle>
              <CardDescription>
                Проверка новых блюд и обновлений меню
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredContent
                  .filter(item => item.type === 'menu_item')
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getContentIcon(item.type)}
                        </div>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Цена: €{item.content_data?.price} • {item.content_data?.restaurant}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getStatusBadge(item.status)}
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Модерация отзывов</CardTitle>
              <CardDescription>
                Проверка отзывов и жалоб пользователей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredContent
                  .filter(item => item.type === 'review')
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getContentIcon(item.type)}
                        </div>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Рейтинг: ⭐ {item.content_data?.rating} • {item.content_data?.restaurant}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getStatusBadge(item.status)}
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Модерация изображений</CardTitle>
              <CardDescription>
                Проверка загруженных изображений
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Изображения для модерации будут отображены здесь
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}