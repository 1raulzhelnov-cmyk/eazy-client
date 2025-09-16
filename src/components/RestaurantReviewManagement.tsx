import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRestaurantReviews } from '@/hooks/useRestaurantReviews';
import { 
  Star,
  Filter,
  MessageSquare,
  User,
  Calendar,
  TrendingUp,
  Eye,
  Reply,
  Flag,
  AlertCircle
} from 'lucide-react';

export const RestaurantReviewManagement = () => {
  const { reviews, stats, loading, error, respondToReview, refreshReviews } = useRestaurantReviews();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [responseText, setResponseText] = useState('');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleResponse = async () => {
    if (!selectedReview || !responseText.trim()) return;
    
    await respondToReview(selectedReview.id, responseText);
    setSelectedReview(null);
    setResponseText('');
  };

  const getStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredReviews = reviews.filter(review => {
    switch (selectedFilter) {
      case 'high': return review.rating >= 4;
      case 'low': return review.rating <= 2;
      case 'unanswered': return !review.response;
      default: return true;
    }
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Средний рейтинг</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating}</div>
              <p className="text-xs text-muted-foreground">
                Из {stats.totalReviews} отзывов
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Этот месяц</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonthReviews}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.growthRate}% рост
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ответы</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.responseRate}%</div>
              <p className="text-xs text-muted-foreground">
                Процент ответов
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Позитивные</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.positiveReviews}%</div>
              <p className="text-xs text-muted-foreground">
                Рейтинг 4+ звезд
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter and Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Управление отзывами</h2>
          <p className="text-muted-foreground">Отвечайте на отзывы и управляйте репутацией</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все отзывы</SelectItem>
              <SelectItem value="high">Высокий рейтинг (4-5★)</SelectItem>
              <SelectItem value="low">Низкий рейтинг (1-2★)</SelectItem>
              <SelectItem value="unanswered">Без ответа</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={refreshReviews} variant="outline">
            Обновить
          </Button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="grid gap-4">
        {filteredReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Review Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">{review.customerName}</h4>
                        <div className="flex items-center space-x-1">
                          {getStarRating(review.rating)}
                        </div>
                        <span className={`text-sm font-medium ${getRatingColor(review.rating)}`}>
                          {review.rating}/5
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(review.createdAt).toLocaleDateString('et-EE')}</span>
                        <span>•</span>
                        <span>Заказ #{review.orderNumber}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!review.response && (
                      <Badge variant="outline">Без ответа</Badge>
                    )}
                    <Button variant="ghost" size="sm">
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Review Content */}
                <div className="ml-14">
                  <p className="text-sm">{review.text}</p>
                  
                  {review.photos && review.photos.length > 0 && (
                    <div className="flex space-x-2 mt-3">
                      {review.photos.map((photo, index) => (
                        <img 
                          key={index}
                          src={photo} 
                          alt={`Review photo ${index + 1}`}
                          className="w-16 h-16 rounded-lg object-cover cursor-pointer"
                        />
                      ))}
                    </div>
                  )}

                  {/* Restaurant Response */}
                  {review.response ? (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="default">Ответ ресторана</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.responseDate).toLocaleDateString('et-EE')}
                        </span>
                      </div>
                      <p className="text-sm">{review.response}</p>
                    </div>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-3"
                          onClick={() => setSelectedReview(review)}
                        >
                          <Reply className="h-4 w-4 mr-2" />
                          Ответить
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ответ на отзыв</DialogTitle>
                          <DialogDescription>
                            Ответьте на отзыв от {review.customerName}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex">{getStarRating(review.rating)}</div>
                              <span className="font-medium">{review.customerName}</span>
                            </div>
                            <p className="text-sm">{review.text}</p>
                          </div>
                          
                          <Textarea
                            placeholder="Напишите ваш ответ..."
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            rows={4}
                          />
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => {
                            setSelectedReview(null);
                            setResponseText('');
                          }}>
                            Отмена
                          </Button>
                          <Button onClick={handleResponse}>
                            Отправить ответ
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredReviews.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Отзывы не найдены</h3>
              <p className="text-muted-foreground">
                Нет отзывов, соответствующих выбранным фильтрам
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RestaurantReviewManagement;