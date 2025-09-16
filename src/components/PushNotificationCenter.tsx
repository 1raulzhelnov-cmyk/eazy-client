import { useState, useEffect } from "react";
import { Bell, X, Check, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PushNotification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  data: any;
  read_at: string | null;
  sent_at: string;
  created_at: string;
}

const PushNotificationCenter = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    orderUpdates: true,
    promotions: false,
    marketing: false,
    driverUpdates: true
  });

  const unreadCount = notifications.filter(n => !n.read_at).length;

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('push_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Ошибка загрузки уведомлений');
    } finally {
      setLoading(false);
    }
  };

  // Load notifications when opened
  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  // Mark as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('push_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id);
      
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('push_notifications')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadIds);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );

      toast.success('Все уведомления отмечены как прочитанные');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Ошибка при отметке уведомлений');
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return '📦';
      case 'delivery': return '🚚';
      case 'promotion': return '🎉';
      case 'system': return '⚙️';
      default: return '📢';
    }
  };

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order': return 'bg-blue-500/10 text-blue-600';
      case 'delivery': return 'bg-green-500/10 text-green-600';
      case 'promotion': return 'bg-purple-500/10 text-purple-600';
      case 'system': return 'bg-gray-500/10 text-gray-600';
      default: return 'bg-primary/10 text-primary';
    }
  };

  // Format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'только что';
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ч назад`;
    return date.toLocaleDateString('ru-RU');
  };

  if (!user) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-0"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Уведомления
                {unreadCount > 0 && (
                  <Badge variant="secondary">
                    {unreadCount}
                  </Badge>
                )}
              </SheetTitle>
            </div>
            {notifications.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Все прочитано
                </Button>
              </div>
            )}
          </div>
        </SheetHeader>

        <Separator />

        {/* Settings */}
        <div className="p-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Settings className="w-4 h-4" />
              Настройки уведомлений
            </div>
          </div>
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="order-updates" className="text-sm">О заказах</Label>
              <Switch
                id="order-updates"
                checked={settings.orderUpdates}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, orderUpdates: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="driver-updates" className="text-sm">О доставке</Label>
              <Switch
                id="driver-updates"
                checked={settings.driverUpdates}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, driverUpdates: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="promotions" className="text-sm">Акции</Label>
              <Switch
                id="promotions"
                checked={settings.promotions}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, promotions: checked }))
                }
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Notifications List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="p-4 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Пока нет уведомлений</h3>
                <p className="text-muted-foreground text-sm">
                  Здесь будут отображаться важные уведомления о ваших заказах
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Card 
                  key={notification.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    !notification.read_at ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                  }`}
                  onClick={() => !notification.read_at && markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
                        {getNotificationIcon(notification.notification_type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm leading-5">
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getTypeColor(notification.notification_type)}`}
                          >
                            {notification.notification_type}
                          </Badge>
                          {!notification.read_at && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.sent_at || notification.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default PushNotificationCenter;