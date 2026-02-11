# 充电统计组件使用说明

## 组件概述

本目录包含充电历史统计和可视化功能的相关组件。

## 文件结构

```
statistics/
├── index.ts              # 导出所有组件
├── stats-cards.tsx       # 统计卡片组件
├── charging-chart.tsx    # 充电趋势图表组件
└── charging-history.tsx  # 充电历史列表组件
```

## 组件说明

### StatsCards 组件

显示4个核心充电统计指标：
- 总充电量
- 总费用
- 充电次数（含快充/慢充细分）
- 碳减排量

**Props:**
```typescript
interface StatsCardsProps {
  stats: ChargingStats;
}
```

**使用示例:**
```tsx
import { StatsCards } from '@/components/statistics';
import { calculateChargingStats } from '@/utils/statistics';

const stats = calculateChargingStats(orders);
<StatsCards stats={stats} />
```

### ChargingChart 组件

显示充电趋势分析图表，包含两个标签页：
- 每日趋势：折线图显示最近30天的充电量和费用
- 每周统计：柱状图显示最近12周的充电费用分布

**Props:**
```typescript
interface ChargingChartProps {
  dailyData: DailyChargingData[];
  weeklyData: WeeklyChargingData[];
}
```

**使用示例:**
```tsx
import { ChargingChart } from '@/components/statistics';
import { getDailyChargingData, getWeeklyChargingData } from '@/utils/statistics';

const dailyData = getDailyChargingData(orders, 30);
const weeklyData = getWeeklyChargingData(orders, 12);
<ChargingChart dailyData={dailyData} weeklyData={weeklyData} />
```

### ChargingHistory 组件

以时间线样式展示充电历史记录，支持：
- 按时间/费用/电量排序
- 显示日期、充电桩名称、充电量、费用
- 智能时间显示（今天、昨天、N天前）

**Props:**
```typescript
interface ChargingHistoryProps {
  orders: Order[];
}
```

**使用示例:**
```tsx
import { ChargingHistory } from '@/components/statistics';

<ChargingHistory orders={orders} />
```

## 工具函数

### calculateChargingStats

计算充电统计数据：

```typescript
import { calculateChargingStats } from '@/utils/statistics';

const stats = calculateChargingStats(orders);
// 返回: {
//   totalQuantity: number,      // 总充电量（度）
//   totalCost: number,          // 总费用（元）
//   averageCost: number,        // 平均费用（元/次）
//   chargingCount: number,      // 充电次数
//   fastChargeCount: number,    // 快充次数
//   slowChargeCount: number,    // 慢充次数
//   carbonReduction: number,    // 碳减排量（kg）
//   averageQuantity: number,    // 平均单次充电量（度）
// }
```

### getDailyChargingData

获取最近N天的每日充电数据：

```typescript
const dailyData = getDailyChargingData(orders, 30);
// 返回: Array<{ date: string; quantity: number; cost: number }>
```

### getWeeklyChargingData

获取最近N周的每周充电数据：

```typescript
const weeklyData = getWeeklyChargingData(orders, 12);
// 返回: Array<{ week: string; cost: number; count: number }>
```

## 碳减排计算

每充1度电约减少0.78kg二氧化碳排放。

## 在用户中心集成

已集成到 `src/sections/UserProfile.tsx`，在"充电统计"标签页中可以查看：
- 统计卡片概览
- 充电趋势图表
- 充电历史记录

## 样式特点

- 响应式设计，支持移动端
- 使用 Tailwind CSS 样式
- 图表使用 recharts 库
- 时间线样式的历史记录
- 支持排序和筛选
