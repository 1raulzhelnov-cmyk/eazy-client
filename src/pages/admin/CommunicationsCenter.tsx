import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  MessageSquare, 
  Send, 
  Bell, 
  Mail, 
  Megaphone,
  Plus,
  Eye,
  Edit,
  Trash2,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  target: 'all' | 'users' | 'drivers' | 'restaurants';
  status: 'draft' | 'sent' | 'scheduled';
  created_at: string;
  sent_at?: string;
  recipient_count?: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  target_audience: string;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

// Mock data
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Системное обновление',
    message: 'Запланировано техническое обслуживание на сегодня с 02:00 до 04:00',
    type: 'warning',
    target: 'all',
    status: 'sent',
    created_at: new Date().toISOString(),
    sent_at: new Date().toISOString(),
    recipient_count: 1250
  },
  {
    id: '2',
    title: 'Новые тарифы доставки',
    message: 'С 1 числа действуют новые тарифы доставки',
    type: 'info',
    target: 'users',
    status: 'scheduled',
    created_at: new Date().toISOString(),
    recipient_count: 890
  }
];

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Праздничные скидки',
    content: 'Скидки до 30% на заказы от партнерских ресторанов в честь праздников!',
    priority: 'high',
    target_audience: 'Все пользователи',
    is_active: true,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    title: 'Новые рестораны',
    content: 'К нам присоединились 5 новых ресторанов в вашем районе!',
    priority: 'medium',
    target_audience: 'Активные пользователи',
    is_active: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export default function CommunicationsCenter() {
  const [notifications] = useState<Notification[]>(mockNotifications);
  const [announcements] = useState<Announcement[]>(mockAnnouncements);
  const [activeTab, setActiveTab] = useState('notifications');
  const [isCreateNotificationOpen, setIsCreateNotificationOpen] = useState(false);
  const [isCreateAnnouncementOpen, setIsCreateAnnouncementOpen] = useState(false);

  const getNotificationTypeBadge = (type: string) => {
    switch (type) {
      case 'info':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300">Информация</Badge>;
      case 'warning':
        return <Badge className="bg-orange-100 text-orange-700 border-orange-300">Предупреждение</Badge>;
      case 'success':
        return <Badge className="bg-green-100 text-green-700 border-green-300">Успех</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-700 border-red-300">Ошибка</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-700 border-green-300">Отправлено</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300">Запланировано</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300">Черновик</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-500 text-white">Высокий</Badge>;
      case 'medium':
        return <Badge className="bg-orange-500 text-white">Средний</Badge>;
      case 'low':
        return <Badge className="bg-green-500 text-white">Низкий</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const stats = {
    totalNotifications: notifications.length,
    sentNotifications: notifications.filter(n => n.status === 'sent').length,
    activeAnnouncements: announcements.filter(a => a.is_active).length,
    totalRecipients: notifications.reduce((sum, n) => sum + (n.recipient_count || 0), 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Центр коммуникаций</h1>
          <p className="text-muted-foreground">
            Управление уведомлениями, объявлениями и массовыми рассылками
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего уведомлений</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNotifications}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Отправлено</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sentNotifications}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные объявления</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAnnouncements}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Получателей</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecipients.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
          <TabsTrigger value="announcements">Объявления</TabsTrigger>
          <TabsTrigger value="campaigns">Email кампании</TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Push уведомления</h2>
            <Dialog open={isCreateNotificationOpen} onOpenChange={setIsCreateNotificationOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Создать уведомление
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Новое уведомление</DialogTitle>
                  <DialogDescription>
                    Создайте push уведомление для пользователей
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Заголовок</Label>
                    <Input id="title" placeholder="Введите заголовок..." />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Сообщение</Label>
                    <Textarea id="message" placeholder="Текст уведомления..." rows={3} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Тип</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Информация</SelectItem>
                          <SelectItem value="warning">Предупреждение</SelectItem>
                          <SelectItem value="success">Успех</SelectItem>
                          <SelectItem value="error">Ошибка</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="target">Получатели</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите получателей" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все пользователи</SelectItem>
                          <SelectItem value="users">Пользователи</SelectItem>
                          <SelectItem value="drivers">Водители</SelectItem>
                          <SelectItem value="restaurants">Рестораны</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateNotificationOpen(false)}>
                      Отмена
                    </Button>
                    <Button variant="outline">Сохранить как черновик</Button>
                    <Button>Отправить сейчас</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Уведомление</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Получатели</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата отправки</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{notification.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {notification.message}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getNotificationTypeBadge(notification.type)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{notification.target}</div>
                          <div className="text-muted-foreground">
                            {notification.recipient_count} получателей
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(notification.status)}
                      </TableCell>
                      <TableCell>
                        {notification.sent_at 
                          ? new Date(notification.sent_at).toLocaleDateString('ru-RU')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-1 h-3 w-3" />
                            Просмотр
                          </Button>
                          {notification.status === 'draft' && (
                            <Button variant="outline" size="sm">
                              <Edit className="mr-1 h-3 w-3" />
                              Изменить
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Объявления</h2>
            <Dialog open={isCreateAnnouncementOpen} onOpenChange={setIsCreateAnnouncementOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Создать объявление
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Новое объявление</DialogTitle>
                  <DialogDescription>
                    Создайте объявление для отображения на платформе
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ann_title">Заголовок</Label>
                    <Input id="ann_title" placeholder="Введите заголовок..." />
                  </div>
                  
                  <div>
                    <Label htmlFor="content">Содержание</Label>
                    <Textarea id="content" placeholder="Содержание объявления..." rows={4} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Приоритет</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите приоритет" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">Высокий</SelectItem>
                          <SelectItem value="medium">Средний</SelectItem>
                          <SelectItem value="low">Низкий</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="audience">Аудитория</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите аудиторию" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все пользователи</SelectItem>
                          <SelectItem value="active">Активные пользователи</SelectItem>
                          <SelectItem value="new">Новые пользователи</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="expires">Дата окончания (опционально)</Label>
                    <Input id="expires" type="datetime-local" />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateAnnouncementOpen(false)}>
                      Отмена
                    </Button>
                    <Button>Создать объявление</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Объявление</TableHead>
                    <TableHead>Приоритет</TableHead>
                    <TableHead>Аудитория</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата создания</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{announcement.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {announcement.content}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(announcement.priority)}
                      </TableCell>
                      <TableCell>{announcement.target_audience}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={announcement.is_active ? "text-green-700 border-green-300" : "text-gray-700 border-gray-300"}
                        >
                          {announcement.is_active ? (
                            <>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Активно
                            </>
                          ) : (
                            'Неактивно'
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(announcement.created_at).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="mr-1 h-3 w-3" />
                            Изменить
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="mr-1 h-3 w-3" />
                            Удалить
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Email кампании</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Создать кампанию
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Email рассылки
              </CardTitle>
              <CardDescription>
                Массовые email кампании и автоматические рассылки
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Email кампании в разработке</h3>
                <p className="text-muted-foreground mb-4">
                  Функционал массовых email рассылок будет доступен в ближайшем обновлении
                </p>
                <Button variant="outline">
                  Настроить интеграции
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}