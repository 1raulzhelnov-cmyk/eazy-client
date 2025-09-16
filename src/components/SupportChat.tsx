import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, MessageCircle, X, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  supportAgent?: string;
}

interface QuickAction {
  id: string;
  text: string;
  action: string;
}

const SupportChat = () => {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    { id: "order-status", text: "Где мой заказ?", action: "Проверяю статус вашего заказа..." },
    { id: "payment-issue", text: "Проблема с оплатой", action: "Помогу решить вопрос с оплатой" },
    { id: "change-order", text: "Изменить заказ", action: "Какие изменения нужно внести?" },
    { id: "refund", text: "Вернуть деньги", action: "Рассмотрю возможность возврата" }
  ];

  const autoResponses: Record<string, string> = {
    "привет": "Здравствуйте! Как дела? Чем могу помочь?",
    "проблема": "Расскажите подробнее о проблеме, я обязательно помогу!",
    "заказ": "Давайте проверим статус вашего заказа. Назовите номер заказа.",
    "доставка": "Обычно доставка занимает 30-45 минут. Если есть задержка, сообщите номер заказа.",
    "оплата": "По вопросам оплаты обращайтесь к нам, мы поможем разобраться.",
    "спасибо": "Всегда рады помочь! Обращайтесь если возникнут вопросы.",
    "default": "Спасибо за обращение! Наш специалист ответит вам в течение 5 минут."
  };

  // Initialize chat with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        text: user 
          ? `Здравствуйте, ${profile?.first_name || 'дорогой клиент'}! Я помогу решить любые вопросы. О чем хотите узнать?`
          : "Здравствуйте! Я помогу решить любые вопросы. Для лучшего обслуживания рекомендую войти в аккаунт.",
        sender: 'support',
        timestamp: new Date(),
        supportAgent: 'Анна'
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, user, profile]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    
    // Simulate typing indicator
    setIsTyping(true);
    
    // Auto-respond after delay
    setTimeout(() => {
      const response = getAutoResponse(text.toLowerCase());
      const supportMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'support',
        timestamp: new Date(),
        supportAgent: 'Анна'
      };
      
      setMessages(prev => [...prev, supportMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // Random delay 1.5-2.5s
  };

  const getAutoResponse = (userInput: string): string => {
    for (const [key, response] of Object.entries(autoResponses)) {
      if (key !== 'default' && userInput.includes(key)) {
        return response;
      }
    }
    return autoResponses.default;
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(newMessage);
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-gradient-primary hover:shadow-glow z-40 md:relative md:bottom-auto md:right-auto md:w-auto md:h-auto md:rounded-lg"
        >
          <MessageCircle className="w-5 h-5 md:mr-2" />
          <span className="hidden md:inline">Поддержка</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[450px] h-[600px] p-0 flex flex-col">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg">Служба поддержки</DialogTitle>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="text-xs text-muted-foreground">
                    {isOnline ? 'Онлайн' : 'Оффлайн'} • Обычно отвечаем за 2 мин
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Contact Info */}
        <div className="px-4 py-2 bg-muted/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>+372 5555-1234</span>
            </div>
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span>support@eazy.ee</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div className={`space-y-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {message.supportAgent && <span>{message.supportAgent}</span>}
                      <span>{formatTime(message.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="px-4">
            <p className="text-xs text-muted-foreground mb-2">Быстрые действия:</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-2 px-3"
                  onClick={() => handleQuickAction(action)}
                >
                  {action.text}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Напишите сообщение..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={() => sendMessage(newMessage)}
              disabled={!newMessage.trim() || isTyping}
              size="sm"
              className="bg-gradient-primary hover:shadow-glow"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Нажмите Enter для отправки сообщения
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportChat;