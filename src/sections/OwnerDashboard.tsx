import { useState } from 'react';
import { Plus, Calendar, DollarSign, Battery, MoreVertical, Edit, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Charger, Order } from '@/types';

interface OwnerDashboardProps {
  chargers: Charger[];
  orders: Order[];
  onAddCharger: () => void;
  onEditCharger: (chargerId: string) => void;
  onToggleCharger: (chargerId: string) => void;
}

export function OwnerDashboard({ 
  chargers, 
  orders, 
  onAddCharger, 
  onEditCharger, 
  onToggleCharger 
}: OwnerDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // 统计数据
  const stats = {
    totalChargers: chargers.length,
    availableChargers: chargers.filter(c => c.status === 'available').length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.amount || 0), 0),
    todayOrders: orders.filter(o => o.createdAt.startsWith('2025-01-30')).length,
  };

  // 获取状态颜色
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500">可用</Badge>;
      case 'in_use':
        return <Badge className="bg-blue-500">充电中</Badge>;
      case 'offline':
        return <Badge variant="secondary">离线</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">我的充电桩</p>
                <p className="text-2xl font-bold">{stats.totalChargers}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Battery className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-1">
              {stats.availableChargers}个可用
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">累计收益</p>
                <p className="text-2xl font-bold">¥{stats.totalRevenue.toFixed(1)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              共{stats.totalOrders}笔订单
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 添加按钮 */}
      <Button onClick={onAddCharger} className="w-full flex items-center gap-2">
        <Plus className="w-4 h-4" />
        添加充电桩
      </Button>

      {/* 标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="orders">订单记录</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3 mt-4">
          <h3 className="font-semibold text-gray-700">我的充电桩</h3>
          {chargers.map((charger) => (
            <Card key={charger.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{charger.name}</h4>
                      {getStatusBadge(charger.status)}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{charger.address}</p>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-orange-600 font-semibold">¥{charger.price}/度</span>
                      <span className="text-gray-500">{charger.power}kW</span>
                      <span className="text-gray-500">{charger.type === 'fast' ? '快充' : '慢充'}</span>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditCharger(charger.id)}>
                        <Edit className="w-4 h-4 mr-2" />
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleCharger(charger.id)}>
                        <Power className="w-4 h-4 mr-2" />
                        {charger.status === 'offline' ? '上线' : '下线'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="orders" className="space-y-3 mt-4">
          <h3 className="font-semibold text-gray-700">最近订单</h3>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无订单记录</p>
            </div>
          ) : (
            orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{order.chargerName}</span>
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                          {order.status === 'completed' ? '已完成' : order.status === 'charging' ? '充电中' : '已取消'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {order.userName} · {order.createdAt}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-orange-600">
                        {order.amount > 0 ? `¥${order.amount.toFixed(1)}` : '--'}
                      </p>
                      {order.quantity > 0 && (
                        <p className="text-xs text-gray-500">{order.quantity.toFixed(1)}度</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
