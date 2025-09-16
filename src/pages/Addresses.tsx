import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, MapPin, Plus, Edit, Trash2, Home, Building, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Address {
  id: string;
  user_id: string;
  title: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  delivery_instructions?: string;
  created_at: string;
  updated_at: string;
}

const Addresses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  const [formData, setFormData] = useState({
    title: "Дом",
    address_line_1: "",
    address_line_2: "",
    city: "Нарва",
    postal_code: "",
    country: "Estonia",
    delivery_instructions: "",
    is_default: false,
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchAddresses();
  }, [user, navigate]);

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить адреса",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim() || !formData.address_line_1.trim() || !formData.postal_code.trim()) {
      toast({
        title: "Ошибка валидации",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSaveAddress = async () => {
    if (!validateForm()) return;

    try {
      if (editingAddress) {
        // Update existing address
        const { error } = await supabase
          .from('addresses')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingAddress.id);

        if (error) throw error;

        toast({
          title: "Адрес обновлен",
          description: "Адрес успешно обновлен",
        });
      } else {
        // Create new address
        const { error } = await supabase
          .from('addresses')
          .insert({
            ...formData,
            user_id: user!.id,
          });

        if (error) throw error;

        toast({
          title: "Адрес добавлен",
          description: "Новый адрес успешно добавлен",
        });
      }

      // Reset form and close dialog
      setFormData({
        title: "Дом",
        address_line_1: "",
        address_line_2: "",
        city: "Нарва",
        postal_code: "",
        country: "Estonia",
        delivery_instructions: "",
        is_default: false,
      });
      setEditingAddress(null);
      setIsDialogOpen(false);
      
      // Refresh addresses
      await fetchAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить адрес",
        variant: "destructive",
      });
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      title: address.title,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || "",
      city: address.city,
      postal_code: address.postal_code,
      country: address.country,
      delivery_instructions: address.delivery_instructions || "",
      is_default: address.is_default,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;

      toast({
        title: "Адрес удален",
        description: "Адрес успешно удален",
      });

      await fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить адрес",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      // First, remove default from all addresses
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Then set the selected address as default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      if (error) throw error;

      toast({
        title: "Адрес по умолчанию",
        description: "Адрес установлен как основной",
      });

      await fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось установить адрес по умолчанию",
        variant: "destructive",
      });
    }
  };

  const getAddressIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case 'дом': return <Home className="w-5 h-5" />;
      case 'работа': return <Building className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">Загрузка адресов...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Link to="/profile">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к профилю
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Мои адреса</h1>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary hover:shadow-glow">
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить адрес
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingAddress ? "Редактировать адрес" : "Новый адрес"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Название адреса *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Дом, Работа, и т.д."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address_line_1">Адрес *</Label>
                    <Input
                      id="address_line_1"
                      name="address_line_1"
                      value={formData.address_line_1}
                      onChange={handleInputChange}
                      placeholder="Улица, дом"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address_line_2">Квартира</Label>
                    <Input
                      id="address_line_2"
                      name="address_line_2"
                      value={formData.address_line_2}
                      onChange={handleInputChange}
                      placeholder="Квартира, подъезд, этаж"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Город</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="postal_code">Почтовый код *</Label>
                      <Input
                        id="postal_code"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleInputChange}
                        placeholder="20000"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="delivery_instructions">Инструкции для доставки</Label>
                    <Textarea
                      id="delivery_instructions"
                      name="delivery_instructions"
                      value={formData.delivery_instructions}
                      onChange={handleInputChange}
                      placeholder="Дополнительная информация для курьера"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveAddress} className="flex-1">
                      {editingAddress ? "Сохранить" : "Добавить"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingAddress(null);
                      }}
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Addresses List */}
          {addresses.length === 0 ? (
            <Card className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">У вас пока нет адресов</h2>
              <p className="text-muted-foreground mb-6">
                Добавьте адрес для быстрого оформления заказов
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <Card key={address.id} className={`p-4 ${address.is_default ? 'ring-2 ring-primary' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getAddressIcon(address.title)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{address.title}</h3>
                          {address.is_default && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                              <CheckCircle className="w-3 h-3" />
                              По умолчанию
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {address.address_line_1}
                          {address.address_line_2 && `, ${address.address_line_2}`}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {address.city}, {address.postal_code}
                        </p>
                        {address.delivery_instructions && (
                          <p className="text-xs text-muted-foreground">
                            📝 {address.delivery_instructions}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!address.is_default && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefault(address.id)}
                          className="text-primary"
                        >
                          Сделать основным
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAddress(address)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Addresses;