import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Info, Eye, Bell, Target } from 'lucide-react';
import { toast } from 'sonner';

interface UserConsent {
  id: string;
  consent_type: string;
  granted: boolean;
  version: string;
  created_at: string;
  updated_at: string;
}

interface ConsentOption {
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  current?: boolean;
}

export const ConsentManager: React.FC = () => {
  const { user } = useAuth();
  const [consents, setConsents] = useState<UserConsent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const consentOptions: ConsentOption[] = [
    {
      type: 'data_processing',
      title: 'Обработка персональных данных',
      description: 'Согласие на обработку и хранение ваших персональных данных для предоставления услуг платформы',
      icon: <Shield className="w-5 h-5" />,
      required: true
    },
    {
      type: 'location_tracking',
      title: 'Отслеживание местоположения',
      description: 'Разрешение на использование данных о местоположении для улучшения сервиса доставки',
      icon: <Target className="w-5 h-5" />,
      required: false
    },
    {
      type: 'marketing_communications',
      title: 'Маркетинговые уведомления',
      description: 'Согласие на получение рекламных предложений и акций по email и push-уведомлениям',
      icon: <Bell className="w-5 h-5" />,
      required: false
    },
    {
      type: 'analytics_tracking',
      title: 'Аналитика и улучшение сервиса',
      description: 'Сбор анонимных данных об использовании приложения для улучшения пользовательского опыта',
      icon: <Eye className="w-5 h-5" />,
      required: false
    },
    {
      type: 'data_sharing',
      title: 'Передача данных партнерам',
      description: 'Согласие на передачу данных доверенным партнерам (рестораны, службы доставки) для выполнения заказов',
      icon: <Info className="w-5 h-5" />,
      required: true
    }
  ];

  useEffect(() => {
    if (user) {
      fetchConsents();
    }
  }, [user]);

  const fetchConsents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_consents')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching consents:', error);
        toast.error('Ошибка загрузки согласий');
      } else {
        setConsents(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConsent = async (consentType: string, granted: boolean) => {
    if (!user) return;

    try {
      setSaving(consentType);

      // Log the consent change for audit
      await supabase.rpc('audit_data_access', {
        action_name: 'update_consent',
        resource_name: 'user_consents',
        resource_identifier: consentType,
        additional_details: { granted, previous_state: getCurrentConsentState(consentType) }
      });

      const { error } = await supabase
        .from('user_consents')
        .upsert({
          user_id: user.id,
          consent_type: consentType,
          granted,
          version: '1.0',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,consent_type'
        });

      if (error) {
        console.error('Error updating consent:', error);
        toast.error('Ошибка при обновлении согласия');
      } else {
        toast.success('Согласие обновлено');
        await fetchConsents();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Произошла ошибка');
    } finally {
      setSaving(null);
    }
  };

  const getCurrentConsentState = (consentType: string): boolean => {
    const consent = consents.find(c => c.consent_type === consentType);
    return consent?.granted || false;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <Shield className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p>Загрузка настроек конфиденциальности...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Согласия и конфиденциальность</h2>
        <p className="text-muted-foreground">
          Управляйте своими согласиями на обработку персональных данных
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Настройки конфиденциальности
          </CardTitle>
          <CardDescription>
            Ваши данные важны для нас. Настройте параметры обработки персональных данных в соответствии с вашими предпочтениями.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {consentOptions.map((option, index) => {
            const isGranted = getCurrentConsentState(option.type);
            const consent = consents.find(c => c.consent_type === option.type);
            const isSaving = saving === option.type;

            return (
              <div key={option.type}>
                <div className="flex items-start justify-between space-x-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <Label 
                        htmlFor={option.type}
                        className="font-medium cursor-pointer"
                      >
                        {option.title}
                        {option.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                    {consent && (
                      <p className="text-xs text-muted-foreground">
                        Последнее обновление: {formatDate(consent.updated_at)}
                      </p>
                    )}
                  </div>
                  <Switch
                    id={option.type}
                    checked={isGranted}
                    disabled={isSaving || option.required}
                    onCheckedChange={(checked) => updateConsent(option.type, checked)}
                  />
                </div>
                {index < consentOptions.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ваши права</CardTitle>
          <CardDescription>
            В соответствии с законодательством о защите персональных данных
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col items-start">
              <div className="font-medium">Запрос данных</div>
              <div className="text-xs text-muted-foreground mt-1">
                Получить копию ваших персональных данных
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col items-start">
              <div className="font-medium">Удаление данных</div>
              <div className="text-xs text-muted-foreground mt-1">
                Запросить удаление ваших данных из системы
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col items-start">
              <div className="font-medium">Исправление данных</div>
              <div className="text-xs text-muted-foreground mt-1">
                Сообщить об ошибках в ваших данных
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col items-start">
              <div className="font-medium">Портативность данных</div>
              <div className="text-xs text-muted-foreground mt-1">
                Экспорт данных в другую систему
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};