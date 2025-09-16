import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, AlertTriangle, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SecurityAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  user_id: string;
  created_at: string;
  status: string;
  resolved_at?: string;
  resolved_by?: string;
}

interface AuditLogEntry {
  id: string;
  user_id: string;
  action_type: string;
  resource_type: string;
  resource_id: string;
  created_at: string;
  details: any;
}

export const SecurityDashboard: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSecurityData();
    }
  }, [user]);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);

      // Fetch security alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('security_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (alertsError) {
        console.error('Error fetching security alerts:', alertsError);
      } else {
        setAlerts(alertsData || []);
      }

      // Fetch audit log
      const { data: auditData, error: auditError } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (auditError) {
        console.error('Error fetching audit log:', auditError);
      } else {
        setAuditLog(auditData || []);
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast.error('Ошибка загрузки данных безопасности');
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('security_alerts')
        .update({ 
          status: 'resolved', 
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id 
        })
        .eq('id', alertId);

      if (error) throw error;

      toast.success('Алерт успешно закрыт');
      fetchSecurityData();
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error('Ошибка при закрытии алерта');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <Shield className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p>Загрузка данных безопасности...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Безопасность</h2>
          <p className="text-muted-foreground">
            Мониторинг безопасности и аудит системы
          </p>
        </div>
        <Button onClick={fetchSecurityData} variant="outline">
          Обновить
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные алерты</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(a => a.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Записей в аудите</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLog.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Последняя активность</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {auditLog.length > 0 
                ? formatDate(auditLog[0].created_at)
                : 'Нет данных'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Алерты безопасности</TabsTrigger>
          <TabsTrigger value="audit">Журнал аудита</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-lg font-medium">Алертов нет</p>
                <p className="text-muted-foreground">Система работает в штатном режиме</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Alert key={alert.id}>
                  <AlertTriangle className="h-4 w-4" />
                  <div className="flex-1">
                    <AlertTitle className="flex items-center gap-2">
                      {alert.title}
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <Badge variant={alert.status === 'active' ? 'destructive' : 'secondary'}>
                        {alert.status}
                      </Badge>
                    </AlertTitle>
                    <AlertDescription className="mt-2">
                      {alert.description}
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(alert.created_at)}
                      </div>
                    </AlertDescription>
                  </div>
                  {alert.status === 'active' && (
                    <Button 
                      size="sm" 
                      onClick={() => resolveAlert(alert.id)}
                      className="ml-2"
                    >
                      Закрыть
                    </Button>
                  )}
                </Alert>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          {auditLog.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Eye className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Записей аудита нет</p>
                <p className="text-muted-foreground">Активность пользователей не обнаружена</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {auditLog.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {entry.action_type} • {entry.resource_type}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {entry.resource_id && `ID: ${entry.resource_id}`}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(entry.created_at)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};