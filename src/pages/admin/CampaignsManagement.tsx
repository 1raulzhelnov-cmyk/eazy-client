import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Megaphone, 
  Plus, 
  Eye, 
  Pause, 
  Play, 
  BarChart3,
  Users,
  Calendar,
  Target
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'push' | 'sms' | 'promo';
  status: 'draft' | 'active' | 'paused' | 'completed';
  target_audience: string;
  start_date: string;
  end_date?: string;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  created_at: string;
  budget?: number;
  description: string;
}

// Mock data for demonstration
const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Скидка 20% на первый заказ',
    type: 'email',
    status: 'active',
    target_audience: 'Новые пользователи',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    sent_count: 1250,
    opened_count: 456,
    clicked_count: 89,
    created_at: new Date().toISOString(),
    budget: 500,
    description: 'Привлечение новых пользователей с помощью приветственной скидки'
  },
  {
    id: '2',
    name: 'Уведомление о новом ресторане',
    type: 'push',
    status: 'completed',
    target_audience: 'Все пользователи',
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    sent_count: 5670,
    opened_count: 2890,
    clicked_count: 456,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Анонс открытия нового партнерского ресторана'
  }
];

export default function CampaignsManagement() {
  const [campaigns] = useState<Campaign[]>(mockCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    totalSent: campaigns.reduce((sum, c) => sum + c.sent_count, 0),
    totalClicked: campaigns.reduce((sum, c) => sum + c.clicked_count, 0)
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 border-green-300">Активна</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300">Черновик</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Приостановлена</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300">Завершена</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return '📧';
      case 'push':
        return '🔔';
      case 'sms':
        return '📱';
      case 'promo':
        return '🎁';
      default:
        return '📢';
    }
  };

  const calculateCTR = (clicked: number, sent: number) => {
    return sent > 0 ? ((clicked / sent) * 100).toFixed(1) : '0.0';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Маркетинговые кампании</h1>
          <p className="text-muted-foreground">
            Управление рекламными кампаниями и коммуникацией с пользователями
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Создать кампанию
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Создать новую кампанию</DialogTitle>
              <DialogDescription>
                Настройте параметры новой маркетинговой кампании
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Название кампании</Label>
                  <Input id="name" placeholder="Введите название..." />
                </div>
                <div>
                  <Label htmlFor="type">Тип кампании</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email рассылка</SelectItem>
                      <SelectItem value="push">Push уведомления</SelectItem>
                      <SelectItem value="sms">SMS сообщения</SelectItem>
                      <SelectItem value="promo">Промо акция</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="audience">Целевая аудитория</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите аудиторию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все пользователи</SelectItem>
                    <SelectItem value="new">Новые пользователи</SelectItem>
                    <SelectItem value="active">Активные пользователи</SelectItem>
                    <SelectItem value="inactive">Неактивные пользователи</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea 
                  id="description" 
                  placeholder="Описание кампании..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start">Дата начала</Label>
                  <Input id="start" type="datetime-local" />
                </div>
                <div>
                  <Label htmlFor="end">Дата окончания</Label>
                  <Input id="end" type="datetime-local" />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Отмена
                </Button>
                <Button>Создать кампанию</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего кампаний</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные</CardTitle>
            <Play className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Отправлено</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Переходов</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicked.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Список кампаний</CardTitle>
          <CardDescription>
            Все созданные маркетинговые кампании
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Кампания</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Аудитория</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Статистика</TableHead>
                <TableHead>CTR</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(campaign.start_date).toLocaleDateString('ru-RU')} - 
                        {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString('ru-RU') : 'Бессрочно'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="mr-2">{getTypeIcon(campaign.type)}</span>
                      <span className="capitalize">{campaign.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{campaign.target_audience}</TableCell>
                  <TableCell>
                    {getStatusBadge(campaign.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div>Отправлено: {campaign.sent_count.toLocaleString()}</div>
                      <div>Открыто: {campaign.opened_count.toLocaleString()}</div>
                      <div>Переходов: {campaign.clicked_count.toLocaleString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {calculateCTR(campaign.clicked_count, campaign.sent_count)}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedCampaign(campaign)}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            Просмотр
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Детали кампании</DialogTitle>
                          </DialogHeader>
                          {selectedCampaign && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Название:</Label>
                                  <p className="text-sm text-muted-foreground">{selectedCampaign.name}</p>
                                </div>
                                <div>
                                  <Label>Тип:</Label>
                                  <p className="text-sm text-muted-foreground">{selectedCampaign.type}</p>
                                </div>
                                <div>
                                  <Label>Статус:</Label>
                                  <div className="mt-1">{getStatusBadge(selectedCampaign.status)}</div>
                                </div>
                                <div>
                                  <Label>Бюджет:</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedCampaign.budget ? `€${selectedCampaign.budget}` : 'Не указан'}
                                  </p>
                                </div>
                              </div>
                              
                              <div>
                                <Label>Описание:</Label>
                                <p className="text-sm text-muted-foreground mt-1">{selectedCampaign.description}</p>
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted rounded-lg">
                                  <div className="text-2xl font-bold">{selectedCampaign.sent_count}</div>
                                  <div className="text-sm text-muted-foreground">Отправлено</div>
                                </div>
                                <div className="text-center p-4 bg-muted rounded-lg">
                                  <div className="text-2xl font-bold">{selectedCampaign.opened_count}</div>
                                  <div className="text-sm text-muted-foreground">Открыто</div>
                                </div>
                                <div className="text-center p-4 bg-muted rounded-lg">
                                  <div className="text-2xl font-bold">{selectedCampaign.clicked_count}</div>
                                  <div className="text-sm text-muted-foreground">Переходов</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      {campaign.status === 'active' && (
                        <Button variant="outline" size="sm">
                          <Pause className="mr-1 h-3 w-3" />
                          Приостановить
                        </Button>
                      )}
                      
                      {campaign.status === 'paused' && (
                        <Button variant="outline" size="sm">
                          <Play className="mr-1 h-3 w-3" />
                          Возобновить
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
    </div>
  );
}