import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePromotionTools } from '@/hooks/usePromotionTools';
import { 
  Plus,
  Percent,
  Gift,
  TrendingUp,
  Users,
  Euro,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';

export const RestaurantPromotionTools = () => {
  const { promotions, stats, loading, error, createPromotion, togglePromotion, deletePromotion } = usePromotionTools();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'discount' as 'discount' | 'freeItem' | 'buyOneGetOne',
    value: 0,
    code: '',
    startDate: '',
    endDate: '',
    usageLimit: 100,
    minOrderAmount: 0,
    applicableItems: [] as string[]
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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

  const handleCreatePromotion = async () => {
    await createPromotion({
      ...formData,
      isActive: true
    });
    setShowCreateDialog(false);
    setFormData({
      name: '',
      description: '',
      type: 'discount',
      value: 0,
      code: '',
      startDate: '',
      endDate: '',
      usageLimit: 100,
      minOrderAmount: 0,
      applicableItems: []
    });
  };

  const generateCode = () => {
    const code = Math.random().toString(36).substr(2, 8).toUpperCase();
    setFormData(prev => ({ ...prev, code }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'discount': return <Percent className="h-4 w-4" />;
      case 'freeItem': return <Gift className="h-4 w-4" />;
      case 'buyOneGetOne': return <Users className="h-4 w-4" />;
      default: return <Percent className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'discount': return 'Скидка';
      case 'freeItem': return 'Бесплатный товар';
      case 'buyOneGetOne': return '1+1';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего промокодов</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPromotions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activePromotions} активных
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Использований</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsage}</div>
              <p className="text-xs text-muted-foreground">
                {stats.conversionRate}% конверсия
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Экономия клиентов</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.totalSavings.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">
                Всего сэкономлено
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Конверсия</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Средняя конверсия
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Promotion Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Промокоды и акции</h2>
          <p className="text-muted-foreground">Управляйте промокодами и маркетинговыми акциями</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Создать промокод
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Новый промокод</DialogTitle>
              <DialogDescription>
                Создайте новый промокод для ваших клиентов
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Скидка новичкам"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="15% скидка на первый заказ"
                  rows={2}
                />
              </div>

              <div className="grid gap-2">
                <Label>Тип промокода</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount">Скидка в процентах</SelectItem>
                    <SelectItem value="freeItem">Бесплатный товар</SelectItem>
                    <SelectItem value="buyOneGetOne">1+1 акция</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="value">Значение</Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                    placeholder="15"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="code">Код</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="PROMO15"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={generateCode}>
                      Генерировать
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Начало</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="endDate">Конец</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="usageLimit">Лимит использований</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: Number(e.target.value) }))}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="minOrderAmount">Мин. сумма заказа (€)</Label>
                  <Input
                    id="minOrderAmount"
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreatePromotion}>
                Создать промокод
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Promotions List */}
      <div className="grid gap-4">
        {promotions.map((promotion) => (
          <Card key={promotion.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-lg bg-muted">
                    {getTypeIcon(promotion.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{promotion.name}</h3>
                      <Badge variant={promotion.isActive ? "default" : "secondary"}>
                        {promotion.isActive ? "Активен" : "Неактивен"}
                      </Badge>
                      <Badge variant="outline">
                        {getTypeLabel(promotion.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{promotion.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Код: <code className="bg-muted px-1 rounded">{promotion.code}</code></span>
                      <span>Значение: {promotion.value}%</span>
                      <span>Использований: {promotion.usedCount}/{promotion.usageLimit}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(promotion.startDate).toLocaleDateString()} - {new Date(promotion.endDate).toLocaleDateString()}
                      </span>
                      {promotion.minOrderAmount > 0 && (
                        <span>Мин. заказ: €{promotion.minOrderAmount}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={promotion.isActive}
                    onCheckedChange={() => togglePromotion(promotion.id)}
                  />
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deletePromotion(promotion.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {promotions.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Percent className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Нет промокодов</h3>
              <p className="text-muted-foreground mb-4">
                Создайте первый промокод для привлечения клиентов
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Создать промокод
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};