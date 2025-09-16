import { useState, useEffect, useRef } from 'react';
import { Search, Mic, MicOff, Sparkles, Clock, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface SmartSearchProps {
  onSearch: (query: string, suggestions?: SearchSuggestion[]) => void;
  placeholder?: string;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'cuisine' | 'dish' | 'restaurant' | 'trending';
  icon?: string;
  confidence?: number;
}

// Типы для Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

export const SmartSearch = ({ onSearch, placeholder = "Что будем заказывать?" }: SmartSearchProps) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingQueries] = useState<SearchSuggestion[]>([
    { id: '1', text: 'Пицца Маргарита', type: 'dish', icon: '🍕' },
    { id: '2', text: 'Суши сет', type: 'dish', icon: '🍣' },
    { id: '3', text: 'Бургер с картошкой', type: 'dish', icon: '🍔' },
    { id: '4', text: 'Азиатская кухня', type: 'cuisine', icon: '🥢' },
    { id: '5', text: 'Быстрая доставка', type: 'trending', icon: '⚡' }
  ]);
  
  const recognition = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Инициализация Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'ru-RU';

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSearch(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Ошибка распознавания",
          description: "Попробуйте еще раз",
          variant: "destructive"
        });
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }

    // Загружаем недавние поиски из localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // AI-подсказки на основе введенного текста
  useEffect(() => {
    if (query.length > 1) {
      generateAISuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const generateAISuggestions = async (searchQuery: string) => {
    // Имитация AI-подсказок (в реальном проекте здесь был бы вызов API)
    const mockSuggestions: SearchSuggestion[] = [];
    
    const lowerQuery = searchQuery.toLowerCase();
    
    // Поиск по блюдам
    const dishes = [
      { name: 'Пицца Пепперони', cuisine: 'Итальянская', icon: '🍕' },
      { name: 'Суши Филадельфия', cuisine: 'Японская', icon: '🍣' },
      { name: 'Борщ с сметаной', cuisine: 'Русская', icon: '🍲' },
      { name: 'Пад Тай', cuisine: 'Тайская', icon: '🍜' },
      { name: 'Цезарь с курицей', cuisine: 'Европейская', icon: '🥗' }
    ];

    dishes.forEach((dish, index) => {
      if (dish.name.toLowerCase().includes(lowerQuery) || lowerQuery.includes(dish.name.toLowerCase().split(' ')[0])) {
        mockSuggestions.push({
          id: `dish-${index}`,
          text: dish.name,
          type: 'dish',
          icon: dish.icon,
          confidence: 0.9
        });
      }
    });

    // Поиск по кухням
    const cuisines = ['Итальянская', 'Японская', 'Китайская', 'Грузинская', 'Американская'];
    cuisines.forEach((cuisine, index) => {
      if (cuisine.toLowerCase().includes(lowerQuery)) {
        mockSuggestions.push({
          id: `cuisine-${index}`,
          text: `${cuisine} кухня`,
          type: 'cuisine',
          icon: '🍽️',
          confidence: 0.8
        });
      }
    });

    // Умные предложения на основе времени
    const hour = new Date().getHours();
    if ((lowerQuery.includes('завтрак') || lowerQuery.includes('утро')) && hour < 12) {
      mockSuggestions.unshift({
        id: 'breakfast',
        text: 'Завтраки и кофе',
        type: 'trending',
        icon: '☕',
        confidence: 0.95
      });
    }
    
    if ((lowerQuery.includes('обед') || lowerQuery.includes('день')) && hour >= 12 && hour < 17) {
      mockSuggestions.unshift({
        id: 'lunch',
        text: 'Обеденные сеты',
        type: 'trending',
        icon: '🍽️',
        confidence: 0.95
      });
    }

    setSuggestions(mockSuggestions.slice(0, 8));
  };

  const startVoiceSearch = () => {
    if (recognition.current && !isListening) {
      setIsListening(true);
      recognition.current.start();
      toast({
        title: "Слушаю...",
        description: "Скажите, что хотите найти"
      });
    }
  };

  const stopVoiceSearch = () => {
    if (recognition.current && isListening) {
      recognition.current.stop();
      setIsListening(false);
    }
  };

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      // Добавляем в недавние поиски
      const newRecentSearches = [
        searchQuery,
        ...recentSearches.filter(s => s !== searchQuery)
      ].slice(0, 5);
      
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
      
      // Выполняем поиск
      onSearch(searchQuery, suggestions);
      setSuggestions([]);
    }
  };

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
    inputRef.current?.focus();
  };

  const hasRecentOrTrending = recentSearches.length > 0 || trendingQueries.length > 0;
  const showSuggestions = query.length > 0 ? suggestions.length > 0 : hasRecentOrTrending;

  return (
    <div className="relative w-full max-w-2xl">
      {/* Поисковая строка */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={placeholder}
          className="pl-10 pr-12 h-12 text-lg bg-background/80 backdrop-blur-sm border-2 focus:border-primary"
        />
        
        {/* Кнопка голосового поиска */}
        {recognition.current && (
          <Button
            variant="ghost"
            size="sm"
            className={`absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 ${
              isListening ? 'text-destructive animate-pulse' : 'text-muted-foreground'
            }`}
            onClick={isListening ? stopVoiceSearch : startVoiceSearch}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {/* Подсказки и результаты */}
      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-2 p-4 shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* AI подсказки */}
          {suggestions.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-muted-foreground">Умные предложения</span>
              </div>
              <div className="space-y-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => selectSuggestion(suggestion)}
                    className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <span className="text-lg">{suggestion.icon}</span>
                    <span className="flex-1">{suggestion.text}</span>
                    {suggestion.confidence && suggestion.confidence > 0.9 && (
                      <Badge variant="secondary" className="text-xs">Точное совпадение</Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Недавние поиски */}
          {query.length === 0 && recentSearches.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-muted-foreground">Недавние поиски</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => {
                      setQuery(search);
                      handleSearch(search);
                    }}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Популярные запросы */}
          {query.length === 0 && trendingQueries.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-muted-foreground">Популярное сейчас</span>
              </div>
              <div className="space-y-2">
                {trendingQueries.map((trend) => (
                  <button
                    key={trend.id}
                    onClick={() => selectSuggestion(trend)}
                    className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <span className="text-lg">{trend.icon}</span>
                    <span className="flex-1">{trend.text}</span>
                    <Badge variant="secondary" className="text-xs">Популярно</Badge>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default SmartSearch;