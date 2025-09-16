import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RestaurantReview {
  id: string;
  customerName: string;
  rating: number;
  text: string;
  photos?: string[];
  createdAt: string;
  orderNumber: string;
  response?: string;
  responseDate?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  thisMonthReviews: number;
  growthRate: number;
  responseRate: number;
  positiveReviews: number;
}

export const useRestaurantReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<RestaurantReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
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

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .rpc('get_restaurant_reviews', { restaurant_id_param: restaurant.id });

      // Mock additional data for demo
      const mockReviews: RestaurantReview[] = [
        {
          id: '1',
          customerName: 'Анна К.',
          rating: 5,
          text: 'Отличная еда и обслуживание! Особенно понравилась пицца. Обязательно вернемся.',
          photos: [],
          createdAt: '2024-09-15T18:30:00Z',
          orderNumber: 'ORD-12345',
          response: 'Спасибо за отзыв! Рады, что вам понравилось.',
          responseDate: '2024-09-15T20:00:00Z'
        },
        {
          id: '2',
          customerName: 'Петр М.',
          rating: 4,
          text: 'Хорошая кухня, но немного долго ждали заказ. В остальном все отлично!',
          createdAt: '2024-09-14T19:15:00Z',
          orderNumber: 'ORD-12344'
        },
        {
          id: '3',
          customerName: 'Елена В.',
          rating: 3,
          text: 'Еда нормальная, но ожидал большего за такую цену.',
          createdAt: '2024-09-13T20:45:00Z',
          orderNumber: 'ORD-12343'
        }
      ];

      setReviews(mockReviews);

      // Calculate stats
      const averageRating = mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length;
      const thisMonth = new Date().getMonth();
      const thisMonthReviews = mockReviews.filter(review => 
        new Date(review.createdAt).getMonth() === thisMonth
      ).length;
      const reviewsWithResponse = mockReviews.filter(review => review.response).length;
      const positiveReviews = mockReviews.filter(review => review.rating >= 4).length;

      setStats({
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews: mockReviews.length,
        thisMonthReviews,
        growthRate: 15.5,
        responseRate: Math.round((reviewsWithResponse / mockReviews.length) * 100),
        positiveReviews: Math.round((positiveReviews / mockReviews.length) * 100)
      });

    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError(error instanceof Error ? error.message : 'Ошибка загрузки отзывов');
    } finally {
      setLoading(false);
    }
  };

  const respondToReview = async (reviewId: string, response: string) => {
    try {
      setError(null);
      
      // Update review with response
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, response, responseDate: new Date().toISOString() }
          : review
      ));

      // In real app, this would update the database
      
    } catch (error) {
      console.error('Error responding to review:', error);
      setError('Ошибка отправки ответа');
    }
  };

  const refreshReviews = () => {
    fetchReviews();
  };

  useEffect(() => {
    fetchReviews();
  }, [user]);

  return {
    reviews,
    stats,
    loading,
    error,
    respondToReview,
    refreshReviews,
  };
};