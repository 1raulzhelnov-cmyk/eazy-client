import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { usePersonnelManagement } from '@/hooks/usePersonnelManagement';
import { 
  Plus,
  Users,
  UserCheck,
  UserX,
  Calendar,
  Euro,
  Phone,
  Mail,
  Clock,
  Settings,
  Eye,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';

export const RestaurantPersonnelManagement = () => {
  const { employees, stats, loading, error, addEmployee, updateEmployee, removeEmployee } = usePersonnelManagement();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: 1200,
    hireDate: '',
    workSchedule: {
      monday: { start: '09:00', end: '17:00', isWorking: true },
      tuesday: { start: '09:00', end: '17:00', isWorking: true },
      wednesday: { start: '09:00', end: '17:00', isWorking: true },
      thursday: { start: '09:00', end: '17:00', isWorking: true },
      friday: { start: '09:00', end: '17:00', isWorking: true },
      saturday: { start: '', end: '', isWorking: false },
      sunday: { start: '', end: '', isWorking: false }
    },
    permissions: [] as string[]
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

  const handleAddEmployee = async () => {
    await addEmployee({
      ...formData,
      status: 'active'
    });
    setShowAddDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      salary: 1200,
      hireDate: '',
      workSchedule: {
        monday: { start: '09:00', end: '17:00', isWorking: true },
        tuesday: { start: '09:00', end: '17:00', isWorking: true },
        wednesday: { start: '09:00', end: '17:00', isWorking: true },
        thursday: { start: '09:00', end: '17:00', isWorking: true },
        friday: { start: '09:00', end: '17:00', isWorking: true },
        saturday: { start: '', end: '', isWorking: false },
        sunday: { start: '', end: '', isWorking: false }
      },
      permissions: []
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'onLeave': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'inactive': return 'Неактивен';
      case 'onLeave': return 'В отпуске';
      default: return status;
    }
  };

  const days = [
    { key: 'monday', label: 'Понедельник' },
    { key: 'tuesday', label: 'Вторник' },
    { key: 'wednesday', label: 'Среда' },
    { key: 'thursday', label: 'Четверг' },
    { key: 'friday', label: 'Пятница' },
    { key: 'saturday', label: 'Суббота' },
    { key: 'sunday', label: 'Воскресенье' }
  ];

  const permissions = [
    { key: 'manage_menu', label: 'Управление меню' },
    { key: 'view_orders', label: 'Просмотр заказов' },
    { key: 'manage_orders', label: 'Управление заказами' },
    { key: 'manage_tables', label: 'Управление столами' },
    { key: 'view_reports', label: 'Просмотр отчетов' },
    { key: 'manage_staff', label: 'Управление персоналом' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего сотрудников</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">
                Общее количество
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активные</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeEmployees}</div>
              <p className="text-xs text-muted-foreground">
                Работают сейчас
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Средняя зарплата</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{Math.round(stats.averageSalary)}</div>
              <p className="text-xs text-muted-foreground">
                В месяц
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Новички этот месяц</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newHiresThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                Принято на работу
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Управление персоналом</h2>
          <p className="text-muted-foreground">Управляйте сотрудниками и их правами</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить сотрудника
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Новый сотрудник</DialogTitle>
              <DialogDescription>
                Добавьте нового сотрудника в команду
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="py-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Основное</TabsTrigger>
                <TabsTrigger value="schedule">Расписание</TabsTrigger>
                <TabsTrigger value="permissions">Права</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">Имя</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Фамилия</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Должность</Label>
                    <Select value={formData.position} onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите должность" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chef">Повар</SelectItem>
                        <SelectItem value="waiter">Официант</SelectItem>
                        <SelectItem value="manager">Менеджер</SelectItem>
                        <SelectItem value="cashier">Кассир</SelectItem>
                        <SelectItem value="cleaner">Уборщик</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Отдел</Label>
                    <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите отдел" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kitchen">Кухня</SelectItem>
                        <SelectItem value="service">Обслуживание</SelectItem>
                        <SelectItem value="management">Управление</SelectItem>
                        <SelectItem value="cleaning">Уборка</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="salary">Зарплата (€)</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData(prev => ({ ...prev, salary: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="hireDate">Дата приема</Label>
                    <Input
                      id="hireDate"
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, hireDate: e.target.value }))}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                {days.map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <Checkbox
                      checked={formData.workSchedule[key as keyof typeof formData.workSchedule].isWorking}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          workSchedule: {
                            ...prev.workSchedule,
                            [key]: {
                              ...prev.workSchedule[key as keyof typeof prev.workSchedule],
                              isWorking: checked as boolean
                            }
                          }
                        }));
                      }}
                    />
                    <div className="min-w-[120px]">
                      <Label>{label}</Label>
                    </div>
                    {formData.workSchedule[key as keyof typeof formData.workSchedule].isWorking && (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="time"
                          value={formData.workSchedule[key as keyof typeof formData.workSchedule].start}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              workSchedule: {
                                ...prev.workSchedule,
                                [key]: {
                                  ...prev.workSchedule[key as keyof typeof prev.workSchedule],
                                  start: e.target.value
                                }
                              }
                            }));
                          }}
                          className="w-24"
                        />
                        <span>-</span>
                        <Input
                          type="time"
                          value={formData.workSchedule[key as keyof typeof formData.workSchedule].end}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              workSchedule: {
                                ...prev.workSchedule,
                                [key]: {
                                  ...prev.workSchedule[key as keyof typeof prev.workSchedule],
                                  end: e.target.value
                                }
                              }
                            }));
                          }}
                          className="w-24"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="permissions" className="space-y-4">
                <div className="grid gap-4">
                  {permissions.map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.permissions.includes(key)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              permissions: [...prev.permissions, key]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              permissions: prev.permissions.filter(p => p !== key)
                            }));
                          }
                        }}
                      />
                      <Label>{label}</Label>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Отмена
              </Button>
              <Button onClick={handleAddEmployee}>
                Добавить сотрудника
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Employees List */}
      <div className="grid gap-4">
        {employees.map((employee) => (
          <Card key={employee.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{employee.firstName} {employee.lastName}</h3>
                      <Badge variant={getStatusColor(employee.status)}>
                        {getStatusLabel(employee.status)}
                      </Badge>
                      <Badge variant="outline">{employee.position}</Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {employee.email}
                      </span>
                      <span className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {employee.phone}
                      </span>
                      <span className="flex items-center">
                        <Euro className="h-3 w-3 mr-1" />
                        {employee.salary}€/мес
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      Принят: {new Date(employee.hireDate).toLocaleDateString('et-EE')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeEmployee(employee.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {employees.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Нет сотрудников</h3>
              <p className="text-muted-foreground mb-4">
                Добавьте первого сотрудника в вашу команду
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить сотрудника
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};