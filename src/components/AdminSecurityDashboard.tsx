import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  FileText, 
  Activity,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SecureDocumentViewer from './SecureDocumentViewer';

interface SecurityAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  created_at: string;
  status: string;
  user_id?: string;
  metadata?: any;
}

interface AuditLogEntry {
  id: string;
  user_id: string;
  action_type: string;
  resource_type: string;
  resource_id: string;
  created_at: string;
  details?: any;
}

interface DriverApplication {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  status: string;
  created_at: string;
}

export const AdminSecurityDashboard: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [driverApplications, setDriverApplications] = useState<DriverApplication[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  useEffect(() => {
    checkPermissionsAndLoadData();
  }, []);

  const checkPermissionsAndLoadData = async () => {
    try {
      setLoading(true);

      // Check admin permissions
      const { data: canManageSecurity, error: permError } = await supabase.rpc(
        'has_admin_permission',
        { permission_key: 'manage_security' }
      );

      if (permError) {
        console.error('Permission check error:', permError);
        setHasPermission(false);
        return;
      }

      if (!canManageSecurity) {
        setHasPermission(false);
        return;
      }

      setHasPermission(true);
      await Promise.all([
        loadSecurityAlerts(),
        loadAuditLogs(),
        loadDriverApplications()
      ]);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить данные безопасности",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityAlerts = async () => {
    const { data, error } = await supabase
      .from('security_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading security alerts:', error);
      return;
    }

    setAlerts(data || []);
  };

  const loadAuditLogs = async () => {
    const { data, error } = await supabase
      .from('security_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error loading audit logs:', error);
      return;
    }

    setAuditLogs(data || []);
  };

  const loadDriverApplications = async () => {
    const { data, error } = await supabase
      .from('driver_applications')
      .select('id, user_id, first_name, last_name, status, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error loading driver applications:', error);
      return;
    }

    setDriverApplications(data || []);
  };

  const resolveAlert = async (alertId: string) => {
    const { error } = await supabase
      .from('security_alerts')
      .update({ 
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', alertId);

    if (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось разрешить предупреждение",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Предупреждение разрешено",
      description: "Предупреждение успешно помечено как разрешенное"
    });

    loadSecurityAlerts();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          У вас нет прав для доступа к панели безопасности
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Панель безопасности</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Активные предупреждения</p>
                <p className="text-2xl font-bold">
                  {alerts.filter(a => a.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Заявки водителей</p>
                <p className="text-2xl font-bold">
                  {driverApplications.filter(d => d.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Записи аудита (24ч)</p>
                <p className="text-2xl font-bold">
                  {auditLogs.filter(log => 
                    new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Доступ к документам</p>
                <p className="text-2xl font-bold">
                  {auditLogs.filter(log => 
                    log.resource_type === 'driver_document' && 
                    new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Предупреждения безопасности</TabsTrigger>
          <TabsTrigger value="audit">Журнал аудита</TabsTrigger>
          <TabsTrigger value="documents">Документы водителей</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Предупреждения безопасности</CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <p className="text-muted-foreground">Нет активных предупреждений</p>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{alert.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {alert.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.created_at).toLocaleString('ru-RU')}
                        </p>
                      </div>
                      {alert.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Разрешить
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Журнал аудита</CardTitle>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <p className="text-muted-foreground">Нет записей аудита</p>
              ) : (
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-2 text-sm border-b">
                      <div className="flex-1">
                        <span className="font-medium">{log.action_type}</span>
                        <span className="text-muted-foreground"> на </span>
                        <span>{log.resource_type}</span>
                        {log.resource_id && (
                          <>
                            <span className="text-muted-foreground"> (</span>
                            <span className="font-mono text-xs">{log.resource_id.slice(0, 8)}...</span>
                            <span className="text-muted-foreground">)</span>
                          </>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('ru-RU')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Заявки водителей</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {driverApplications.map((application) => (
                    <div 
                      key={application.id} 
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedDriver === application.user_id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedDriver(application.user_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {application.first_name} {application.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(application.created_at).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={application.status === 'pending' ? 'secondary' : 'outline'}>
                            {application.status}
                          </Badge>
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {selectedDriver ? (
                <>
                  <SecureDocumentViewer
                    driverUserId={selectedDriver}
                    documentType="driverLicense"
                  />
                  <SecureDocumentViewer
                    driverUserId={selectedDriver}
                    documentType="vehicleRegistration"
                  />
                  <SecureDocumentViewer
                    driverUserId={selectedDriver}
                    documentType="passport"
                  />
                </>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Выберите заявку водителя для просмотра документов
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSecurityDashboard;