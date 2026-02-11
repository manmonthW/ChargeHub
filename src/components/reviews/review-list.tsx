import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Review, ReviewStats } from '@/types';
import { ReviewCard } from './review-card';
import { ReviewStats as ReviewStatsComponent } from './review-stats';

interface ReviewListProps {
  reviews: Review[];
  stats: ReviewStats;
}

type SortType = 'newest' | 'highest' | 'lowest';

export function ReviewList({ reviews, stats }: ReviewListProps) {
  const [sortBy, setSortBy] = useState<SortType>('newest');

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="space-y-4">
      {/* 评价统计 */}
      <ReviewStatsComponent stats={stats} />

      {/* 排序选项 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">用户评价</h3>
        <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as SortType)}>
          <TabsList>
            <TabsTrigger value="newest">最新</TabsTrigger>
            <TabsTrigger value="highest">好评优先</TabsTrigger>
            <TabsTrigger value="lowest">差评优先</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 评价列表 */}
      {sortedReviews.length > 0 ? (
        <div className="space-y-3">
          {sortedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          暂无评价
        </div>
      )}
    </div>
  );
}
