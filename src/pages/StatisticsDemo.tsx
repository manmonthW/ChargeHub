'use client';

import { StatsCards } from '@/components/statistics/stats-cards';
import { ChargingChart } from '@/components/statistics/charging-chart';
import { ChargingHistory } from '@/components/statistics/charging-history';
import {
  calculateChargingStats,
  getDailyChargingData,
  getWeeklyChargingData,
} from '@/utils/statistics';
import { generateMockOrders } from '@/data/mock-orders';
import type { Order } from '@/types';

export function StatisticsDemo() {
  // 生成模拟数据
  const orders: Order[] = generateMockOrders(30);

  // 计算统计数据
  const stats = calculateChargingStats(orders);
  const dailyData = getDailyChargingData(orders, 30);
  const weeklyData = getWeeklyChargingData(orders, 12);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">充电统计演示</h1>
          <p className="text-gray-600 mt-2">
            这是充电历史统计和可视化功能的演示页面
          </p>
        </div>

        {/* 统计卡片 */}
        <StatsCards stats={stats} />

        {/* 充电趋势图表 */}
        <ChargingChart dailyData={dailyData} weeklyData={weeklyData} />

        {/* 充电历史列表 */}
        <ChargingHistory orders={orders} />

        {/* 数据说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-semibold mb-2">数据说明：</p>
          <ul className="list-disc list-inside space-y-1">
            <li>所有数据均为随机生成的模拟数据</li>
            <li>碳减排计算：每充1度电约减少0.78kg二氧化碳排放</li>
            <li>快充/慢充根据充电功率自动判断（功率≥20kW为快充）</li>
            <li>图表数据仅统计已完成的充电订单</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
