'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { DailyChargingData, WeeklyChargingData } from '@/utils/statistics';

interface ChargingChartProps {
  dailyData: DailyChargingData[];
  weeklyData: WeeklyChargingData[];
}

// 自定义Tooltip样式
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ChargingChart({ dailyData, weeklyData }: ChargingChartProps) {
  // 格式化日期显示
  const formatChartData = (data: DailyChargingData[]) => {
    return data.map(item => ({
      ...item,
      date: item.date.slice(5), // 只显示 MM-DD
    }));
  };

  // 格式化周数据
  const formatWeekData = (data: WeeklyChargingData[]) => {
    return data.map(item => ({
      ...item,
      week: item.week.slice(1, -1), // 只显示数字
    }));
  };

  const lineChartData = formatChartData(dailyData);
  const barChartData = formatWeekData(weeklyData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>充电趋势分析</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="daily">每日趋势</TabsTrigger>
            <TabsTrigger value="weekly">每周统计</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            {lineChartData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}度`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="quantity"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5 }}
                      name="充电量(度)"
                    />
                    <Line
                      type="monotone"
                      dataKey="cost"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5 }}
                      name="费用(元)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                暂无数据
              </div>
            )}
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            {barChartData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="week"
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `第${value}周`}
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `¥${value}`}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      formatter={(value: number) => [`¥${value.toFixed(2)}`, '费用']}
                    />
                    <Legend />
                    <Bar
                      dataKey="cost"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      name="充电费用(元)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                暂无数据
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
