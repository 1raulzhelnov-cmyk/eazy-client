import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Restaurant {
  id: string;
  business_name: string;
  business_type: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  rating: number;
  delivery_radius: number;
  registration_status: string;
  is_active: boolean;
  is_open: boolean;
  admin_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const useRestaurant = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRestaurant = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('get_restaurant_by_user', { user_uuid: user.id });

      if (error) throw error;

      if (data && data.length > 0) {
        setRestaurant(data[0]);
      } else {
        setRestaurant(null);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching restaurant:', err);
      setError('Ошибка загрузки данных ресторана');
      setRestaurant(null);
    } finally {
      setLoading(false);
    }
  };

  const updateRestaurant = async (updates: Partial<Restaurant>) => {
    if (!restaurant?.id) return;

    try {
      const { error } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', restaurant.id);

      if (error) throw error;

      setRestaurant(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "Ресторан обновлен",
        description: "Изменения успешно сохранены"
      });

    } catch (err) {
      console.error('Error updating restaurant:', err);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить ресторан",
        variant: "destructive"
      });
      throw err;
    }
  };

  const createRestaurant = async (restaurantData: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('restaurants')
        .insert({
          ...restaurantData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setRestaurant(data);
      
      toast({
        title: "Ресторан создан",
        description: "Ваш ресторан успешно зарегистрирован"
      });

      return data;
    } catch (err) {
      console.error('Error creating restaurant:', err);
      toast({
        title: "Ошибка",
        description: "Не удалось создать ресторан",
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchRestaurant();
  }, [user?.id]);

  return {
    restaurant,
    loading,
    error,
    updateRestaurant,
    createRestaurant,
    refreshRestaurant: fetchRestaurant
  };
};