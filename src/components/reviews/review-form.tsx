import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  onSubmit: (rating: number, content: string) => void;
  onCancel?: () => void;
  submitting?: boolean;
}

export function ReviewForm({ onSubmit, onCancel, submitting = false }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (rating > 0 && content.trim()) {
      onSubmit(rating, content.trim());
    }
  };

  const isValid = rating > 0 && content.trim().length >= 10;

  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold">添加评价</h3>

      {/* 星级评分 */}
      <div>
        <label className="text-sm font-medium mb-2 block">评分</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  'h-8 w-8 transition-colors',
                  (hoverRating || rating) >= star
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-300 dark:fill-gray-700 dark:text-gray-600'
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* 评价内容 */}
      <div>
        <label className="text-sm font-medium mb-2 block">评价内容</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="请分享您的使用体验（至少10个字）"
          rows={4}
          maxLength={500}
        />
        <div className="text-xs text-gray-500 mt-1 text-right">
          {content.length}/500
        </div>
      </div>

      {/* 按钮 */}
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          className="flex-1"
        >
          {submitting ? '提交中...' : '提交评价'}
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={submitting}>
            取消
          </Button>
        )}
      </div>
    </div>
  );
}
