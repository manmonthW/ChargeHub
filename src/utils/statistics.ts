import type { Order } from '@/types';

// 碳排放系数：每度电减少0.78kg二氧化碳
const CARBON_EMISSION_FACTOR = 0.78;

export interface ChargingStats {
  // 总充电量（度）
  totalQuantity: number;
  // 总费用（元）
  totalCost: number;
  // 平均费用（元/次）
  averageCost: number;
  // 充电次数
  chargingCount: number;
  // 快充次数
  fastChargeCount: number;
  // 慢充次数
  slowChargeCount: number;
  // 碳减排量（kg）
  carbonReduction: number;
  // 平均单次充电量（度）
  averageQuantity: number;
}

export interface DailyChargingData {
  date: string;
  quantity: number;
  cost: number;
}

export interface WeeklyChargingData {
  week: string;
  cost: number;
  count: number;
}

/**
 * 计算充电统计数据
 * @param orders 订单列表
 * @returns 充电统计数据
 */
export function calculateChargingStats(orders: Order[]): ChargingStats {
  if (!orders || orders.length === 0) {
    return {
      totalQuantity: 0,
      totalCost: 0,
      averageCost: 0,
      chargingCount: 0,
      fastChargeCount: 0,
      slowChargeCount: 0,
      carbonReduction: 0,
      averageQuantity: 0,
    };
  }

  // 过滤出已完成的订单
  const completedOrders = orders.filter(order => order.status === 'completed');

  if (completedOrders.length === 0) {
    return {
      totalQuantity: 0,
      totalCost: 0,
      averageCost: 0,
      chargingCount: 0,
      fastChargeCount: 0,
      slowChargeCount: 0,
      carbonReduction: 0,
      averageQuantity: 0,
    };
  }

  const totalQuantity = completedOrders.reduce((sum, order) => sum + (order.quantity || 0), 0);
  const totalCost = completedOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
  const chargingCount = completedOrders.length;

  // 计算快充/慢充次数（根据订单中充电桩类型，如果没有则通过充电功率判断）
  let fastChargeCount = 0;
  let slowChargeCount = 0;

  completedOrders.forEach(order => {
    // 如果订单中没有充电桩类型信息，通过充电量/时间判断
    // 这里简化处理，假设30分钟以上且充电量大于10度的为快充
    if (order.duration && order.quantity) {
      const power = (order.quantity / (order.duration / 60)); // kW
      if (power >= 20) {
        fastChargeCount++;
      } else {
        slowChargeCount++;
      }
    } else {
      // 默认归为慢充
      slowChargeCount++;
    }
  });

  const carbonReduction = totalQuantity * CARBON_EMISSION_FACTOR;
  const averageCost = chargingCount > 0 ? totalCost / chargingCount : 0;
  const averageQuantity = chargingCount > 0 ? totalQuantity / chargingCount : 0;

  return {
    totalQuantity: Math.round(totalQuantity * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    averageCost: Math.round(averageCost * 100) / 100,
    chargingCount,
    fastChargeCount,
    slowChargeCount,
    carbonReduction: Math.round(carbonReduction * 100) / 100,
    averageQuantity: Math.round(averageQuantity * 100) / 100,
  };
}

/**
 * 获取最近N天的每日充电数据
 * @param orders 订单列表
 * @param days 天数
 * @returns 每日充电数据数组
 */
export function getDailyChargingData(orders: Order[], days: number = 30): DailyChargingData[] {
  const completedOrders = orders
    .filter(order => order.status === 'completed')
    .filter(order => order.endTime);

  if (completedOrders.length === 0) {
    return [];
  }

  // 创建日期映射
  const dateMap = new Map<string, { quantity: number; cost: number }>();

  // 初始化最近N天的日期
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = formatDate(date);
    dateMap.set(dateStr, { quantity: 0, cost: 0 });
  }

  // 填充数据
  completedOrders.forEach(order => {
    if (order.endTime) {
      const dateStr = formatDate(new Date(order.endTime));
      if (dateMap.has(dateStr)) {
        const existing = dateMap.get(dateStr)!;
        dateMap.set(dateStr, {
          quantity: existing.quantity + (order.quantity || 0),
          cost: existing.cost + (order.amount || 0),
        });
      }
    }
  });

  // 转换为数组
  return Array.from(dateMap.entries()).map(([date, data]) => ({
    date,
    quantity: Math.round(data.quantity * 100) / 100,
    cost: Math.round(data.cost * 100) / 100,
  }));
}

/**
 * 获取最近N周的每周充电数据
 * @param orders 订单列表
 * @param weeks 周数
 * @returns 每周充电数据数组
 */
export function getWeeklyChargingData(orders: Order[], weeks: number = 12): WeeklyChargingData[] {
  const completedOrders = orders
    .filter(order => order.status === 'completed')
    .filter(order => order.endTime);

  if (completedOrders.length === 0) {
    return [];
  }

  // 创建周映射
  const weekMap = new Map<string, { cost: number; count: number }>();

  // 初始化最近N周
  const today = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekDate = new Date(today);
    weekDate.setDate(weekDate.getDate() - i * 7);
    const weekStr = getWeekString(weekDate);
    weekMap.set(weekStr, { cost: 0, count: 0 });
  }

  // 填充数据
  completedOrders.forEach(order => {
    if (order.endTime) {
      const orderDate = new Date(order.endTime);
      const weekStr = getWeekString(orderDate);
      if (weekMap.has(weekStr)) {
        const existing = weekMap.get(weekStr)!;
        weekMap.set(weekStr, {
          cost: existing.cost + (order.amount || 0),
          count: existing.count + 1,
        });
      }
    }
  });

  // 转换为数组，只保留有数据的周
  return Array.from(weekMap.entries())
    .filter(([_, data]) => data.count > 0)
    .map(([week, data]) => ({
      week,
      cost: Math.round(data.cost * 100) / 100,
      count: data.count,
    }));
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 获取周数（一年中的第几周）
 */
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * 获取周字符串（如 "第3周"）
 */
function getWeekString(date: Date): string {
  const weekNumber = getWeekNumber(date);
  return `第${weekNumber}周`;
}

/**
 * 格式化碳减排量显示
 */
export function formatCarbonReduction(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)}吨`;
  }
  return `${kg.toFixed(2)}公斤`;
}

/**
 * 格式化充电量显示
 */
export function formatQuantity(kwh: number): string {
  if (kwh >= 1000) {
    return `${(kwh / 1000).toFixed(2)}千度`;
  }
  return `${kwh.toFixed(2)}度`;
}
