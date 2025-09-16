import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import SupportChat from "@/components/SupportChat";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, MessageCircle, Phone, Mail, Clock, HelpCircle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Support = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const faqData = [
    {
      id: "delivery-time",
      question: "Сколько времени занимает доставка?",
      answer: "Обычно доставка занимает 30-45 минут, в зависимости от загруженности ресторана и вашего местоположения. В пиковые часы (18:00-21:00) время может увеличиться до 60 минут.",
      category: "delivery"
    },
    {
      id: "payment-methods",
      question: "Какие способы оплаты вы принимаете?",
      answer: "Мы принимаем оплату банковскими картами (Visa, MasterCard), наличными при получении заказа, а также через мобильные платежи (Apple Pay, Google Pay).",
      category: "payment"
    },
    {
      id: "min-order",
      question: "Есть ли минимальная сумма заказа?",
      answer: "Минимальная сумма заказа составляет 10€. Доставка бесплатная при заказе от 25€, иначе стоимость доставки 2,90€.",
      category: "order"
    },
    {
      id: "cancel-order",
      question: "Могу ли я отменить заказ?",
      answer: "Заказ можно отменить в течение 5 минут после оформления. После подтверждения рестораном отмена возможна только в исключительных случаях.",
      category: "order"
    },
    {
      id: "change-address",
      question: "Как изменить адрес доставки?",
      answer: "Адрес можно изменить в профиле или при оформлении заказа. Если заказ уже принят к исполнению, свяжитесь с поддержкой для изменения адреса.",
      category: "delivery"
    },
    {
      id: "allergies",
      question: "Как указать информацию об аллергиях?",
      answer: "При оформлении заказа есть поле 'Комментарий к заказу', где можно указать информацию об аллергиях. Также можно связаться напрямую с рестораном.",
      category: "order"
    },
    {
      id: "promo-codes",
      question: "Как использовать промокод?",
      answer: "Промокод вводится на странице оформления заказа в специальном поле. Убедитесь, что промокод действующий и подходит для выбранного ресторана.",
      category: "payment"
    },
    {
      id: "refund",
      question: "Как получить возврат средств?",
      answer: "Возврат средств производится в случае отмены заказа рестораном или при проблемах с качеством. Деньги возвращаются на карту в течение 3-5 рабочих дней.",
      category: "payment"
    }
  ];

  const categories = [
    { id: "all", name: "Все вопросы", color: "bg-gray-100 text-gray-800" },
    { id: "delivery", name: "Доставка", color: "bg-blue-100 text-blue-800" },
    { id: "payment", name: "Оплата", color: "bg-green-100 text-green-800" },
    { id: "order", name: "Заказы", color: "bg-purple-100 text-purple-800" }
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredFAQ = faqData.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would send the message to support system
    toast({
      title: "Сообщение отправлено",
      description: "Мы получили ваше обращение и ответим в течение 24 часов",
    });
    
    // Reset form
    setContactForm({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            На главную
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Центр поддержки</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Мы здесь, чтобы помочь вам с любыми вопросами
            </p>
            
            {/* Contact Methods */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card className="p-6 text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Онлайн чат</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Быстрые ответы в реальном времени
                </p>
                <SupportChat />
              </Card>
              
              <Card className="p-6 text-center">
                <Phone className="w-8 h-8 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Телефон</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  +372 5555-1234
                </p>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Пн-Вс 8:00-23:00</span>
                </div>
              </Card>
              
              <Card className="p-6 text-center">
                <Mail className="w-8 h-8 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  support@eazy.ee
                </p>
                <p className="text-xs text-muted-foreground">
                  Ответим в течение 24 часов
                </p>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <Card className="p-8 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Часто задаваемые вопросы</h2>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Поиск по вопросам..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "secondary"}
                  className={`cursor-pointer ${
                    selectedCategory === category.id 
                      ? "bg-primary text-primary-foreground" 
                      : category.color
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>

            {/* FAQ Accordion */}
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQ.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {filteredFAQ.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Вопросы по запросу "{searchQuery}" не найдены
                </p>
              </div>
            )}
          </Card>

          {/* Contact Form */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">Связаться с нами</h2>
            
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ваше имя *</Label>
                  <Input
                    id="name"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Тема обращения *</Label>
                <Input
                  id="subject"
                  required
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Сообщение *</Label>
                <Textarea
                  id="message"
                  rows={6}
                  required
                  placeholder="Опишите вашу проблему или вопрос подробно..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:shadow-glow"
              >
                Отправить сообщение
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;