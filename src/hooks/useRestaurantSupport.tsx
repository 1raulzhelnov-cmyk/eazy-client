import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  description: string;
  createdAt: string;
  updatedAt: string;
  lastResponse?: string;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  views: number;
}

export const useRestaurantSupport = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Mock data for demo
      const mockTickets: SupportTicket[] = [
        {
          id: 'TICK-001',
          subject: 'Проблема с обновлением меню',
          category: 'technical',
          priority: 'medium',
          status: 'in_progress',
          description: 'Не могу обновить цены на блюда в меню. Кнопка сохранения не работает.',
          createdAt: '2024-09-15T10:30:00Z',
          updatedAt: '2024-09-15T14:20:00Z',
          lastResponse: 'Мы изучаем проблему. Попробуйте очистить кеш браузера.'
        },
        {
          id: 'TICK-002',
          subject: 'Настройка уведомлений',
          category: 'account',
          priority: 'low',
          status: 'resolved',
          description: 'Хочу настроить уведомления о новых заказах на email.',
          createdAt: '2024-09-14T16:45:00Z',
          updatedAt: '2024-09-14T18:30:00Z',
          lastResponse: 'Настройки уведомлений обновлены согласно вашему запросу.'
        }
      ];

      const mockKnowledgeBase: KnowledgeBaseArticle[] = [
        {
          id: 'KB-001',
          title: 'Как добавить новое блюдо в меню',
          category: 'Управление меню',
          excerpt: 'Пошаговое руководство по добавлению блюд в ваше меню.',
          content: 'Подробная инструкция...',
          views: 245
        },
        {
          id: 'KB-002',
          title: 'Настройка платежной системы',
          category: 'Платежи',
          excerpt: 'Как подключить и настроить Stripe для приема платежей.',
          content: 'Инструкция по настройке...',
          views: 189
        },
        {
          id: 'KB-003',
          title: 'Управление заказами',
          category: 'Заказы',
          excerpt: 'Как обрабатывать входящие заказы и изменять их статус.',
          content: 'Руководство по заказам...',
          views: 156
        },
        {
          id: 'KB-004',
          title: 'Аналитика и отчеты',
          category: 'Аналитика',
          excerpt: 'Как анализировать данные о продажах и клиентах.',
          content: 'Инструкция по аналитике...',
          views: 98
        }
      ];

      setTickets(mockTickets);
      setKnowledgeBase(mockKnowledgeBase);

    } catch (error) {
      console.error('Error fetching support data:', error);
      setError(error instanceof Error ? error.message : 'Ошибка загрузки данных поддержки');
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticketData: Omit<SupportTicket, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      
      const newTicket: SupportTicket = {
        ...ticketData,
        id: `TICK-${String(tickets.length + 1).padStart(3, '0')}`,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setTickets(prev => [newTicket, ...prev]);

      // In real app, this would create ticket in database
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      setError('Ошибка создания обращения');
    }
  };

  const updateTicket = async (ticketId: string, updates: Partial<SupportTicket>) => {
    try {
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, ...updates, updatedAt: new Date().toISOString() }
          : ticket
      ));
    } catch (error) {
      console.error('Error updating ticket:', error);
      setError('Ошибка обновления обращения');
    }
  };

  const refreshTickets = () => {
    fetchTickets();
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  return {
    tickets,
    knowledgeBase,
    loading,
    error,
    createTicket,
    updateTicket,
    refreshTickets,
  };
};