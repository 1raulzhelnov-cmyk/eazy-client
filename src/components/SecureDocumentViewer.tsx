import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentInfo {
  file_path: string;
  file_name: string;
  content_type: string;
  size: number;
  created_at: string;
}

interface SecureDocumentViewerProps {
  driverUserId: string;
  documentType: string;
  readonly?: boolean;
}

export const SecureDocumentViewer: React.FC<SecureDocumentViewerProps> = ({
  driverUserId,
  documentType,
  readonly = false
}) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    checkPermissionAndFetchDocuments();
  }, [driverUserId, documentType]);

  const checkPermissionAndFetchDocuments = async () => {
    try {
      setLoading(true);

      // Check if user can access these documents
      const { data: canAccess, error: permError } = await supabase.rpc(
        'can_access_driver_document',
        {
          driver_user_id: driverUserId,
          document_path: `${driverUserId}/${documentType}`
        }
      );

      if (permError) {
        console.error('Permission check error:', permError);
        setHasPermission(false);
        return;
      }

      setHasPermission(canAccess);

      if (!canAccess) {
        toast({
          title: "Доступ запрещен",
          description: "У вас нет прав для просмотра этих документов",
          variant: "destructive"
        });
        return;
      }

      // Fetch document info using secure admin function
      const { data: docs, error } = await supabase.rpc(
        'admin_get_driver_document',
        {
          driver_user_id: driverUserId,
          document_type: documentType
        }
      );

      if (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить информацию о документах",
          variant: "destructive"
        });
        return;
      }

      setDocuments(docs || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Ошибка",
        description: "Произошла неожиданная ошибка",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const viewDocument = async (filePath: string) => {
    try {
      // Create signed URL for secure viewing (for admins only)
      const { data, error } = await supabase.storage
        .from('driver-documents')
        .createSignedUrl(filePath, 300); // 5 minutes expiry

      if (error) {
        console.error('Error creating signed URL:', error);
        toast({
          title: "Ошибка доступа",
          description: "Не удалось получить доступ к документу",
          variant: "destructive"
        });
        return;
      }

      // Open in new tab for viewing
      window.open(data.signedUrl, '_blank');

      // Log the document access for audit
      await supabase.rpc('audit_data_access', {
        action_name: 'view_document',
        resource_name: 'driver_document',
        resource_identifier: filePath,
        additional_details: { action: 'view_signed_url' }
      });

    } catch (error) {
      console.error('Error viewing document:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось открыть документ",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeLabel = (docType: string) => {
    switch (docType) {
      case 'driverLicense':
        return 'Водительские права';
      case 'vehicleRegistration':
        return 'Регистрация автомобиля';
      case 'passport':
        return 'Паспорт';
      default:
        return docType;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasPermission === false) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <span>Доступ к документам запрещен</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {getDocumentTypeLabel(documentType)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-muted-foreground">Документы не найдены</p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{doc.file_name}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>{formatFileSize(doc.size)}</span>
                    <span>{new Date(doc.created_at).toLocaleDateString('ru-RU')}</span>
                    <Badge variant="secondary">{doc.content_type}</Badge>
                  </div>
                </div>
                {!readonly && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewDocument(doc.file_path)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Просмотр
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecureDocumentViewer;