import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Review } from '@/types';
import { RatingDisplay } from './rating-display';

interface ReviewCardProps {
  review: Review;
  showChargerInfo?: boolean;
}

export function ReviewCard({ review, showChargerInfo = false }: ReviewCardProps) {
  const timeAgo = formatDistanceToNow(new Date(review.createdAt), {
    addSuffix: true,
    locale: zhCN,
  });

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={review.userAvatar} />
          <AvatarFallback>{review.userName.slice(0, 2)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{review.userName}</span>
              {showChargerInfo && (
                <span className="text-xs text-gray-500">
                  在 {review.chargerName} 充电
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>

          <div className="mb-2">
            <RatingDisplay rating={review.rating} size="sm" showValue={false} />
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {review.content}
          </p>

          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mt-3">
              {review.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`评价图片 ${idx + 1}`}
                  className="h-20 w-20 object-cover rounded-lg"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
