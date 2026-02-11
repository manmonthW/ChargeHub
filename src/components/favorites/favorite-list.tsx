import { Heart, MapPin, Navigation, Calendar, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Favorite } from '@/types';
import { useState } from 'react';

interface FavoriteListProps {
  favorites: Favorite[];
  chargers: Array<{
    id: string;
    name: string;
    power: number;
    price: number;
    type: 'slow' | 'fast';
    status: 'available' | 'in_use' | 'offline';
    rating: number;
    ownerName: string;
    ownerAvatar?: string;
  }>;
  onBook?: (chargerId: string) => void;
  onNavigate?: (chargerId: string) => void;
}

export function FavoriteList({ favorites, chargers, onBook, onNavigate }: FavoriteListProps) {
  const [selectedCharger, setSelectedCharger] = useState<Favorite | null>(null);

  // 获取充电桩详情
  const getChargerDetails = (chargerId: string) => {
    return chargers.find(c => c.id === chargerId);
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-center">还没有收藏的充电桩</p>
        <p className="text-sm text-gray-400 text-center mt-1">收藏您常用的充电桩，方便下次查找</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {favorites.map((favorite) => {
          const charger = getChargerDetails(favorite.chargerId);
          if (!charger) return null;

          return (
            <Card key={favorite.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* 充电桩图标 */}
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                  </div>

                  {/* 充电桩信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{charger.name}</h3>
                      <Badge
                        variant={charger.status === 'available' ? 'default' : 'secondary'}
                        className="text-xs flex-shrink-0"
                      >
                        {charger.status === 'available' ? '可预约' : charger.status === 'in_use' ? '充电中' : '离线'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{favorite.chargerAddress}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{charger.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <span className="text-orange-600 font-medium">¥{charger.price}</span>
                        <span className="text-gray-400">/度</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <span>{charger.power}kW</span>
                        <span className="text-gray-400">·</span>
                        <span>{charger.type === 'fast' ? '快充' : '慢充'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3"
                      onClick={() => onNavigate?.(charger.id)}
                    >
                      <Navigation className="w-3.5 h-3.5 mr-1" />
                      导航
                    </Button>
                    {charger.status === 'available' && onBook && (
                      <Button
                        size="sm"
                        className="h-8 px-3"
                        onClick={() => onBook(charger.id)}
                      >
                        预约
                      </Button>
                    )}
                  </div>
                </div>

                {/* 桩主信息 */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={charger.ownerAvatar} />
                    <AvatarFallback className="text-xs">{charger.ownerName[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-600">{charger.ownerName}</span>
                  <div className="flex-1" />
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>收藏于 {formatDate(favorite.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 充电桩详情对话框 */}
      <Dialog open={!!selectedCharger} onOpenChange={() => setSelectedCharger(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>充电桩详情</DialogTitle>
          </DialogHeader>
          {selectedCharger && (
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold">{selectedCharger.chargerName}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {selectedCharger.chargerAddress}
                </p>
              </div>
              <Separator />
              <div className="flex gap-2">
                {onNavigate && (
                  <Button variant="outline" className="flex-1" onClick={() => onNavigate(selectedCharger.chargerId)}>
                    <Navigation className="w-4 h-4 mr-1" />
                    导航
                  </Button>
                )}
                {onBook && (
                  <Button className="flex-1" onClick={() => onBook(selectedCharger.chargerId)}>
                    立即预约
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
