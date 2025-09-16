import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'discount' | 'freeItem' | 'buyOneGetOne';
  value: number;
  code: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  minOrderAmount: number;
  applicableItems: string[];
  created_at: string;
}

export interface PromoStats {
  totalPromotions: number;
  activePromotions: number;
  totalUsage: number;
  totalSavings: number;
  conversionRate: number;
}

export const usePromotionTools = () => {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [stats, setStats] = useState<PromoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get restaurant ID
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!restaurant) return;

      // Mock data for promotions - in real app this would come from database
      const mockPromotions: Promotion[] = [
        {
          id: '1',
          name: 'Скидка новичкам',
          description: '15% скидка на первый заказ',
          type: 'discount',
          value: 15,
          code: 'NEWBIE15',
          isActive: true,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          usageLimit: 1000,
          usedCount: 127,
          minOrderAmount: 20,
          applicableItems: [],
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Бесплатная доставка',
          description: 'Бесплатная доставка при заказе от 25€',
          type: 'freeItem',
          value: 0,
          code: 'FREEDEL25',
          isActive: true,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          usageLimit: 500,
          usedCount: 89,
          minOrderAmount: 25,
          applicableItems: ['delivery'],
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      setPromotions(mockPromotions);

      // Calculate stats
      const totalUsage = mockPromotions.reduce((sum, promo) => sum + promo.usedCount, 0);
      const totalSavings = mockPromotions.reduce((sum, promo) => 
        sum + (promo.usedCount * promo.value * 0.01 * 15), 0); // Estimated savings

      setStats({
        totalPromotions: mockPromotions.length,
        activePromotions: mockPromotions.filter(p => p.isActive).length,
        totalUsage,
        totalSavings,
        conversionRate: 12.5, // Mock conversion rate
      });

    } catch (error) {
      console.error('Error fetching promotions:', error);
      setError(error instanceof Error ? error.message : 'Ошибка загрузки промокодов');
    } finally {
      setLoading(false);
    }
  };

  const createPromotion = async (promotionData: Omit<Promotion, 'id' | 'created_at' | 'usedCount'>) => {
    try {
      setError(null);
      
      // In real app, this would save to database
      const newPromotion: Promotion = {
        ...promotionData,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        usedCount: 0,
      };

      setPromotions(prev => [newPromotion, ...prev]);
    } catch (error) {
      console.error('Error creating promotion:', error);
      setError('Ошибка создания промокода');
    }
  };

  const togglePromotion = async (id: string) => {
    try {
      setPromotions(prev => prev.map(promo => 
        promo.id === id ? { ...promo, isActive: !promo.isActive } : promo
      ));
    } catch (error) {
      console.error('Error toggling promotion:', error);
      setError('Ошибка изменения статуса промокода');
    }
  };

  const deletePromotion = async (id: string) => {
    try {
      setPromotions(prev => prev.filter(promo => promo.id !== id));
    } catch (error) {
      console.error('Error deleting promotion:', error);
      setError('Ошибка удаления промокода');
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [user]);

  return {
    promotions,
    stats,
    loading,
    error,
    createPromotion,
    togglePromotion,
    deletePromotion,
    refreshPromotions: fetchPromotions,
  };
};