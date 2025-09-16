import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { 
  Car, 
  CheckCircle, 
  Clock, 
  X, 
  Search,
  Phone,
  Mail,
  Star,
  MapPin,
  Eye
} from 'lucide-react';

interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  vehicle_type: string;
  license_plate?: string;
  is_active: boolean;
  is_verified: boolean;
  status: string;
  rating?: number;
  total_deliveries?: number;
  created_at: string;
}

interface DriverApplication {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  vehicle_type: string;
  license_plate?: string;
  status: string;
  created_at: string;
  admin_notes?: string;
}

export default function DriversManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [applications, setApplications] = useState<DriverApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('drivers');

  useEffect(() => {
    fetchDrivers();
    fetchApplications();
  }, []);

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('driver_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('driver_applications')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      fetchApplications();
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phone.includes(searchTerm)
  );

  const filteredApplications = applications.filter(app =>
    app.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.phone.includes(searchTerm)
  );

  const stats = {
    totalDrivers: drivers.length,
    activeDrivers: drivers.filter(d => d.is_active).length,
    pendingApplications: applications.filter(a => a.status === 'pending').length,
    onlineDrivers: drivers.filter(d => d.status === 'online').length
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 border-green-300">Одобрено</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">На рассмотрении</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 border-red-300">Отклонено</Badge>;
      case 'online':
        return <Badge className="bg-green-100 text-green-700 border-green-300">В сети</Badge>;
      case 'offline':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300">Не в сети</Badge>;
      case 'busy':
        return <Badge className="bg-orange-100 text-orange-700 border-orange-300">Занят</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление водителями</h1>
          <p className="text-muted-foreground">
            Просмотр и управление водителями платформы
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего водителей</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDrivers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">В сети</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onlineDrivers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeDrivers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Заявки</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApplications}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'drivers' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('drivers')}
        >
          Водители
        </Button>
        <Button
          variant={activeTab === 'applications' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('applications')}
        >
          Заявки ({stats.pendingApplications})
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Поиск</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по имени или телефону..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 'drivers' ? (
        <Card>
          <CardHeader>
            <CardTitle>Список водителей</CardTitle>
            <CardDescription>Все активные водители на платформе</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Водитель</TableHead>
                  <TableHead>Контакты</TableHead>
                  <TableHead>Транспорт</TableHead>
                  <TableHead>Рейтинг</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Доставки</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">Загрузка...</TableCell>
                  </TableRow>
                ) : filteredDrivers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">Водители не найдены</TableCell>
                  </TableRow>
                ) : (
                  filteredDrivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {driver.first_name} {driver.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {driver.id.slice(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Phone className="mr-1 h-3 w-3" />
                            {driver.phone}
                          </div>
                          <div className="flex items-center text-sm">
                            <Mail className="mr-1 h-3 w-3" />
                            {driver.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{driver.vehicle_type}</div>
                          {driver.license_plate && (
                            <div className="text-sm text-muted-foreground">
                              {driver.license_plate}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{driver.rating || 'Н/А'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(driver.status)}
                      </TableCell>
                      <TableCell>
                        {driver.total_deliveries || 0}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-1 h-3 w-3" />
                          Просмотр
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Заявки водителей</CardTitle>
            <CardDescription>Новые заявки на регистрацию водителей</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Заявитель</TableHead>
                  <TableHead>Контакты</TableHead>
                  <TableHead>Транспорт</TableHead>
                  <TableHead>Дата подачи</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Загрузка...</TableCell>
                  </TableRow>
                ) : filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Заявки не найдены</TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {application.first_name} {application.last_name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Phone className="mr-1 h-3 w-3" />
                            {application.phone}
                          </div>
                          <div className="flex items-center text-sm">
                            <Mail className="mr-1 h-3 w-3" />
                            {application.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{application.vehicle_type}</div>
                          {application.license_plate && (
                            <div className="text-sm text-muted-foreground">
                              {application.license_plate}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(application.created_at).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(application.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {application.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateApplicationStatus(application.id, 'approved')}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Одобрить
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateApplicationStatus(application.id, 'rejected')}
                              >
                                <X className="mr-1 h-3 w-3" />
                                Отклонить
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="mr-1 h-3 w-3" />
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
      )}
    </div>
  );
}