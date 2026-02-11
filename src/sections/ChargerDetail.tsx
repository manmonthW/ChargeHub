import { useState, useEffect } from 'react';
import { MapPin, Battery, Star, Clock, Phone, Calendar, Navigation, ExternalLink, MessageSquare, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { smartNavigate, showNavigationOptions } from '@/lib/navigation';
import type { Charger } from '@/types';
import { ReviewList, ReviewForm } from '@/components/reviews';
import { FavoriteButtonCompact } from '@/components/favorites';
import { FeeCalculator } from '@/components/charging';
import { getChargerReviews, getChargerReviewStats, addReview, hasUserReviewedOrder } from '@/data/mock';
import { currentUser, orders, chargers } from '@/data/mock';
import { toast } from 'sonner';
import { useFavorites } from '@/hooks/useFavorites';
import type { ChargingSession } from '@/types';

interface ChargerDetailProps {
  charger: Charger | null;
  isOpen: boolean;
  onClose: () => void;
  onBook: (chargerId: string) => void;
}

export function ChargerDetail({ charger, isOpen, onClose, onBook }: ChargerDetailProps) {
  const [showBookingConfirm, setShowBookingConfirm] = useState(false);
  const [showNavOptions, setShowNavOptions] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewKey, setReviewKey] = useState(0); // 用于刷新评价列表

  // 充电状态模拟（当充电桩正在使用时显示）
  const [chargingStatus, setChargingStatus] = useState<ChargingSession | null>(null);

  // 收藏功能
  const { isFavorite, toggleFavorite } = useFavorites(currentUser.id);
  const [favoriteStatus, setFavoriteStatus] = useState(false);

  // 更新收藏状态
  useEffect(() => {
    if (charger) {
      setFavoriteStatus(isFavorite(charger.id));
    }
  }, [charger, isFavorite]);

  // 模拟充电状态更新
  useEffect(() => {
    if (charger?.status === 'in_use') {
      // 模拟获取当前充电状态
      setChargingStatus({
        orderId: 'current',
        currentLevel: 35 + Math.random() * 30, // 35-65% 之间随机
        chargingSpeed: charger.power * (0.8 + Math.random() * 0.4), // 80%-120% 功率波动
        chargedAmount: 15 + Math.random() * 20,
        estimatedCost: 15 + Math.random() * 20,
        remainingTime: Math.floor(20 + Math.random() * 40),
        targetLevel: 80,
      });

      // 每2秒更新一次
      const interval = setInterval(() => {
        setChargingStatus(prev => {
          if (!prev) return null;
          const increase = 1 + Math.random() * 3;
          const newLevel = Math.min(prev.currentLevel + increase, prev.targetLevel || 100);
          return {
            ...prev,
            currentLevel: newLevel,
            chargedAmount: prev.chargedAmount + increase * 0.5,
            estimatedCost: prev.estimatedCost + increase * 0.5,
            remainingTime: Math.max(0, prev.remainingTime - 2),
          };
        });
      }, 2000);

      return () => clearInterval(interval);
    } else {
      setChargingStatus(null);
    }
  }, [charger]);

  if (!charger) return null;

  // 获取该充电桩的评价数据
  const reviews = getChargerReviews(charger.id);
  const reviewStats = getChargerReviewStats(charger.id);

  // 检查用户是否有已完成且未评价的订单
  const completedOrder = orders.find(
    o => o.chargerId === charger.id && o.userId === currentUser.id && o.status === 'completed' && !hasUserReviewedOrder(currentUser.id, o.id)
  );

  // 提交评价
  const handleSubmitReview = (rating: number, content: string) => {
    if (!completedOrder) return;

    setIsSubmittingReview(true);
    // 模拟API延迟
    setTimeout(() => {
      addReview({
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        chargerId: charger.id,
        chargerName: charger.name,
        orderId: completedOrder.id,
        rating,
        content,
      });
      setIsSubmittingReview(false);
      setShowReviewForm(false);
      setReviewKey(prev => prev + 1); // 刷新评价列表
      toast.success('评价提交成功！');
    }, 500);
  };

  // 切换收藏状态
  const handleToggleFavorite = () => {
    const newStatus = toggleFavorite(charger.id, charger.name, charger.address);
    setFavoriteStatus(newStatus);
    toast.success(newStatus ? '已添加到收藏' : '已取消收藏');
  };

  const handleBook = () => {
    setShowBookingConfirm(true);
  };

  const confirmBook = () => {
    onBook(charger.id);
    setShowBookingConfirm(false);
    onClose();
  };

  // 处理导航
  const handleNavigate = () => {
    // 直接使用智能导航
    smartNavigate(
      charger.location.lat,
      charger.location.lng,
      charger.name
    );
  };

  // 从描述中提取距离信息
  const getDistanceText = () => {
    const match = charger.description?.match(/距离您约(\d+)米/);
    return match ? match[0] : '';
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2">
              <DialogTitle className="text-xl font-bold flex-1">{charger.name}</DialogTitle>
              <FavoriteButtonCompact
                isFavorite={favoriteStatus}
                onToggle={handleToggleFavorite}
              />
              <Badge
                variant={charger.status === 'available' ? 'default' : 'secondary'}
                className="text-sm"
              >
                {charger.status === 'available' ? '可预约' : charger.status === 'in_use' ? '充电中' : '离线'}
              </Badge>
            </div>
            <DialogDescription className="flex items-center gap-1 text-gray-500">
              <MapPin className="w-4 h-4" />
              {charger.address}
              {getDistanceText() && (
                <span className="ml-2 text-blue-600 font-medium">
                  ({getDistanceText()})
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* 充电状态显示（如果正在充电） */}
          {chargingStatus && (
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-blue-600 animate-pulse" />
                  <h4 className="font-bold text-gray-800">充电中</h4>
                  <Badge variant="secondary" className="ml-auto">
                    {chargingStatus.chargingSpeed.toFixed(1)} kW
                  </Badge>
                </div>

                {/* 进度条 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">当前电量</span>
                    <span className="font-bold text-lg">{chargingStatus.currentLevel.toFixed(0)}%</span>
                  </div>
                  <Progress value={chargingStatus.currentLevel} className="h-3" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>已充 {chargingStatus.chargedAmount.toFixed(1)} kWh</span>
                    <span>预计剩余 {chargingStatus.remainingTime} 分钟</span>
                  </div>
                </div>

                {/* 费用信息 */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">当前费用</span>
                    <span className="font-bold text-orange-600">¥{chargingStatus.estimatedCost.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {/* 导航按钮 */}
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
              onClick={handleNavigate}
            >
              <Navigation className="w-5 h-5" />
              <span>导航到这里</span>
              <ExternalLink className="w-4 h-4 ml-auto" />
            </Button>

            {/* 桩主信息 */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={charger.ownerAvatar} />
                    <AvatarFallback>{charger.ownerName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{charger.ownerName}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{charger.rating}</span>
                      <span className="text-gray-400">({charger.orderCount}单)</span>
                    </div>
                  </div>
                  <FavoriteButtonCompact
                    isFavorite={favoriteStatus}
                    onToggle={handleToggleFavorite}
                    className="mr-2"
                  />
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    联系
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 充电桩参数 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">充电参数</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Battery className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                    <p className="text-lg font-bold">{charger.power}kW</p>
                    <p className="text-xs text-gray-500">充电功率</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-orange-600">¥{charger.price}</p>
                    <p className="text-xs text-gray-500">每度电价</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold">{charger.type === 'fast' ? '快充' : '慢充'}</p>
                    <p className="text-xs text-gray-500">充电类型</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-6 h-6 mx-auto mb-1 text-green-500" />
                    <p className="text-lg font-bold">24h</p>
                    <p className="text-xs text-gray-500">服务时间</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 费用计算器 */}
            <FeeCalculator
              price={charger.price}
              power={charger.power}
              nearbyChargers={chargers
                .filter(c => c.id !== charger.id)
                .slice(0, 3)
                .map(c => ({
                  name: c.name,
                  price: c.price,
                  distance: c.description?.match(/距离您约(\d+)米/)?.[0],
                }))
              }
            />

            {/* 描述 */}
            {charger.description && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">桩主说明</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-700">{charger.description}</p>
                </CardContent>
              </Card>
            )}

            {/* 可用时间 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">可用时段</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      工作日
                    </span>
                    <span className="text-gray-600">08:00 - 22:00</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      周末
                    </span>
                    <span className="text-gray-600">全天可用</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 用户评价 */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    用户评价
                  </CardTitle>
                  {completedOrder && !showReviewForm && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowReviewForm(true)}
                      className="text-blue-600 border-blue-200"
                    >
                      写评价
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {showReviewForm ? (
                  <ReviewForm
                    onSubmit={handleSubmitReview}
                    onCancel={() => setShowReviewForm(false)}
                    submitting={isSubmittingReview}
                  />
                ) : (
                  <ReviewList
                    key={reviewKey}
                    reviews={reviews}
                    stats={reviewStats}
                  />
                )}
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                再看看
              </Button>
              <Button 
                className="flex-1" 
                disabled={charger.status !== 'available'}
                onClick={handleBook}
              >
                {charger.status === 'available' ? '立即预约' : '暂时不可用'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 预约确认对话框 */}
      <Dialog open={showBookingConfirm} onOpenChange={setShowBookingConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>确认预约</DialogTitle>
            <DialogDescription>
              您将预约 <strong>{charger.name}</strong>，预约后请在30分钟内到达开始充电。
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowBookingConfirm(false)}>
              取消
            </Button>
            <Button className="flex-1" onClick={confirmBook}>
              确认预约
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 导航选项对话框 */}
      <Dialog open={showNavOptions} onOpenChange={setShowNavOptions}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>选择导航应用</DialogTitle>
            <DialogDescription>
              导航到 {charger.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-4">
            {showNavigationOptions(charger.location.lat, charger.location.lng, charger.name).map((option) => (
              <Button
                key={option.name}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  option.action();
                  setShowNavOptions(false);
                }}
              >
                <Navigation className="w-4 h-4 mr-2" />
                {option.name}
              </Button>
            ))}
            <Button 
              variant="ghost" 
              className="mt-2"
              onClick={() => setShowNavOptions(false)}
            >
              取消
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
