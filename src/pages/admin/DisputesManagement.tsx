import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  X, 
  Search,
  MessageSquare,
  Eye,
  User,
  Store
} from 'lucide-react';

interface Dispute {
  id: string;
  order_id: string;
  user_name: string;
  restaurant_name: string;
  dispute_type: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  resolved_at?: string;
  admin_notes?: string;
}

// Mock data for demonstration
const mockDisputes: Dispute[] = [
  {
    id: '1',
    order_id: '#1001',
    user_name: 'Анна Смирнова',
    restaurant_name: 'Пицца Маркет',
    dispute_type: 'Некачественная еда',
    description: 'Пицца была холодной и невкусной',
    status: 'open',
    priority: 'medium',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    order_id: '#1002',
    user_name: 'Петр Иванов',
    restaurant_name: 'Суши Дом',
    dispute_type: 'Неправильный заказ',
    description: 'Получил не те роллы, которые заказывал',
    status: 'investigating',
    priority: 'high',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    order_id: '#1003',
    user_name: 'Мария Козлова',
    restaurant_name: 'Бургер Хаус',
    dispute_type: 'Поздняя доставка',
    description: 'Заказ доставили с опозданием на 2 часа',
    status: 'resolved',
    priority: 'low',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    resolved_at: new Date(Date.now() - 86400000).toISOString(),
  }
];

export default function DisputesManagement() {
  const [disputes] = useState<Dispute[]>(mockDisputes);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  const filteredDisputes = disputes.filter(dispute =>
    dispute.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dispute.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dispute.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dispute.dispute_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: disputes.length,
    open: disputes.filter(d => d.status === 'open').length,
    investigating: disputes.filter(d => d.status === 'investigating').length,
    resolved: disputes.filter(d => d.status === 'resolved').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-red-100 text-red-700 border-red-300">Открыт</Badge>;
      case 'investigating':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Расследуется</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-700 border-green-300">Решен</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300">Закрыт</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление спорами</h1>
          <p className="text-muted-foreground">
            Разрешение споров между пользователями и ресторанами
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего споров</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Открытые</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">На рассмотрении</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.investigating}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Решенные</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Поиск споров</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по заказу, пользователю, ресторану..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Disputes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Список споров</CardTitle>
          <CardDescription>
            Все активные и решенные споры на платформе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Заказ</TableHead>
                <TableHead>Участники</TableHead>
                <TableHead>Тип спора</TableHead>
                <TableHead>Приоритет</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата создания</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDisputes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Споры не найдены</TableCell>
                </TableRow>
              ) : (
                filteredDisputes.map((dispute) => (
                  <TableRow key={dispute.id}>
                    <TableCell>
                      <div className="font-medium">{dispute.order_id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <User className="mr-1 h-3 w-3" />
                          {dispute.user_name}
                        </div>
                        <div className="flex items-center text-sm">
                          <Store className="mr-1 h-3 w-3" />
                          {dispute.restaurant_name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{dispute.dispute_type}</div>
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(dispute.priority)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(dispute.status)}
                    </TableCell>
                    <TableCell>
                      {new Date(dispute.created_at).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedDispute(dispute)}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              Просмотр
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Детали спора {dispute.order_id}</DialogTitle>
                              <DialogDescription>
                                Подробная информация о споре
                              </DialogDescription>
                            </DialogHeader>
                            {selectedDispute && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Пользователь:</label>
                                    <p className="text-sm text-muted-foreground">{selectedDispute.user_name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Ресторан:</label>
                                    <p className="text-sm text-muted-foreground">{selectedDispute.restaurant_name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Тип спора:</label>
                                    <p className="text-sm text-muted-foreground">{selectedDispute.dispute_type}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Статус:</label>
                                    <div className="mt-1">{getStatusBadge(selectedDispute.status)}</div>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Описание:</label>
                                  <p className="text-sm text-muted-foreground mt-1">{selectedDispute.description}</p>
                                </div>

                                <div>
                                  <label className="text-sm font-medium">Заметки администратора:</label>
                                  <Textarea 
                                    placeholder="Добавить заметку..."
                                    className="mt-1"
                                  />
                                </div>

                                <div className="flex space-x-2">
                                  {selectedDispute.status !== 'resolved' && (
                                    <>
                                      <Button size="sm">
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        Решить
                                      </Button>
                                      <Button variant="outline" size="sm">
                                        <MessageSquare className="mr-1 h-3 w-3" />
                                        Связаться с участниками
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        {dispute.status === 'open' && (
                          <Button variant="outline" size="sm">
                            <MessageSquare className="mr-1 h-3 w-3" />
                            Начать расследование
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}