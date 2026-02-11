import { Zap, DollarSign, BatteryCharging, Leaf } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { ChargingStats } from '@/utils/statistics';
import { formatCarbonReduction, formatQuantity } from '@/utils/statistics';

interface StatsCardsProps {
  stats: ChargingStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: '总充电量',
      value: formatQuantity(stats.totalQuantity),
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: `平均 ${stats.averageQuantity.toFixed(1)} 度/次`,
    },
    {
      title: '总费用',
      value: `¥${stats.totalCost.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: `平均 ¥${stats.averageCost.toFixed(2)}/次`,
    },
    {
      title: '充电次数',
      value: stats.chargingCount.toString(),
      icon: BatteryCharging,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: `快充 ${stats.fastChargeCount} · 慢充 ${stats.slowChargeCount}`,
    },
    {
      title: '碳减排',
      value: formatCarbonReduction(stats.carbonReduction),
      icon: Leaf,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: '相当于种植树木',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.description}</p>
              </div>
              <div className={`${card.bgColor} p-2 rounded-lg`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
