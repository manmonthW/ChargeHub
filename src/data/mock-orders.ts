import type { Order } from '@/types';

// 模拟充电订单数据（用于测试统计功能）
export const mockOrders: Order[] = [
  {
    id: '1',
    chargerId: 'charger-1',
    chargerName: '阳光花园充电桩',
    userId: 'user-1',
    userName: '张三',
    ownerId: 'owner-1',
    startTime: '2025-12-15T08:00:00',
    endTime: '2025-12-15T10:30:00',
    duration: 150,
    amount: 45.5,
    quantity: 38.2,
    status: 'completed',
    createdAt: '2025-12-15T08:00:00',
  },
  {
    id: '2',
    chargerId: 'charger-2',
    chargerName: '绿苑小区快充站',
    userId: 'user-1',
    userName: '张三',
    ownerId: 'owner-2',
    startTime: '2025-12-18T14:00:00',
    endTime: '2025-12-18T15:45:00',
    duration: 105,
    amount: 52.8,
    quantity: 44.0,
    status: 'completed',
    createdAt: '2025-12-18T14:00:00',
  },
  {
    id: '3',
    chargerId: 'charger-3',
    chargerName: '蓝天家园充电点',
    userId: 'user-1',
    userName: '张三',
    ownerId: 'owner-3',
    startTime: '2025-12-20T19:00:00',
    endTime: '2025-12-20T22:00:00',
    duration: 180,
    amount: 35.2,
    quantity: 29.3,
    status: 'completed',
    createdAt: '2025-12-20T19:00:00',
  },
  {
    id: '4',
    chargerId: 'charger-4',
    chargerName: '星光大道充电站',
    userId: 'user-1',
    userName: '张三',
    ownerId: 'owner-4',
    startTime: '2025-12-22T10:00:00',
    endTime: '2025-12-22T11:30:00',
    duration: 90,
    amount: 38.7,
    quantity: 32.3,
    status: 'completed',
    createdAt: '2025-12-22T10:00:00',
  },
  {
    id: '5',
    chargerId: 'charger-5',
    chargerName: '翠屏山庄充电桩',
    userId: 'user-1',
    userName: '张三',
    ownerId: 'owner-5',
    startTime: '2025-12-25T16:00:00',
    endTime: '2025-12-25T18:30:00',
    duration: 150,
    amount: 41.3,
    quantity: 34.4,
    status: 'completed',
    createdAt: '2025-12-25T16:00:00',
  },
  {
    id: '6',
    chargerId: 'charger-1',
    chargerName: '阳光花园充电桩',
    userId: 'user-1',
    userName: '张三',
    ownerId: 'owner-1',
    startTime: '2025-12-28T09:00:00',
    endTime: '2025-12-28T11:00:00',
    duration: 120,
    amount: 36.0,
    quantity: 30.0,
    status: 'completed',
    createdAt: '2025-12-28T09:00:00',
  },
  {
    id: '7',
    chargerId: 'charger-6',
    chargerName: '新城中心充电站',
    userId: 'user-1',
    userName: '张三',
    ownerId: 'owner-6',
    startTime: '2025-12-30T13:00:00',
    endTime: '2025-12-30T15:30:00',
    duration: 150,
    amount: 48.6,
    quantity: 40.5,
    status: 'completed',
    createdAt: '2025-12-30T13:00:00',
  },
  {
    id: '8',
    chargerId: 'charger-2',
    chargerName: '绿苑小区快充站',
    userId: 'user-1',
    userName: '张三',
    ownerId: 'owner-2',
    startTime: '2026-01-03T08:30:00',
    endTime: '2026-01-03T10:00:00',
    duration: 90,
    amount: 35.4,
    quantity: 29.5,
    status: 'completed',
    createdAt: '2026-01-03T08:30:00',
  },
  {
    id: '9',
    chargerId: 'charger-7',
    chargerName: '滨海假日充电点',
    userId: 'user-1',
    userName: '张三',
    ownerId: 'owner-7',
    startTime: '2026-01-05T15:00:00',
    endTime: '2026-01-05T17:30:00',
    duration: 150,
    amount: 42.8,
    quantity: 35.7,
    status: 'completed',
    createdAt: '2026-01-05T15:00:00',
  },
  {
    id: '10',
    chargerId: 'charger-8',
    chargerName: '凤凰城充电站',
    userId: 'user-1',
    userName: '张三',
    ownerId: 'owner-8',
    startTime: '2026-01-08T10:30:00',
    endTime: '2026-01-08T13:00:00',
    duration: 150,
    amount: 46.2,
    quantity: 38.5,
    status: 'completed',
    createdAt: '2026-01-08T10:30:00',
  },
];

// 根据需要生成更多模拟数据
export const generateMockOrders = (count: number = 20): Order[] => {
  const orders: Order[] = [...mockOrders];
  const chargerNames = [
    '阳光花园充电桩',
    '绿苑小区快充站',
    '蓝天家园充电点',
    '星光大道充电站',
    '翠屏山庄充电桩',
    '新城中心充电站',
    '滨海假日充电点',
    '凤凰城充电站',
  ];

  for (let i = mockOrders.length + 1; i <= count; i++) {
    const chargerName = chargerNames[Math.floor(Math.random() * chargerNames.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    const startTime = new Date(date);
    startTime.setHours(8 + Math.floor(Math.random() * 12));
    startTime.setMinutes(Math.floor(Math.random() * 60));

    const duration = 60 + Math.floor(Math.random() * 180);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    const quantity = 20 + Math.random() * 40;
    const amount = quantity * (0.9 + Math.random() * 0.3);

    orders.push({
      id: `order-${i}`,
      chargerId: `charger-${(i % 8) + 1}`,
      chargerName,
      userId: 'user-1',
      userName: '张三',
      ownerId: `owner-${(i % 8) + 1}`,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      amount: parseFloat(amount.toFixed(2)),
      quantity: parseFloat(quantity.toFixed(2)),
      status: 'completed',
      createdAt: startTime.toISOString(),
    });
  }

  return orders.sort((a, b) => new Date(b.endTime || '').getTime() - new Date(a.endTime || '').getTime());
};
