import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function FavoriteButton({
  isFavorite,
  onToggle,
  size = 'md',
  showLabel = false,
  className,
}: FavoriteButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onToggle();
    setTimeout(() => setIsAnimating(false), 300);
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <Button
      variant={isFavorite ? 'default' : 'outline'}
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
      className={cn(
        'relative transition-all duration-300',
        isFavorite
          ? 'bg-red-500 hover:bg-red-600 border-red-500 text-white'
          : 'hover:border-red-300 hover:text-red-500',
        isAnimating && 'scale-110',
        className
      )}
      onClick={handleClick}
    >
      <Heart
        className={cn(
          'transition-all duration-300',
          isFavorite ? 'fill-white scale-110' : 'scale-100',
          isAnimating && isFavorite && 'animate-pulse'
        )}
        style={{ width: iconSizes[size], height: iconSizes[size] }}
      />
      {showLabel && (
        <span className="ml-2">
          {isFavorite ? '已收藏' : '收藏'}
        </span>
      )}
    </Button>
  );
}

// 紧凑型收藏按钮（用于卡片等紧凑空间）
export function FavoriteButtonCompact({
  isFavorite,
  onToggle,
  className,
}: {
  isFavorite: boolean;
  onToggle: () => void;
  className?: string;
}) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onToggle();
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      className={cn(
        'p-2 rounded-full transition-all duration-300',
        isFavorite
          ? 'bg-red-100 text-red-500 hover:bg-red-200'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-500',
        isAnimating && 'scale-110',
        className
      )}
      onClick={handleClick}
      aria-label={isFavorite ? '取消收藏' : '添加收藏'}
    >
      <Heart
        className={cn(
          'transition-all duration-300',
          isFavorite ? 'fill-current' : '',
          isAnimating && isFavorite && 'animate-pulse'
        )}
      />
    </button>
  );
}
