import { useState, useEffect } from 'react';
import { Phone, Car, CreditCard, Settings, ChevronRight, LogOut, Battery, FileText, HelpCircle, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChargingMonitor, getChargingSession } from '@/components/charging';
import { StatsCards } from '@/components/statistics/stats-cards';
import { ChargingChart } from '@/components/statistics/charging-chart';
import { ChargingHistory } from '@/components/statistics/charging-history';
import { FavoriteList } from '@/components/favorites';
import { useFavorites } from '@/hooks/useFavorites';
import {
  calculateChargingStats,
  getDailyChargingData,
  getWeeklyChargingData,
} from '@/utils/statistics';
import type { User as UserType, Order } from '@/types';
import { chargers } from '@/data/mock';

interface UserProfileProps {
  user: UserType;
  orderCount: number;
  totalSpent: number;
  onSwitchRole: () => void;
  onLogout: () => void;
  chargingOrderId?: string; // 正在充电的订单ID
  chargerName?: string; // 充电桩名称
  orders?: Order[]; // 用户订单列表
  onBookCharger?: (chargerId: string) => void; // 预约充电桩
  onNavigateToCharger?: (chargerId: string) => void; // 导航到充电桩
}

export function UserProfile({
  user,
  orderCount,
  totalSpent,
  onSwitchRole,
  onLogout,
  chargingOrderId,
  chargerName,
  orders = [],
  onBookCharger,
  onNavigateToCharger,
}: UserProfileProps) {
  const [chargingSession, setChargingSession] = useState<{ session: ReturnType<typeof getChargingSession>; chargerName: string } | null>(null);

  // 收藏功能
  const { favorites, isLoaded: favoritesLoaded } = useFavorites(user.id);

  // 检查是否有正在充电的订单
  useEffect(() => {
    if (chargingOrderId) {
      const session = getChargingSession(chargingOrderId);
      if (session) {
        setChargingSession({
          session,
          chargerName: chargerName || '充电桩',
        });
      }
    }
  }, [chargingOrderId, chargerName]);

  const handleChargingComplete = () => {
    // 充电完成后的处理逻辑
    setChargingSession(null);
  };

  // 计算统计数据
  const chargingStats = calculateChargingStats(orders);
  const dailyChargingData = getDailyChargingData(orders, 30);
  const weeklyChargingData = getWeeklyChargingData(orders, 12);
  const menuItems = [
    {
      icon: Battery,
      label: '我的订单',
      value: `${orderCount}笔`,
      onClick: () => {},
    },
    {
      icon: CreditCard,
      label: '支付方式',
      value: '微信支付',
      onClick: () => {},
    },
    {
      icon: Car,
      label: '我的车辆',
      value: '未绑定',
      onClick: () => {},
    },
    {
      icon: FileText,
      label: '发票管理',
      value: '',
      onClick: () => {},
    },
    {
      icon: Settings,
      label: '设置',
      value: '',
      onClick: () => {},
    },
    {
      icon: HelpCircle,
      label: '帮助与反馈',
      value: '',
      onClick: () => {},
    },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* 充电监控卡片 - 如果有正在充电的订单 */}
      {chargingSession && (
        <ChargingMonitor
          session={chargingSession.session!}
          chargerName={chargingSession.chargerName}
          onComplete={handleChargingComplete}
        />
      )}

      {/* 用户信息卡片 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-xl">{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <Badge variant={user.role === 'owner' ? 'default' : 'secondary'}>
                  {user.role === 'owner' ? '桩主' : '车主'}
                </Badge>
              </div>
              <p className="text-gray-500 flex items-center gap-1 mt-1">
                <Phone className="w-4 h-4" />
                {user.phone}
              </p>
            </div>
          </div>

          {/* 统计 */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{orderCount}</p>
              <p className="text-sm text-gray-500">充电订单</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">¥{totalSpent.toFixed(1)}</p>
              <p className="text-sm text-gray-500">累计消费</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 角色切换 */}
      {user.role === 'user' && (
        <Card className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">成为桩主</p>
                <p className="text-sm opacity-90">共享您的充电桩，赚取额外收入</p>
              </div>
              <Button variant="secondary" size="sm" onClick={onSwitchRole}>
                切换身份
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 充电统计标签页 */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="favorites">
            收藏
            {favoritesLoaded && favorites.length > 0 && (
              <span className="ml-1 text-xs">({favorites.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="statistics">充电统计</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* 菜单列表 */}
          <Card>
            <CardContent className="p-0">
              {menuItems.map((item, index) => (
                <div key={item.label}>
                  <button
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    onClick={item.onClick}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.value && (
                        <span className="text-sm text-gray-400">{item.value}</span>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                  {index < menuItems.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 退出登录 */}
          <Button variant="outline" className="w-full flex items-center gap-2" onClick={onLogout}>
            <LogOut className="w-4 h-4" />
            退出登录
          </Button>

          {/* 版本信息 */}
          <p className="text-center text-xs text-gray-400">版本 1.0.0 · 社区共享充电桩平台</p>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                我的收藏
              </CardTitle>
            </CardHeader>
            <CardContent>
              {favoritesLoaded ? (
                <FavoriteList
                  favorites={favorites}
                  chargers={chargers}
                  onBook={onBookCharger}
                  onNavigate={onNavigateToCharger}
                />
              ) : (
                <div className="flex justify-center py-8">
                  <div className="text-gray-400">加载中...</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4 mt-4">
          {/* 统计卡片 */}
          <StatsCards stats={chargingStats} />

          {/* 充电趋势图表 */}
          <ChargingChart dailyData={dailyChargingData} weeklyData={weeklyChargingData} />

          {/* 充电历史列表 */}
          <ChargingHistory orders={orders} />
        </TabsContent>
      </Tabs>

    </div>
  );
}
