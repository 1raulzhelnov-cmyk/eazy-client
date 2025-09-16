import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, Camera, X, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WriteReviewProps {
  restaurantId: string;
  restaurantName: string;
  orderId?: string;
  orderItems?: string[];
  onReviewSubmitted?: () => void;
}

const WriteReview = ({
  restaurantId,
  restaurantName,
  orderId,
  orderItems = [],
  onReviewSubmitted,
}: WriteReviewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const uploadPhoto = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('review-photos')
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('review-photos')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить фотографию",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в аккаунт, чтобы оставить отзыв",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Поставьте оценку",
        description: "Пожалуйста, выберите количество звезд",
        variant: "destructive",
      });
      return;
    }

    if (reviewText.trim().length < 10) {
      toast({
        title: "Слишком короткий отзыв",
        description: "Напишите более подробный отзыв (минимум 10 символов)",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        user_id: user.id,
        restaurant_id: restaurantId,
        rating,
        review_text: reviewText.trim(),
        photos: uploadedPhotos.length > 0 ? uploadedPhotos : null,
        ...(orderId && { order_id: orderId }),
      };

      const { error } = await supabase
        .from('reviews')
        .insert(reviewData);

      if (error) {
        throw error;
      }

      toast({
        title: "Отзыв опубликован!",
        description: "Спасибо за ваш отзыв. Он поможет другим пользователям.",
      });

      // Reset form
      setRating(0);
      setReviewText("");
      setPhotos([]);
      setUploadedPhotos([]);
      setIsOpen(false);

      // Callback for parent component
      onReviewSubmitted?.();

    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось опубликовать отзыв. Попробуйте еще раз.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhoto(true);

    try {
      for (const file of Array.from(files)) {
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "Файл слишком большой",
            description: "Размер фото не должен превышать 5 МБ",
            variant: "destructive",
          });
          continue;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setPhotos(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);

        // Upload to storage
        const publicUrl = await uploadPhoto(file);
        if (publicUrl) {
          setUploadedPhotos(prev => [...prev, publicUrl]);
        }
      }
    } catch (error) {
      console.error('Error processing photos:', error);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  if (!user) {
    return (
      <Card className="p-4 text-center">
        <p className="text-muted-foreground mb-4">
          Войдите в аккаунт, чтобы оставить отзыв
        </p>
        <Button variant="outline" onClick={() => window.location.href = '/auth'}>
          Войти
        </Button>
      </Card>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:shadow-glow">
          <Star className="w-4 h-4 mr-2" />
          Написать отзыв
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Отзыв о {restaurantName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Items */}
          {orderItems.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2">Ваш заказ:</Label>
              <div className="flex flex-wrap gap-2">
                {orderItems.map((item, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-muted rounded-md text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rating */}
          <div>
            <Label className="text-sm font-medium mb-2">Оценка *</Label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  onMouseEnter={() => setHoveredRating(i + 1)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      i < (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating} из 5
                </span>
              )}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <Label htmlFor="review-text" className="text-sm font-medium mb-2">
              Ваш отзыв *
            </Label>
            <Textarea
              id="review-text"
              placeholder="Расскажите о вашем опыте: качество еды, скорость доставки, общие впечатления..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              className="resize-none"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {reviewText.length}/500 символов
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <Label className="text-sm font-medium mb-2">Фотографии (опционально)</Label>
            <div className="space-y-3">
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Фото ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {photos.length < 5 && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                    disabled={isUploadingPhoto}
                  />
                  <Label
                    htmlFor="photo-upload"
                    className={`flex items-center gap-2 cursor-pointer border-2 border-dashed rounded-lg p-4 transition-colors ${
                      isUploadingPhoto 
                        ? 'border-muted bg-muted cursor-not-allowed' 
                        : 'border-muted hover:border-primary'
                    }`}
                  >
                    {isUploadingPhoto ? (
                      <>
                        <Upload className="w-5 h-5 animate-pulse" />
                        <span className="text-sm">Загрузка...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5" />
                        <span className="text-sm">Добавить фото</span>
                      </>
                    )}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Максимум 5 фотографий, до 5 МБ каждая
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              onClick={handleSubmitReview}
              disabled={isSubmitting || rating === 0 || isUploadingPhoto}
              className="flex-1 bg-gradient-primary hover:shadow-glow"
            >
              {isSubmitting ? "Публикуем..." : "Опубликовать отзыв"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WriteReview;