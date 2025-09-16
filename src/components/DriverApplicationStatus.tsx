import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, FileText, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DriverApplication {
  id: string;
  status: string;
  first_name: string;
  last_name: string;
  vehicle_type: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const DriverApplicationStatus = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [application, setApplication] = useState<DriverApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchApplicationStatus();
    }
  }, [user]);

  const fetchApplicationStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('driver_applications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching application:', error);
        return;
      }

      setApplication(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'На рассмотрении';
      case 'approved':
        return 'Одобрено';
      case 'rejected':
        return 'Отклонено';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const refreshStatus = () => {
    setLoading(true);
    fetchApplicationStatus();
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Загрузка статуса заявки...</p>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(application.status)}
              <span>Статус заявки</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Заявка от {new Date(application.created_at).toLocaleDateString('ru')}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStatus}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Статус:</span>
          <Badge className={`${getStatusColor(application.status)} text-white`}>
            {getStatusText(application.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Имя:</span>
            <p className="text-muted-foreground">
              {application.first_name} {application.last_name}
            </p>
          </div>
          <div>
            <span className="font-medium">Тип транспорта:</span>
            <p className="text-muted-foreground capitalize">
              {application.vehicle_type === 'car' && 'Автомобиль'}
              {application.vehicle_type === 'bike' && 'Мотоцикл/Скутер'}
              {application.vehicle_type === 'bicycle' && 'Велосипед'}
              {application.vehicle_type === 'pedestrian' && 'Пешком'}
            </p>
          </div>
        </div>

        {application.admin_notes && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium text-sm mb-1">Комментарий администратора:</p>
            <p className="text-sm text-muted-foreground">
              {application.admin_notes}
            </p>
          </div>
        )}

        <div className="space-y-2">
          {application.status === 'pending' && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    Заявка на рассмотрении
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Ожидайте решения администратора. Обычно рассмотрение занимает 1-3 рабочих дня.
                  </p>
                </div>
              </div>
            </div>
          )}

          {application.status === 'approved' && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Заявка одобрена!
                  </p>
                  <p className="text-green-700 dark:text-green-300">
                    Поздравляем! Ваша заявка одобрена. Теперь вы можете начать принимать заказы.
                  </p>
                </div>
              </div>
            </div>
          )}

          {application.status === 'rejected' && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-start space-x-2">
                <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-800 dark:text-red-200">
                    Заявка отклонена
                  </p>
                  <p className="text-red-700 dark:text-red-300">
                    К сожалению, ваша заявка была отклонена. Проверьте комментарий администратора выше.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          Обновлено: {new Date(application.updated_at).toLocaleString('ru')}
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverApplicationStatus;