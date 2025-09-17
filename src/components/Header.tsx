import { Search, MapPin, User, LogIn, Bell, Heart, UtensilsCrossed, Flower2, PartyPopper } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import CartSheet from "@/components/CartSheet";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import NotificationCenter from "@/components/NotificationCenter";
import PushNotificationCenter from "@/components/PushNotificationCenter";
import WishlistManager from "@/components/WishlistManager";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { path: "/restaurants", label: t('header.nav.restaurants'), icon: UtensilsCrossed },
    { path: "/flowers", label: t('header.nav.flowers'), icon: Flower2 },
    { path: "/balloons", label: t('header.nav.balloons'), icon: PartyPopper },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSearchResults(false);
    }
  };

  const userInitials = profile ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() : '';

  // Hide search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick search suggestions
  const quickSearches = [
    t('search.pizza'), t('search.sushi'), t('search.burgers'), t('search.coffee'), t('search.salads'), t('search.desserts')
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent tracking-tight">
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
                <span className={`w-5 h-5 ${location.pathname === item.path ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"}`}>
                  <item.icon className="w-5 h-5" />
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Location */}
          <div className="hidden lg:flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{t('header.delivery.location')}</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md relative" ref={searchRef}>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={t('header.search.placeholder')}
                  className="pl-10 bg-muted/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearchResults(true)}
                />
              </div>
            </form>

            {/* Quick Search Dropdown */}
            {showSearchResults && searchQuery.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 p-2">
                <div className="text-xs text-muted-foreground mb-2 px-2">{t('search.popular')}</div>
                <div className="flex flex-wrap gap-1">
                  {quickSearches.map((term) => (
                    <Button
                      key={term}
                      variant="ghost"
                      size="sm"
                      className="h-auto py-1 px-2 text-xs"
                      onClick={() => {
                        setSearchQuery(term);
                        navigate(`/restaurants?search=${encodeURIComponent(term)}`);
                        setShowSearchResults(false);
                      }}
                    >
                      {term}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {user && <NotificationCenter />}
            {user && <PushNotificationCenter />}
            {user && <WishlistManager />}
            
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
                    <Link to="/profile" className="cursor-pointer">{t('header.profile.profile')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="cursor-pointer">{t('header.profile.orders')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/favorites" className="cursor-pointer">{t('header.profile.favorites')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/addresses" className="cursor-pointer">{t('header.profile.addresses')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/support" className="cursor-pointer">{t('header.profile.support')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/driver" className="cursor-pointer">{t('header.profile.driver')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer">{t('header.profile.admin')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                    {t('header.profile.logout')}
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