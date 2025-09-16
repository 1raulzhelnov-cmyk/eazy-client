import React from 'react';
import { SecurityBoundary } from '@/components/SecurityBoundary';
import { SecurityDashboard } from '@/components/SecurityDashboard';
import { ConsentManager } from '@/components/ConsentManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, FileCheck, Eye } from 'lucide-react';

const SecurityCenter: React.FC = () => {
  return (
    <SecurityBoundary requireAuth>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Центр безопасности</h1>
              <p className="text-muted-foreground">
                Управление безопасностью и конфиденциальностью данных
              </p>
            </div>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Мониторинг
              </TabsTrigger>
              <TabsTrigger value="consent" className="flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                Согласия
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Настройки
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <SecurityDashboard />
            </TabsContent>

            <TabsContent value="consent">
              <ConsentManager />
            </TabsContent>

            <TabsContent value="settings">
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Настройки безопасности</h3>
                <p className="text-muted-foreground">
                  Дополнительные настройки безопасности будут добавлены в следующих версиях
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SecurityBoundary>
  );
};

export default SecurityCenter;