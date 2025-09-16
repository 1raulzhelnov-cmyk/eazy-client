import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Lock, User, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import PasswordStrengthIndicator from "@/components/PasswordStrengthIndicator";
import GoogleSignInButton from "@/components/GoogleSignInButton";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, loading } = useAuth();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  // Redirect after successful auth
  const redirectTo = location.state?.from?.pathname || '/';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      toast({
        title: "Ошибка валидации",
        description: "Пожалуйста, заполните email и пароль",
        variant: "destructive",
      });
      return false;
    }

    if (isSignUp && (!formData.firstName.trim() || !formData.lastName.trim())) {
      toast({
        title: "Ошибка валидации", 
        description: "Пожалуйста, заполните имя и фамилию",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Слабый пароль",
        description: "Пароль должен содержать минимум 6 символов",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      let result;
      
      if (isSignUp) {
        result = await signUp(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName
        );
        
        if (!result.error) {
          toast({
            title: "Регистрация успешна!",
            description: "Проверьте почту для подтверждения аккаунта",
          });
          navigate(redirectTo);
          return;
        }
      } else {
        result = await signIn(formData.email, formData.password);
        
        if (!result.error) {
          toast({
            title: "Добро пожаловать!",
            description: "Вы успешно вошли в аккаунт",
          });
          navigate(redirectTo);
          return;
        }
      }

      // Handle errors
      if (result.error) {
        let errorMessage = "Произошла ошибка";
        
        if (result.error.message?.includes('Invalid login credentials')) {
          errorMessage = "Неверный email или пароль";
        } else if (result.error.message?.includes('User already registered')) {
          errorMessage = "Пользователь с таким email уже существует";
        } else if (result.error.message?.includes('Password should be at least 6 characters')) {
          errorMessage = "Пароль должен содержать минимум 6 символов";
        } else if (result.error.message) {
          errorMessage = result.error.message;
        }
        
        toast({
          title: isSignUp ? "Ошибка регистрации" : "Ошибка входа",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла непредвиденная ошибка",
        variant: "destructive",
      });
    }
  };

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
        <div className="max-w-md mx-auto">
          <Card className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">
                {isSignUp ? "Регистрация" : "Вход в аккаунт"}
              </h1>
              <p className="text-muted-foreground">
                {isSignUp 
                  ? "Создайте аккаунт для заказа еды и цветов" 
                  : "Войдите в свой аккаунт"
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Имя *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="Введите имя"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="lastName">Фамилия *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Введите фамилию"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Телефон</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+372 123 4567"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@email.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Пароль *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Введите пароль"
                    className="pl-10"
                    required
                  />
                </div>
                {isSignUp && (
                  <PasswordStrengthIndicator password={formData.password} />
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:shadow-glow"
                disabled={loading}
              >
                {loading ? (
                  "Обработка..."
                ) : (
                  isSignUp ? "Зарегистрироваться" : "Войти"
                )}
              </Button>
            </form>

            <Separator className="my-6" />

            {/* Google Sign In */}
            <GoogleSignInButton />

            <Separator className="my-6" />

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary hover:text-primary-foreground"
              >
                {isSignUp 
                  ? "Уже есть аккаунт? Войти" 
                  : "Нет аккаунта? Зарегистрироваться"
                }
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;