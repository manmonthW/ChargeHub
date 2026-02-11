import { Progress } from '@/components/ui/progress';
import type { ReviewStats } from '@/types';
import { RatingDisplay } from './rating-display';

interface ReviewStatsProps {
  stats: ReviewStats;
}

export function ReviewStats({ stats }: ReviewStatsProps) {
  const { averageRating, totalReviews, ratingDistribution } = stats;

  return (
    <div className="flex gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      {/* 左侧：平均评分 */}
      <div className="flex flex-col items-center justify-center min-w-24">
        <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          {averageRating.toFixed(1)}
        </div>
        <RatingDisplay rating={averageRating} size="sm" showValue={false} />
        <div className="text-xs text-gray-500 mt-1">{totalReviews} 条评价</div>
      </div>

      {/* 右侧：评分分布 */}
      <div className="flex-1 space-y-1">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = ratingDistribution[star as keyof typeof ratingDistribution];
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-3 text-gray-600 dark:text-gray-400">{star}</span>
              <span className="text-gray-400">★</span>
              <Progress value={percentage} className="flex-1 h-2" />
              <span className="w-8 text-right text-gray-500 dark:text-gray-400 text-xs">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
