import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import EnhancedProfile from "@/components/EnhancedProfile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, User, Mail, Phone, MapPin, Heart, ShoppingBag, LogOut, Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile, loading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
      });
    }
  }, [user, profile, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    const { error } = await updateProfile(formData);
    
    if (!error) {
      setIsEditing(false);
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить профиль",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user || !profile) {
    return null;
  }

  const userInitials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Link to="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            На главную
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Профиль</h1>

          {/* Profile Card */}
          <Card className="p-6 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={profile.avatar_url} alt="Profile" />
                  <AvatarFallback className="text-lg bg-gradient-primary text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">
                    {profile.first_name} {profile.last_name}
                  </h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                disabled={loading}
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? "Отмена" : "Редактировать"}
              </Button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">Имя</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="Введите имя"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Фамилия</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Введите фамилию"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+372 123 4567"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="bg-gradient-primary hover:shadow-glow"
                  >
                    Сохранить
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{profile.first_name} {profile.last_name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Link to="/orders">
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium">Мои заказы</h3>
                    <p className="text-sm text-muted-foreground">История заказов</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/favorites">
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">Избранное</h3>
                    <p className="text-sm text-muted-foreground">Любимые заведения</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/addresses">
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">Адреса</h3>
                    <p className="text-sm text-muted-foreground">Управление адресами</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>

          <Separator className="my-6" />

          {/* Sign Out */}
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full text-destructive hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Выйти из аккаунта
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;