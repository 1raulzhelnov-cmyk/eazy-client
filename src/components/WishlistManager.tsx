import { useState, useEffect } from "react";
import { Heart, Plus, Trash2, Share2, Eye, EyeOff, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Wishlist {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  items?: WishlistItem[];
}

interface WishlistItem {
  id: string;
  item_id: string;
  item_type: string;
  item_data: any;
  priority: number;
  notes: string | null;
  added_at: string;
}

const WishlistManager = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWishlist, setNewWishlist] = useState({
    name: '',
    description: '',
    is_public: false
  });

  // Fetch wishlists
  const fetchWishlists = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: wishlistsData, error: wishlistsError } = await supabase
        .from('wishlists')
        .select('*')
        .order('updated_at', { ascending: false });

      if (wishlistsError) throw wishlistsError;

      // Fetch items for each wishlist
      const wishlistsWithItems = await Promise.all(
        (wishlistsData || []).map(async (wishlist) => {
          const { data: items, error: itemsError } = await supabase
            .from('wishlist_items')
            .select('*')
            .eq('wishlist_id', wishlist.id)
            .order('added_at', { ascending: false });

          if (itemsError) {
            console.error('Error fetching wishlist items:', itemsError);
            return { ...wishlist, items: [] };
          }

          return { ...wishlist, items: items || [] };
        })
      );

      setWishlists(wishlistsWithItems);
      
      // Set default wishlist if none selected
      if (!selectedWishlist && wishlistsWithItems.length > 0) {
        setSelectedWishlist(wishlistsWithItems[0]);
      }
    } catch (error) {
      console.error('Error fetching wishlists:', error);
      toast.error('Ошибка загрузки списков желаний');
    } finally {
      setLoading(false);
    }
  };

  // Create wishlist
  const createWishlist = async () => {
    if (!user || !newWishlist.name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('wishlists')
        .insert({
          name: newWishlist.name.trim(),
          description: newWishlist.description.trim() || null,
          is_public: newWishlist.is_public,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newWishlistWithItems = { ...data, items: [] };
      setWishlists(prev => [newWishlistWithItems, ...prev]);
      setSelectedWishlist(newWishlistWithItems);
      setShowCreateDialog(false);
      setNewWishlist({ name: '', description: '', is_public: false });
      toast.success('Список желаний создан');
    } catch (error) {
      console.error('Error creating wishlist:', error);
      toast.error('Ошибка создания списка желаний');
    }
  };

  // Delete wishlist
  const deleteWishlist = async (wishlistId: string) => {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', wishlistId);

      if (error) throw error;

      setWishlists(prev => prev.filter(w => w.id !== wishlistId));
      
      if (selectedWishlist?.id === wishlistId) {
        const remaining = wishlists.filter(w => w.id !== wishlistId);
        setSelectedWishlist(remaining.length > 0 ? remaining[0] : null);
      }

      toast.success('Список желаний удален');
    } catch (error) {
      console.error('Error deleting wishlist:', error);
      toast.error('Ошибка удаления списка желаний');
    }
  };

  // Remove item from wishlist
  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setWishlists(prev => 
        prev.map(wishlist => ({
          ...wishlist,
          items: wishlist.items?.filter(item => item.id !== itemId) || []
        }))
      );

      if (selectedWishlist) {
        setSelectedWishlist(prev => ({
          ...prev!,
          items: prev!.items?.filter(item => item.id !== itemId) || []
        }));
      }

      toast.success('Товар удален из списка желаний');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Ошибка удаления товара');
    }
  };

  // Load wishlists when opened
  useEffect(() => {
    if (isOpen && user) {
      fetchWishlists();
    }
  }, [isOpen, user]);

  // Get item display info
  const getItemDisplay = (item: WishlistItem) => {
    const data = item.item_data;
    switch (item.item_type) {
      case 'restaurant':
        return {
          name: data.name || 'Ресторан',
          image: data.image,
          subtitle: data.cuisine || '',
          icon: '🍽️'
        };
      case 'flower':
        return {
          name: data.name || 'Цветок',
          image: data.image,
          subtitle: `${data.price || 0}€`,
          icon: '🌸'
        };
      case 'balloon':
        return {
          name: data.name || 'Шар',
          image: data.image,
          subtitle: `${data.price || 0}€`,
          icon: '🎈'
        };
      default:
        return {
          name: 'Товар',
          image: null,
          subtitle: '',
          icon: '❤️'
        };
    }
  };

  const totalItems = wishlists.reduce((sum, w) => sum + (w.items?.length || 0), 0);

  if (!user) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Heart className="w-5 h-5" />
          {totalItems > 0 && (
            <Badge 
              variant="secondary" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-0"
            >
              {totalItems > 9 ? '9+' : totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Списки желаний
              {totalItems > 0 && (
                <Badge variant="secondary">
                  {totalItems}
                </Badge>
              )}
            </SheetTitle>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Создать
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Создать список желаний</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Название</Label>
                    <Input
                      id="name"
                      value={newWishlist.name}
                      onChange={(e) => setNewWishlist(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Мой список желаний"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      value={newWishlist.description}
                      onChange={(e) => setNewWishlist(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Описание списка (необязательно)"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="public"
                      checked={newWishlist.is_public}
                      onCheckedChange={(checked) => setNewWishlist(prev => ({ ...prev, is_public: checked }))}
                    />
                    <Label htmlFor="public">Публичный список</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Отмена
                    </Button>
                    <Button onClick={createWishlist} disabled={!newWishlist.name.trim()}>
                      Создать
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </SheetHeader>

        <Separator />

        {/* Wishlist Tabs */}
        {wishlists.length > 1 && (
          <div className="p-4 pb-0">
            <ScrollArea>
              <div className="flex gap-2">
                {wishlists.map((wishlist) => (
                  <Button
                    key={wishlist.id}
                    variant={selectedWishlist?.id === wishlist.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedWishlist(wishlist)}
                    className="flex-shrink-0"
                  >
                    <span className="truncate max-w-20">{wishlist.name}</span>
                    {wishlist.items && wishlist.items.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {wishlist.items.length}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Wishlist Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="p-4 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 bg-muted rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : wishlists.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Нет списков желаний</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Создайте свой первый список желаний
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Создать список
                </Button>
              </div>
            ) : selectedWishlist ? (
              <>
                {/* Wishlist Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{selectedWishlist.name}</h3>
                    <div className="flex items-center gap-2">
                      {selectedWishlist.is_public ? (
                        <Badge variant="secondary" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          Публичный
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Приватный
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteWishlist(selectedWishlist.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {selectedWishlist.description && (
                    <p className="text-sm text-muted-foreground">
                      {selectedWishlist.description}
                    </p>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {selectedWishlist.items?.length || 0} товаров
                  </div>
                </div>

                <Separator />

                {/* Wishlist Items */}
                {!selectedWishlist.items || selectedWishlist.items.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h4 className="font-medium mb-2">Список пуст</h4>
                    <p className="text-sm text-muted-foreground">
                      Добавляйте товары в избранное, чтобы они появились здесь
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedWishlist.items.map((item) => {
                      const display = getItemDisplay(item);
                      return (
                        <Card key={item.id} className="p-4">
                          <div className="flex gap-3">
                            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-2xl flex-shrink-0">
                              {display.image ? (
                                <img 
                                  src={display.image} 
                                  alt={display.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                display.icon
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-medium text-sm leading-5 truncate">
                                    {display.name}
                                  </h4>
                                  {display.subtitle && (
                                    <p className="text-sm text-muted-foreground">
                                      {display.subtitle}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(item.id)}
                                  className="flex-shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              {item.notes && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {item.notes}
                                </p>
                              )}
                              <div className="flex items-center justify-between mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {item.item_type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(item.added_at).toLocaleDateString('ru-RU')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default WishlistManager;