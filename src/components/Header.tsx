import { Search, MapPin, User, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CartSheet from "@/components/CartSheet";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const navItems = [
    { path: "/restaurants", label: "Рестораны", icon: "🍽️" },
    { path: "/flowers", label: "Цветы", icon: "🌸" },
    { path: "/balloons", label: "Шары", icon: "🎈" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const userInitials = profile ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() : '';

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">💕</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Eazy
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-muted ${
                  location.pathname === item.path 
                    ? "bg-primary text-primary-foreground" 
                    : "text-foreground hover:text-primary"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Location */}
          <div className="hidden lg:flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Доставка в Нарву</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Найти рестораны, цветы, шары..."
              className="pl-10 bg-muted/50"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} alt="Profile" />
                      <AvatarFallback className="bg-gradient-primary text-white text-sm">
                        {userInitials || <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background border shadow-lg z-50">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {profile && (
                        <p className="font-medium">
                          {profile.first_name} {profile.last_name}
                        </p>
                      )}
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">Профиль</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="cursor-pointer">Мои заказы</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/favorites" className="cursor-pointer">Избранное</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/addresses" className="cursor-pointer">Адреса</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="icon">
                  <LogIn className="w-5 h-5" />
                </Button>
              </Link>
            )}
            <CartSheet />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;