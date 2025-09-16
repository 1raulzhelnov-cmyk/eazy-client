import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Camera,
  MapPin
} from 'lucide-react';

const RestaurantRegistration = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    documents: {
      businessLicense: null,
      taxCertificate: null,
      healthCertificate: null
    }
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => setStep(Math.min(step + 1, totalSteps));
  const prevStep = () => setStep(Math.max(step - 1, 1));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <Store className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Регистрация Поставщика</h1>
            <Badge variant="secondary">P001 - Регистрация и Верификация</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Шаг {step} из {totalSteps}</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% завершено</span>
            </div>
            <Progress value={progress} className="mb-4" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Основная информация</span>
              <span>Контакты</span>
              <span>Описание</span>
              <span>Документы</span>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {step === 1 && <Store className="h-5 w-5 mr-2" />}
              {step === 2 && <MapPin className="h-5 w-5 mr-2" />}
              {step === 3 && <FileText className="h-5 w-5 mr-2" />}
              {step === 4 && <Upload className="h-5 w-5 mr-2" />}
              {step === 1 && 'Основная информация о бизнесе'}
              {step === 2 && 'Контактная информация'}
              {step === 3 && 'Описание и категория'}
              {step === 4 && 'Загрузка документов'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Business Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="businessName">Название бизнеса *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    placeholder="Введите название вашего ресторана"
                  />
                </div>
                <div>
                  <Label htmlFor="businessType">Тип заведения *</Label>
                  <Input
                    id="businessType"
                    value={formData.businessType}
                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                    placeholder="Ресторан, Кафе, Пиццерия и т.д."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Адрес *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Полный адрес вашего заведения"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+372 XXX XXXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Description */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Описание заведения</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Расскажите о вашем заведении, кухне, особенностях..."
                    rows={5}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Documents */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-sm text-muted-foreground mb-4">
                  Загрузите необходимые документы для верификации вашего бизнеса
                </div>
                
                {[
                  { key: 'businessLicense', title: 'Лицензия на ведение бизнеса', required: true },
                  { key: 'taxCertificate', title: 'Налоговый сертификат', required: true },
                  { key: 'healthCertificate', title: 'Сертификат здравоохранения', required: false }
                ].map((doc) => (
                  <Card key={doc.key} className="border-dashed">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {doc.title}
                              {doc.required && <span className="text-red-500 ml-1">*</span>}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              PDF, JPG или PNG до 5MB
                            </p>
                          </div>
                        </div>
                        <Button variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Загрузить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={step === 1}
              >
                Назад
              </Button>
              <Button 
                onClick={step === totalSteps ? () => alert('Регистрация завершена!') : nextStep}
              >
                {step === totalSteps ? 'Отправить на рассмотрение' : 'Далее'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Panel */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Статус верификации</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="font-medium">Ожидает рассмотрения</p>
                <p className="text-sm text-muted-foreground">
                  Ваша заявка будет рассмотрена в течение 2-3 рабочих дней
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RestaurantRegistration;