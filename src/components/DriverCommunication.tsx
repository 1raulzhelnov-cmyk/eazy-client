import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Phone, Send, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Chat {
  id: string;
  order_id: string | null;
  type: string;
  status: string;
  last_message_at: string | null;
  order?: {
    order_number: string;
    customer_info: any;
  };
}

interface Message {
  id: string;
  content: string;
  sender_type: string;
  created_at: string;
  message_type: string;
}

interface DriverCommunicationProps {
  demoMode?: boolean;
}

const DriverCommunication = ({ demoMode = false }: DriverCommunicationProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (demoMode) {
      // Создаем демо чаты
      const demoChats: Chat[] = [
        {
          id: 'demo-chat-1',
          order_id: 'demo-order-1',
          type: 'order',
          status: 'active',
          last_message_at: new Date().toISOString(),
          order: {
            order_number: 'ORD-DEMO-001',
            customer_info: { name: 'Мария Иванова' }
          }
        },
        {
          id: 'demo-chat-support',
          order_id: null,
          type: 'support',
          status: 'active',
          last_message_at: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      setChats(demoChats);
      setLoading(false);
    } else if (user) {
      fetchActiveChats();
    }
  }, [user, demoMode]);

  useEffect(() => {
    if (selectedChat && !demoMode) {
      fetchMessages(selectedChat.id);
      subscribeToMessages(selectedChat.id);
    } else if (selectedChat && demoMode) {
      // Создаем демо сообщения
      const demoMessages: Message[] = [
        {
          id: 'demo-msg-1',
          content: 'Здравствуйте! Я ваш курьер.',
          sender_type: 'driver',
          created_at: new Date(Date.now() - 900000).toISOString(),
          message_type: 'text'
        },
        {
          id: 'demo-msg-2',
          content: 'Спасибо! Буду ждать у подъезда.',
          sender_type: 'customer',
          created_at: new Date(Date.now() - 600000).toISOString(),
          message_type: 'text'
        },
        {
          id: 'demo-msg-3',
          content: 'Уже подъезжаю, буду через 5 минут.',
          sender_type: 'driver',
          created_at: new Date(Date.now() - 300000).toISOString(),
          message_type: 'text'
        }
      ];
      setMessages(demoMessages);
    }
  }, [selectedChat, demoMode]);

  const fetchActiveChats = async () => {
    try {
      // Получаем ID курьера
      const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!driver) return;

      // Получаем активные заказы курьера
      const { data: orders } = await supabase
        .from('orders')
        .select('id, order_number, customer_info, status')
        .eq('driver_id', driver.id)
        .in('status', ['assigned', 'picked_up', 'in_delivery']);

      if (!orders) return;

      // Получаем чаты для этих заказов
      const orderIds = orders.map(o => o.id);
      const { data: chatsData, error } = await supabase
        .from('chats')
        .select('*')
        .in('order_id', orderIds);

      if (error) {
        console.error('Error fetching chats:', error);
        return;
      }

      // Объединяем данные
      const chatsWithOrders = (chatsData || []).map(chat => ({
        ...chat,
        order: orders.find(order => order.id === chat.order_id)
      }));

      setChats(chatsWithOrders);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = (chatId: string) => {
    const channel = supabase
      .channel(`messages-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    if (demoMode) {
      // В демо режиме добавляем сообщение локально
      const demoMessage: Message = {
        id: `demo-msg-${Date.now()}`,
        content: newMessage,
        sender_type: 'driver',
        created_at: new Date().toISOString(),
        message_type: 'text'
      };
      
      setMessages(prev => [...prev, demoMessage]);
      setNewMessage('');
      
      // Имитируем ответ через 2 секунды
      setTimeout(() => {
        const responseMessage: Message = {
          id: `demo-response-${Date.now()}`,
          content: 'Понял, спасибо за информацию!',
          sender_type: 'customer',
          created_at: new Date().toISOString(),
          message_type: 'text'
        };
        setMessages(prev => [...prev, responseMessage]);
      }, 2000);
      
      return;
    }

    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: selectedChat.id,
          content: newMessage,
          sender_id: user.id,
          sender_type: 'driver',
          message_type: 'text'
        });

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось отправить сообщение",
          variant: "destructive"
        });
        return;
      }

      setNewMessage('');
      toast({
        title: "Сообщение отправлено",
        description: "Ваше сообщение доставлено клиенту",
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const startSupportChat = async () => {
    try {
      // Создать чат с поддержкой
      const { data, error } = await supabase
        .from('chats')
        .insert({
          user_id: user?.id,
          type: 'support',
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось создать чат с поддержкой",
          variant: "destructive"
        });
        return;
      }

      // Отправить приветственное сообщение
      await supabase
        .from('messages')
        .insert({
          chat_id: data.id,
          content: 'Здравствуйте! Как я могу вам помочь?',
          sender_id: 'support',
          sender_type: 'support',
          message_type: 'text'
        });

      await fetchActiveChats();
      setSelectedChat(data);
    } catch (error) {
      console.error('Error starting support chat:', error);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Загрузка чатов...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
      {/* Chat List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Сообщения</span>
            <Button size="sm" onClick={startSupportChat}>
              <MessageCircle className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-80 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Нет активных чатов</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={startSupportChat}
              >
                Связаться с поддержкой
              </Button>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedChat?.id === chat.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedChat(chat)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">
                    {chat.type === 'support' ? (
                      'Поддержка'
                    ) : chat.order ? (
                      `Заказ #${chat.order.order_number}`
                    ) : (
                      'Клиент'
                    )}
                  </span>
                  <Badge variant={chat.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {chat.status === 'active' ? 'Активный' : 'Закрытый'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {chat.last_message_at ? formatTime(chat.last_message_at) : 'Нет сообщений'}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="lg:col-span-2">
        {selectedChat ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {selectedChat.type === 'support' ? (
                      'Поддержка'
                    ) : selectedChat.order ? (
                      `Заказ #${selectedChat.order.order_number}`
                    ) : (
                      'Чат с клиентом'
                    )}
                  </CardTitle>
                  {selectedChat.order && (
                    <p className="text-sm text-muted-foreground">
                      Клиент: {selectedChat.order.customer_info?.name || 'Не указано'}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex flex-col h-64">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 py-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_type === 'driver' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className="flex items-end space-x-2 max-w-xs">
                      {message.sender_type !== 'driver' && (
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">
                            {message.sender_type === 'support' ? 'S' : 'C'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`p-3 rounded-lg ${
                          message.sender_type === 'driver'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                      {message.sender_type === 'driver' && (
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">D</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="flex items-center space-x-2 pt-4 border-t">
                <Input
                  placeholder="Введите сообщение..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Выберите чат для начала общения</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default DriverCommunication;