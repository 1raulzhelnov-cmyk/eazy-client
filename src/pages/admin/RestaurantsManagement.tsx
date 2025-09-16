import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { 
  Store, 
  CheckCircle, 
  Clock, 
  X, 
  Search,
  MapPin,
  Phone,
  Mail,
  Star
} from 'lucide-react';

interface Restaurant {
  id: string;
  business_name: string;
  business_type: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  is_active: boolean;
  is_open: boolean;
  rating: number;
  registration_status: string;
  created_at: string;
  admin_notes?: string;
}

export default function RestaurantsManagement() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRestaurantStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ registration_status: status })
        .eq('id', id);

      if (error) throw error;
      
      // Refresh the list
      fetchRestaurants();
    } catch (error) {
      console.error('Error updating restaurant status:', error);
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.business_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: restaurants.length,
    pending: restaurants.filter(r => r.registration_status === 'pending').length,
    approved: restaurants.filter(r => r.registration_status === 'approved').length,
    rejected: restaurants.filter(r => r.registration_status === 'rejected').length
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 border-green-300">Одобрено</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">На рассмотрении</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 border-red-300">Отклонено</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление ресторанами</h1>
          <p className="text-muted-foreground">
            Просмотр и управление ресторанами на платформе
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего ресторанов</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">На рассмотрении</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Одобрено</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Отклонено</CardTitle>
            <X className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Поиск ресторанов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию, адресу или типу..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Restaurants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Список ресторанов</CardTitle>
          <CardDescription>
            Все зарегистрированные рестораны на платформе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ресторан</TableHead>
                <TableHead>Контакты</TableHead>
                <TableHead>Рейтинг</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата регистрации</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Загрузка...</TableCell>
                </TableRow>
              ) : filteredRestaurants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Рестораны не найдены</TableCell>
                </TableRow>
              ) : (
                filteredRestaurants.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{restaurant.business_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {restaurant.business_type}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-1 h-3 w-3" />
                          {restaurant.address}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Phone className="mr-1 h-3 w-3" />
                          {restaurant.phone}
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="mr-1 h-3 w-3" />
                          {restaurant.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{restaurant.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(restaurant.registration_status)}
                    </TableCell>
                    <TableCell>
                      {new Date(restaurant.created_at).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {restaurant.registration_status === 'pending' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateRestaurantStatus(restaurant.id, 'approved')}
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Одобрить
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateRestaurantStatus(restaurant.id, 'rejected')}
                            >
                              <X className="mr-1 h-3 w-3" />
                              Отклонить
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm">
                          Просмотр
                        </Button>
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