import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRestaurantSupport } from '@/hooks/useRestaurantSupport';
import { 
  MessageSquare,
  Phone,
  Mail,
  FileText,
  HelpCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Search,
  Send,
  Paperclip,
  AlertCircle
} from 'lucide-react';

export const RestaurantSupportCenter = () => {
  const { tickets, knowledgeBase, loading, error, createTicket, updateTicket, refreshTickets } = useRestaurantSupport();
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [ticketData, setTicketData] = useState({
    subject: '',
    category: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    description: ''
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleCreateTicket = async () => {
    await createTicket(ticketData);
    setShowCreateTicket(false);
    setTicketData({
      subject: '',
      category: '',
      priority: 'medium',
      description: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'in_progress': return 'secondary';
      case 'resolved': return 'outline';
      case 'closed': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Открыт';
      case 'in_progress': return 'В работе';
      case 'resolved': return 'Решен';
      case 'closed': return 'Закрыт';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return priority;
    }
  };

  const categoryFiltered = selectedCategory 
    ? tickets.filter(ticket => ticket.category === selectedCategory)
    : tickets;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Центр поддержки</h2>
          <p className="text-muted-foreground">Получите помощь и найдите ответы на вопросы</p>
        </div>
        
        <Dialog open={showCreateTicket} onOpenChange={setShowCreateTicket}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Создать обращение
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Новое обращение</DialogTitle>
              <DialogDescription>
                Опишите вашу проблему, и мы поможем её решить
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="subject" className="text-sm font-medium">Тема</label>
                <Input
                  id="subject"
                  value={ticketData.subject}
                  onChange={(e) => setTicketData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Кратко опишите проблему"
                />
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium">Категория</label>
                <Select value={ticketData.category} onValueChange={(value) => setTicketData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Технические проблемы</SelectItem>
                    <SelectItem value="payment">Платежи</SelectItem>
                    <SelectItem value="account">Аккаунт</SelectItem>
                    <SelectItem value="orders">Заказы</SelectItem>
                    <SelectItem value="menu">Меню</SelectItem>
                    <SelectItem value="other">Другое</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Приоритет</label>
                <Select value={ticketData.priority} onValueChange={(value: 'high' | 'medium' | 'low') => setTicketData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Высокий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="low">Низкий</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">Описание</label>
                <Textarea
                  id="description"
                  value={ticketData.description}
                  onChange={(e) => setTicketData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Подробно опишите вашу проблему..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateTicket(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreateTicket}>
                Создать обращение
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="tickets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tickets">Мои обращения</TabsTrigger>
          <TabsTrigger value="knowledge">База знаний</TabsTrigger>
          <TabsTrigger value="contact">Контакты</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Всего обращений</span>
                </div>
                <p className="text-2xl font-bold mt-2">{tickets.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">В работе</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {tickets.filter(t => t.status === 'in_progress').length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Решены</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {tickets.filter(t => t.status === 'resolved').length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Открытые</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {tickets.filter(t => t.status === 'open').length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Все категории" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все категории</SelectItem>
                <SelectItem value="technical">Технические</SelectItem>
                <SelectItem value="payment">Платежи</SelectItem>
                <SelectItem value="account">Аккаунт</SelectItem>
                <SelectItem value="orders">Заказы</SelectItem>
                <SelectItem value="menu">Меню</SelectItem>
                <SelectItem value="other">Другое</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={refreshTickets} variant="outline">
              Обновить
            </Button>
          </div>

          {/* Tickets List */}
          <div className="space-y-4">
            {categoryFiltered.map((ticket) => (
              <Card key={ticket.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">{ticket.subject}</h4>
                        <Badge variant={getStatusColor(ticket.status)}>
                          {getStatusLabel(ticket.status)}
                        </Badge>
                        <Badge variant={getPriorityColor(ticket.priority)}>
                          {getPriorityLabel(ticket.priority)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        Обращение #{ticket.id} • {ticket.category} • {new Date(ticket.createdAt).toLocaleDateString('et-EE')}
                      </p>
                      
                      <p className="text-sm">{ticket.description}</p>
                      
                      {ticket.lastResponse && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Последний ответ:</p>
                          <p className="text-sm">{ticket.lastResponse}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        Открыть
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {categoryFiltered.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Нет обращений</h3>
                  <p className="text-muted-foreground mb-4">
                    У вас пока нет обращений в поддержку
                  </p>
                  <Button onClick={() => setShowCreateTicket(true)}>
                    Создать первое обращение
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {knowledgeBase.map((article) => (
              <Card key={article.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <CardDescription>{article.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {article.excerpt}
                  </p>
                  <Button variant="outline" size="sm">
                    Читать полностью
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Свяжитесь с нами</CardTitle>
                <CardDescription>
                  Выберите удобный способ связи
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Телефон поддержки</p>
                    <p className="text-sm text-muted-foreground">+372 123 4567</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email поддержки</p>
                    <p className="text-sm text-muted-foreground">support@restaurant.com</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Онлайн чат</p>
                    <p className="text-sm text-muted-foreground">Доступен 24/7</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Время работы поддержки</CardTitle>
                <CardDescription>
                  Мы готовы помочь вам
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Понедельник - Пятница</span>
                    <span>9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Суббота</span>
                    <span>10:00 - 16:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Воскресенье</span>
                    <span>Выходной</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Часто задаваемые вопросы</CardTitle>
                <CardDescription>
                  Ответы на популярные вопросы
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-2 border-primary pl-4">
                  <h4 className="font-semibold">Как изменить меню?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Перейдите в раздел "Управление меню" в панели управления, где вы можете добавлять, редактировать и удалять блюда.
                  </p>
                </div>
                
                <div className="border-l-2 border-primary pl-4">
                  <h4 className="font-semibold">Как настроить уведомления о заказах?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    В настройках аккаунта найдите раздел "Уведомления" и выберите предпочтительные способы получения уведомлений.
                  </p>
                </div>
                
                <div className="border-l-2 border-primary pl-4">
                  <h4 className="font-semibold">Проблемы с платежами?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Убедитесь, что ваш аккаунт Stripe подключен правильно. Проверьте настройки в разделе "Финансы".
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RestaurantSupportCenter;