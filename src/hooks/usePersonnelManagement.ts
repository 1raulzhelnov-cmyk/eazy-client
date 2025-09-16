import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: 'active' | 'inactive' | 'onLeave';
  hireDate: string;
  salary: number;
  workSchedule: {
    monday: { start: string; end: string; isWorking: boolean };
    tuesday: { start: string; end: string; isWorking: boolean };
    wednesday: { start: string; end: string; isWorking: boolean };
    thursday: { start: string; end: string; isWorking: boolean };
    friday: { start: string; end: string; isWorking: boolean };
    saturday: { start: string; end: string; isWorking: boolean };
    sunday: { start: string; end: string; isWorking: boolean };
  };
  permissions: string[];
  created_at: string;
}

export interface PersonnelStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  newHiresThisMonth: number;
  averageSalary: number;
  departmentBreakdown: Record<string, number>;
}

export const usePersonnelManagement = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<PersonnelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get restaurant ID
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!restaurant) return;

      // Mock data for employees - in real app this would come from database
      const mockEmployees: Employee[] = [
        {
          id: '1',
          firstName: 'Анна',
          lastName: 'Иванова',
          email: 'anna@restaurant.com',
          phone: '+372 5123 4567',
          position: 'Повар',
          department: 'Кухня',
          status: 'active',
          hireDate: '2023-05-15',
          salary: 1800,
          workSchedule: {
            monday: { start: '08:00', end: '16:00', isWorking: true },
            tuesday: { start: '08:00', end: '16:00', isWorking: true },
            wednesday: { start: '08:00', end: '16:00', isWorking: true },
            thursday: { start: '08:00', end: '16:00', isWorking: true },
            friday: { start: '08:00', end: '16:00', isWorking: true },
            saturday: { start: '09:00', end: '15:00', isWorking: true },
            sunday: { start: '', end: '', isWorking: false }
          },
          permissions: ['manage_menu', 'view_orders'],
          created_at: '2023-05-15T00:00:00Z'
        },
        {
          id: '2',
          firstName: 'Петр',
          lastName: 'Сидоров',
          email: 'petr@restaurant.com',
          phone: '+372 5234 5678',
          position: 'Официант',
          department: 'Обслуживание',
          status: 'active',
          hireDate: '2023-08-20',
          salary: 1200,
          workSchedule: {
            monday: { start: '12:00', end: '20:00', isWorking: true },
            tuesday: { start: '12:00', end: '20:00', isWorking: true },
            wednesday: { start: '12:00', end: '20:00', isWorking: true },
            thursday: { start: '12:00', end: '20:00', isWorking: true },
            friday: { start: '12:00', end: '22:00', isWorking: true },
            saturday: { start: '12:00', end: '22:00', isWorking: true },
            sunday: { start: '', end: '', isWorking: false }
          },
          permissions: ['view_orders', 'manage_tables'],
          created_at: '2023-08-20T00:00:00Z'
        }
      ];

      setEmployees(mockEmployees);

      // Calculate stats
      const departmentBreakdown = mockEmployees.reduce((acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const thisMonth = new Date().getMonth();
      const newHiresThisMonth = mockEmployees.filter(emp => 
        new Date(emp.hireDate).getMonth() === thisMonth
      ).length;

      setStats({
        totalEmployees: mockEmployees.length,
        activeEmployees: mockEmployees.filter(emp => emp.status === 'active').length,
        onLeaveEmployees: mockEmployees.filter(emp => emp.status === 'onLeave').length,
        newHiresThisMonth,
        averageSalary: mockEmployees.reduce((sum, emp) => sum + emp.salary, 0) / mockEmployees.length,
        departmentBreakdown,
      });

    } catch (error) {
      console.error('Error fetching employees:', error);
      setError(error instanceof Error ? error.message : 'Ошибка загрузки сотрудников');
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (employeeData: Omit<Employee, 'id' | 'created_at'>) => {
    try {
      setError(null);
      
      const newEmployee: Employee = {
        ...employeeData,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
      };

      setEmployees(prev => [newEmployee, ...prev]);
    } catch (error) {
      console.error('Error adding employee:', error);
      setError('Ошибка добавления сотрудника');
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      setEmployees(prev => prev.map(emp => 
        emp.id === id ? { ...emp, ...updates } : emp
      ));
    } catch (error) {
      console.error('Error updating employee:', error);
      setError('Ошибка обновления данных сотрудника');
    }
  };

  const removeEmployee = async (id: string) => {
    try {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    } catch (error) {
      console.error('Error removing employee:', error);
      setError('Ошибка удаления сотрудника');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [user]);

  return {
    employees,
    stats,
    loading,
    error,
    addEmployee,
    updateEmployee,
    removeEmployee,
    refreshEmployees: fetchEmployees,
  };
};