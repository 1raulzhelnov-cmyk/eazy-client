import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, TrendingUp } from 'lucide-react';
import ReviewCard from '@/components/ReviewCard';
import WriteReview from '@/components/WriteReview';
import { supabase } from '@/integrations/supabase/client';

interface Review {
  id: string;
  user_id: string;
  restaurant_id: string;
  rating: number;
  review_text: string;
  photos: string[] | null;
  created_at: string;
  order_id?: string;
}

interface RestaurantReviewsProps {
  restaurantId: string;
  restaurantName: string;
  className?: string;
}

const RestaurantReviews = ({ 
  restaurantId, 
  restaurantName,
  className = "" 
}: RestaurantReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('reviews')
        .select('*')
        .eq('restaurant_id', restaurantId);

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'highest':
          query = query.order('rating', { ascending: false });
          break;
        case 'lowest':
          query = query.order('rating', { ascending: true });
          break;
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setReviews(data || []);

      // Calculate average rating
      if (data && data.length > 0) {
        const avg = data.reduce((sum, review) => sum + review.rating, 0) / data.length;
        setAverageRating(Math.round(avg * 10) / 10);
        setTotalReviews(data.length);
      } else {
        setAverageRating(0);
        setTotalReviews(0);
      }

    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [restaurantId, sortBy]);

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });

    return Object.entries(distribution).reverse().map(([rating, count]) => ({
      rating: Number(rating),
      count,
      percentage: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
    }));
  };

  const formatUserName = (review: Review): string => {
    return `Пользователь ${review.user_id.slice(0, 8)}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Рейтинг и отзывы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {averageRating || '—'}
              </div>
              <div className="flex justify-center mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.round(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                На основе {totalReviews} отзывов
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {getRatingDistribution().map((item) => (
                <div key={item.rating} className="flex items-center gap-2">
                  <span className="text-sm w-3">{item.rating}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-10">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Write Review & Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <WriteReview
          restaurantId={restaurantId}
          restaurantName={restaurantName}
          onReviewSubmitted={fetchReviews}
        />

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Сортировать:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Сначала новые</SelectItem>
              <SelectItem value="oldest">Сначала старые</SelectItem>
              <SelectItem value="highest">Высокий рейтинг</SelectItem>
              <SelectItem value="lowest">Низкий рейтинг</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4" />
                      <div className="h-3 bg-muted rounded w-1/3" />
                      <div className="space-y-1">
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="h-3 bg-muted rounded w-3/4" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              id={review.id}
              userName={formatUserName(review)}
              rating={review.rating}
              reviewText={review.review_text}
              photos={review.photos || []}
              createdAt={review.created_at}
              helpful={Math.floor(Math.random() * 10)} // Mock data
              notHelpful={Math.floor(Math.random() * 3)} // Mock data
              isVerified={!!review.order_id}
            />
          ))
        ) : (
          <Card className="p-8 text-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Пока нет отзывов</h3>
            <p className="text-muted-foreground mb-4">
              Станьте первым, кто оставит отзыв о {restaurantName}!
            </p>
            <WriteReview
              restaurantId={restaurantId}
              restaurantName={restaurantName}
              onReviewSubmitted={fetchReviews}
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default RestaurantReviews;