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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  HelpCircle, 
  MessageSquare, 
  FileText, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar
} from 'lucide-react';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  user_name: string;
  user_email: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

interface KnowledgeBase {
  id: string;
  title: string;
  content: string;
  category: string;
  is_published: boolean;
  author: string;
  view_count: number;
  created_at: string;
  updated_at: string;
}

// Mock data
const mockTickets: SupportTicket[] = [
  {
    id: 'T-001',
    title: 'Проблема с оплатой заказа',
    description: 'Не могу оплатить заказ картой, постоянно выдает ошибку',
    priority: 'high',
    status: 'open',
    category: 'Платежи',
    user_name: 'Анна Иванова',
    user_email: 'anna@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'T-002',
    title: 'Вопрос по доставке',
    description: 'Сколько времени занимает доставка в мой район?',
    priority: 'medium',
    status: 'in_progress',
    category: 'Доставка',
    user_name: 'Петр Смирнов',
    user_email: 'petr@example.com',
    assigned_to: 'Администратор',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockFAQ: FAQ[] = [
  {
    id: '1',
    question: 'Как отменить заказ?',
    answer: 'Заказ можно отменить в течение 5 минут после оформления через раздел "Мои заказы" в личном кабинете.',
    category: 'Заказы',
    is_published: true,
    view_count: 156,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    question: 'Какие способы оплаты доступны?',
    answer: 'Мы принимаем оплату банковскими картами Visa, MasterCard, а также через PayPal и Apple Pay.',
    category: 'Платежи',
    is_published: true,
    view_count: 243,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockKnowledgeBase: KnowledgeBase[] = [
  {
    id: '1',
    title: 'Руководство для новых пользователей',
    content: 'Подробное руководство по использованию платформы для новых пользователей...',
    category: 'Руководства',
    is_published: true,
    author: 'Администратор',
    view_count: 89,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export default function SupportCenter() {
  const [tickets] = useState<SupportTicket[]>(mockTickets);
  const [faq] = useState<FAQ[]>(mockFAQ);
  const [knowledgeBase] = useState<KnowledgeBase[]>(mockKnowledgeBase);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isCreateFAQOpen, setIsCreateFAQOpen] = useState(false);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-500 text-white">Срочно</Badge>;
      case 'high':
        return <Badge className="bg-orange-500 text-white">Высокий</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 text-white">Средний</Badge>;
      case 'low':
        return <Badge className="bg-green-500 text-white">Низкий</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-red-100 text-red-700 border-red-300">Открыт</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300">В работе</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-700 border-green-300">Решен</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300">Закрыт</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    openTickets: tickets.filter(t => t.status === 'open').length,
    inProgressTickets: tickets.filter(t => t.status === 'in_progress').length,
    resolvedTickets: tickets.filter(t => t.status === 'resolved').length,
    totalFAQ: faq.length,
    publishedFAQ: faq.filter(f => f.is_published).length,
    totalArticles: knowledgeBase.length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Центр поддержки</h1>
          <p className="text-muted-foreground">
            Управление тикетами поддержки, FAQ и базой знаний
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Открытые тикеты</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openTickets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">В работе</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgressTickets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Решенные</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolvedTickets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FAQ статьи</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedFAQ}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tickets">Тикеты поддержки</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="knowledge">База знаний</TabsTrigger>
        </TabsList>

        {/* Support Tickets Tab */}
        <TabsContent value="tickets" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Тикеты поддержки</h2>
            <div className="flex space-x-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Фильтр по статусу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все тикеты</SelectItem>
                  <SelectItem value="open">Открытые</SelectItem>
                  <SelectItem value="in_progress">В работе</SelectItem>
                  <SelectItem value="resolved">Решенные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Тикет</TableHead>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Приоритет</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата создания</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{ticket.id}</div>
                          <div className="text-sm text-muted-foreground">
                            {ticket.title}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <User className="mr-1 h-3 w-3" />
                            {ticket.user_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {ticket.user_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{ticket.category}</TableCell>
                      <TableCell>
                        {getPriorityBadge(ticket.priority)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(ticket.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(ticket.created_at).toLocaleDateString('ru-RU')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedTicket(ticket)}
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                Просмотр
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Тикет {ticket.id}</DialogTitle>
                                <DialogDescription>
                                  Детальная информация о тикете поддержки
                                </DialogDescription>
                              </DialogHeader>
                              {selectedTicket && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Пользователь:</Label>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedTicket.user_name} ({selectedTicket.user_email})
                                      </p>
                                    </div>
                                    <div>
                                      <Label>Категория:</Label>
                                      <p className="text-sm text-muted-foreground">{selectedTicket.category}</p>
                                    </div>
                                    <div>
                                      <Label>Приоритет:</Label>
                                      <div className="mt-1">{getPriorityBadge(selectedTicket.priority)}</div>
                                    </div>
                                    <div>
                                      <Label>Статус:</Label>
                                      <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label>Заголовок:</Label>
                                    <p className="text-sm text-muted-foreground mt-1">{selectedTicket.title}</p>
                                  </div>

                                  <div>
                                    <Label>Описание:</Label>
                                    <p className="text-sm text-muted-foreground mt-1">{selectedTicket.description}</p>
                                  </div>

                                  <div>
                                    <Label>Ответ администратора:</Label>
                                    <Textarea 
                                      placeholder="Введите ответ для пользователя..."
                                      className="mt-1"
                                      rows={3}
                                    />
                                  </div>

                                  <div className="flex space-x-2">
                                    <Select defaultValue={selectedTicket.status}>
                                      <SelectTrigger className="w-40">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="open">Открыт</SelectItem>
                                        <SelectItem value="in_progress">В работе</SelectItem>
                                        <SelectItem value="resolved">Решен</SelectItem>
                                        <SelectItem value="closed">Закрыт</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button>
                                      <MessageSquare className="mr-1 h-3 w-3" />
                                      Отправить ответ
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Часто задаваемые вопросы</h2>
            <Dialog open={isCreateFAQOpen} onOpenChange={setIsCreateFAQOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить FAQ
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Новый FAQ</DialogTitle>
                  <DialogDescription>
                    Добавьте новый часто задаваемый вопрос
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="question">Вопрос</Label>
                    <Input id="question" placeholder="Введите вопрос..." />
                  </div>
                  
                  <div>
                    <Label htmlFor="answer">Ответ</Label>
                    <Textarea id="answer" placeholder="Введите ответ..." rows={4} />
                  </div>

                  <div>
                    <Label htmlFor="category">Категория</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="orders">Заказы</SelectItem>
                        <SelectItem value="payments">Платежи</SelectItem>
                        <SelectItem value="delivery">Доставка</SelectItem>
                        <SelectItem value="account">Аккаунт</SelectItem>
                        <SelectItem value="technical">Технические вопросы</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateFAQOpen(false)}>
                      Отмена
                    </Button>
                    <Button>Создать FAQ</Button>
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
                    <TableHead>Вопрос</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Просмотры</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата обновления</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faq.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{item.question}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.answer.substring(0, 100)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.view_count}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={item.is_published ? "text-green-700 border-green-300" : "text-gray-700 border-gray-300"}
                        >
                          {item.is_published ? (
                            <>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Опубликовано
                            </>
                          ) : (
                            'Черновик'
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(item.updated_at).toLocaleDateString('ru-RU')}
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

          {/* FAQ Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Предварительный просмотр FAQ</CardTitle>
              <CardDescription>
                Как будут выглядеть вопросы для пользователей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faq.filter(item => item.is_published).map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">База знаний</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Создать статью
            </Button>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Статья</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Автор</TableHead>
                    <TableHead>Просмотры</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {knowledgeBase.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{article.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {article.content.substring(0, 100)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{article.category}</TableCell>
                      <TableCell>{article.author}</TableCell>
                      <TableCell>{article.view_count}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={article.is_published ? "text-green-700 border-green-300" : "text-gray-700 border-gray-300"}
                        >
                          {article.is_published ? 'Опубликовано' : 'Черновик'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-1 h-3 w-3" />
                            Просмотр
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="mr-1 h-3 w-3" />
                            Изменить
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
      </Tabs>
    </div>
  );
}