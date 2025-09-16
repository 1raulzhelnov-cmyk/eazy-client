import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentUpload {
  file: File | null;
  url: string;
  uploaded: boolean;
  uploading: boolean;
}

const DriverRegistrationForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: user?.email || '',
    vehicleType: '',
    licensePlate: ''
  });

  const [documents, setDocuments] = useState({
    driverLicense: { file: null, url: '', uploaded: false, uploading: false } as DocumentUpload,
    vehicleRegistration: { file: null, url: '', uploaded: false, uploading: false } as DocumentUpload,
    passport: { file: null, url: '', uploaded: false, uploading: false } as DocumentUpload
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadDocument = async (docType: keyof typeof documents, file: File) => {
    if (!user) return;

    setDocuments(prev => ({
      ...prev,
      [docType]: { ...prev[docType], uploading: true }
    }));

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${docType}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('driver-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('driver-documents')
        .getPublicUrl(fileName);

      setDocuments(prev => ({
        ...prev,
        [docType]: {
          file,
          url: fileName, // Сохраняем path, не public URL для безопасности
          uploaded: true,
          uploading: false
        }
      }));

      toast({
        title: "Документ загружен",
        description: "Документ успешно загружен",
      });
    } catch (error) {
      console.error('Upload error:', error);
      setDocuments(prev => ({
        ...prev,
        [docType]: { ...prev[docType], uploading: false }
      }));
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить документ",
        variant: "destructive"
      });
    }
  };

  const handleFileChange = (docType: keyof typeof documents, file: File | null) => {
    if (!file) return;

    // Проверяем размер файла (макс 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "Файл слишком большой",
        description: "Размер файла не должен превышать 20MB",
        variant: "destructive"
      });
      return;
    }

    // Проверяем тип файла
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Неподдерживаемый тип файла",
        description: "Поддерживаются только JPG, PNG, WEBP и PDF файлы",
        variant: "destructive"
      });
      return;
    }

    setDocuments(prev => ({
      ...prev,
      [docType]: { ...prev[docType], file }
    }));

    uploadDocument(docType, file);
  };

  const submitApplication = async () => {
    // Валидация формы
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.vehicleType) {
      toast({
        title: "Заполните все поля",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    // Проверяем, что все документы загружены
    const allDocumentsUploaded = Object.values(documents).every(doc => doc.uploaded);
    if (!allDocumentsUploaded) {
      toast({
        title: "Загрузите все документы",
        description: "Необходимо загрузить все требуемые документы",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('driver_applications')
        .insert({
          user_id: user?.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          vehicle_type: formData.vehicleType,
          license_plate: formData.licensePlate || null,
          driver_license_photo: documents.driverLicense.url,
          vehicle_registration_photo: documents.vehicleRegistration.url,
          passport_photo: documents.passport.url,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Заявка подана!",
        description: "Ваша заявка на регистрацию курьера отправлена на рассмотрение",
      });

      // Перезагружаем страницу или обновляем состояние родителя
      window.location.reload();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось подать заявку. Попробуйте еще раз.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDocumentLabel = (docType: keyof typeof documents) => {
    switch (docType) {
      case 'driverLicense':
        return 'Водительские права';
      case 'vehicleRegistration':
        return 'Регистрация автомобиля';
      case 'passport':
        return 'Паспорт';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Регистрация курьера</CardTitle>
          <p className="text-center text-muted-foreground">
            Заполните форму и загрузите необходимые документы
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Личная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Личная информация</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Введите ваше имя"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Введите вашу фамилию"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+372 XXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Информация о транспорте */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Информация о транспорте</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Тип транспорта *</Label>
                <Select onValueChange={(value) => handleInputChange('vehicleType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип транспорта" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car">Автомобиль</SelectItem>
                    <SelectItem value="bike">Мотоцикл/Скутер</SelectItem>
                    <SelectItem value="bicycle">Велосипед</SelectItem>
                    <SelectItem value="pedestrian">Пешком</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="licensePlate">Номер автомобиля</Label>
                <Input
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                  placeholder="123 ABC"
                />
              </div>
            </div>
          </div>

          {/* Загрузка документов */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Документы</h3>
            <p className="text-sm text-muted-foreground">
              Загрузите фотографии всех требуемых документов (JPG, PNG, WEBP или PDF, до 20MB)
            </p>
            
            {Object.entries(documents).map(([docType, docData]) => (
              <div key={docType} className="space-y-2">
                <Label>{getDocumentLabel(docType as keyof typeof documents)} *</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={(e) => handleFileChange(
                        docType as keyof typeof documents,
                        e.target.files?.[0] || null
                      )}
                      disabled={docData.uploading || docData.uploaded}
                    />
                  </div>
                  {docData.uploading && (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  )}
                  {docData.uploaded && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {!docData.uploaded && !docData.uploading && (
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                {docData.file && (
                  <p className="text-xs text-muted-foreground">
                    Выбран файл: {docData.file.name}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Кнопка отправки */}
          <Button
            onClick={submitApplication}
            disabled={loading || Object.values(documents).some(doc => doc.uploading)}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Отправка заявки...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Подать заявку
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            После подачи заявки, она будет рассмотрена администратором в течение 1-3 рабочих дней.
            Вы получите уведомление о статусе заявки на указанный email.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverRegistrationForm;