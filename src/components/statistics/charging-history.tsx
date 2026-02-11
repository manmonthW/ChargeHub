'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowUpDown,
  Calendar,
  MapPin,
  Zap,
  DollarSign,
  Clock,
} from 'lucide-react';
import type { Order } from '@/types';
import { formatQuantity } from '@/utils/statistics';

type SortType = 'date' | 'cost' | 'quantity';
type SortOrder = 'asc' | 'desc';

interface ChargingHistoryProps {
  orders: Order[];
}

export function ChargingHistory({ orders }: ChargingHistoryProps) {
  const [sortType, setSortType] = useState<SortType>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // 过滤已完成的订单
  const completedOrders = useMemo(() => {
    return orders.filter(order => order.status === 'completed' && order.endTime);
  }, [orders]);

  // 排序后的订单
  const sortedOrders = useMemo(() => {
    const sorted = [...completedOrders].sort((a, b) => {
      let comparison = 0;

      switch (sortType) {
        case 'date':
          comparison =
            new Date(a.endTime || '').getTime() - new Date(b.endTime || '').getTime();
          break;
        case 'cost':
          comparison = (a.amount || 0) - (b.amount || 0);
          break;
        case 'quantity':
          comparison = (a.quantity || 0) - (b.quantity || 0);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [completedOrders, sortType, sortOrder]);

  const handleSort = (type: SortType) => {
    if (sortType === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortType(type);
      setSortOrder('desc');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const getSortIcon = (type: SortType) => {
    if (sortType !== type) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUpDown className="w-4 h-4 text-blue-600 rotate-180" />
    ) : (
      <ArrowUpDown className="w-4 h-4 text-blue-600" />
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>充电历史</CardTitle>
          <span className="text-sm text-gray-500">共 {completedOrders.length} 条记录</span>
        </div>
      </CardHeader>
      <CardContent>
        {/* 排序按钮 */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <Button
            variant={sortType === 'date' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort('date')}
            className="flex items-center gap-1"
          >
            <Calendar className="w-3 h-3" />
            按时间
            {getSortIcon('date')}
          </Button>
          <Button
            variant={sortType === 'cost' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort('cost')}
            className="flex items-center gap-1"
          >
            <DollarSign className="w-3 h-3" />
            按费用
            {getSortIcon('cost')}
          </Button>
          <Button
            variant={sortType === 'quantity' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort('quantity')}
            className="flex items-center gap-1"
          >
            <Zap className="w-3 h-3" />
            按电量
            {getSortIcon('quantity')}
          </Button>
        </div>

        {/* 历史记录列表 */}
        {sortedOrders.length > 0 ? (
          <div className="space-y-3">
            {sortedOrders.map((order) => (
              <div
                key={order.id}
                className="relative pl-6 pb-4 border-l-2 border-gray-200 last:pb-0 last:border-0"
              >
                {/* 时间线节点 */}
                <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-white" />

                <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                  {/* 日期和时间 */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(order.endTime || '')}</span>
                      <Clock className="w-3 h-3 ml-2" />
                      <span>{formatTime(order.endTime || '')}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {order.duration ? `充电 ${order.duration} 分钟` : ''}
                    </div>
                  </div>

                  {/* 充电桩信息 */}
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{order.chargerName}</span>
                  </div>

                  {/* 充电量和费用 */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600">充电量</span>
                      <span className="font-semibold text-blue-600">
                        {formatQuantity(order.quantity || 0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600">费用</span>
                      <span className="font-semibold text-green-600">
                        ¥{(order.amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无充电记录</p>
            <p className="text-sm mt-1">开始充电后记录将显示在这里</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
