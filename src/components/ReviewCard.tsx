import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, ThumbsDown, Flag, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ReviewCardProps {
  id: string;
  userAvatar?: string;
  userName: string;
  rating: number;
  reviewText: string;
  photos?: string[];
  createdAt: string;
  helpful: number;
  notHelpful: number;
  restaurantResponse?: string;
  isVerified?: boolean;
  orderItems?: string[];
}

const ReviewCard = ({
  id,
  userAvatar,
  userName,
  rating,
  reviewText,
  photos = [],
  createdAt,
  helpful,
  notHelpful,
  restaurantResponse,
  isVerified,
  orderItems = [],
}: ReviewCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userVote, setUserVote] = useState<'helpful' | 'not_helpful' | null>(null);
  const [helpfulCount, setHelpfulCount] = useState(helpful);
  const [notHelpfulCount, setNotHelpfulCount] = useState(notHelpful);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleVote = (vote: 'helpful' | 'not_helpful') => {
    if (userVote === vote) {
      // Remove vote
      if (vote === 'helpful') {
        setHelpfulCount(prev => prev - 1);
      } else {
        setNotHelpfulCount(prev => prev - 1);
      }
      setUserVote(null);
    } else {
      // Change or add vote
      if (userVote) {
        // Change existing vote
        if (userVote === 'helpful') {
          setHelpfulCount(prev => prev - 1);
          setNotHelpfulCount(prev => prev + 1);
        } else {
          setNotHelpfulCount(prev => prev - 1);
          setHelpfulCount(prev => prev + 1);
        }
      } else {
        // Add new vote
        if (vote === 'helpful') {
          setHelpfulCount(prev => prev + 1);
        } else {
          setNotHelpfulCount(prev => prev + 1);
        }
      }
      setUserVote(vote);
    }
  };

  const userInitials = userName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const shouldTruncate = reviewText.length > 200;
  const displayText = shouldTruncate && !isExpanded 
    ? reviewText.slice(0, 200) + '...'
    : reviewText;

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback className="bg-gradient-primary text-white text-sm">
            {userInitials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{userName}</h4>
              {isVerified && (
                <Badge variant="secondary" className="text-xs">
                  Подтвержденный заказ
                </Badge>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-auto p-1">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Flag className="w-4 h-4 mr-2" />
                  Пожаловаться
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDate(createdAt)}
            </span>
          </div>

          {orderItems.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1">Заказал:</p>
              <div className="flex flex-wrap gap-1">
                {orderItems.map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="mb-3">
            <p className="text-sm leading-relaxed">{displayText}</p>
            {shouldTruncate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-1 h-auto p-0 text-primary"
              >
                {isExpanded ? 'Свернуть' : 'Читать полностью'}
              </Button>
            )}
          </div>

          {photos.length > 0 && (
            <div className="mb-3">
              <div className="flex gap-2 overflow-x-auto">
                {photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Фото к отзыву ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      // Open photo in modal/lightbox
                      console.log('Open photo:', photo);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {restaurantResponse && (
            <div className="bg-muted/30 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">R</span>
                </div>
                <span className="text-sm font-medium">Ответ ресторана</span>
              </div>
              <p className="text-sm">{restaurantResponse}</p>
            </div>
          )}

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('helpful')}
              className={`h-auto px-2 py-1 ${
                userVote === 'helpful' 
                  ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                  : 'text-muted-foreground'
              }`}
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              {helpfulCount > 0 && helpfulCount}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('not_helpful')}
              className={`h-auto px-2 py-1 ${
                userVote === 'not_helpful' 
                  ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                  : 'text-muted-foreground'
              }`}
            >
              <ThumbsDown className="w-4 h-4 mr-1" />
              {notHelpfulCount > 0 && notHelpfulCount}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReviewCard;