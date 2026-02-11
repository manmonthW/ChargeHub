import { useState, useCallback, useMemo } from 'react';
import type { Order, OrderStatus } from '@/types';
import { orders, ownerOrders } from '@/data/mock';

export function useOrders(_userId: string, role: 'user' | 'owner' = 'user') {
  const [userOrders, setUserOrders] = useState<Order[]>(
    role === 'user' ? orders : ownerOrders
  );
  const [isLoading, setIsLoading] = useState(false);

  // 获取正在充电的订单
  const chargingOrder = useMemo(() => {
    return userOrders.find(o => o.status === 'charging');
  }, [userOrders]);

  // 创建订单
  const createOrder = useCallback(async (chargerId: string, userId: string) => {
    setIsLoading(true);
    // 模拟创建订单
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newOrder: Order = {
      id: `o${Date.now()}`,
      chargerId,
      chargerName: '充电桩',
      userId,
      userName: '用户',
      ownerId: 'o1',
      startTime: new Date().toISOString(),
      status: 'charging',
      createdAt: new Date().toISOString(),
      amount: 0,
      quantity: 0,
    };
    
    setUserOrders(prev => [newOrder, ...prev]);
    setIsLoading(false);
    return newOrder;
  }, []);

  // 完成订单
  const completeOrder = useCallback(async (orderId: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setUserOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? {
              ...order,
              status: 'completed' as OrderStatus,
              endTime: new Date().toISOString(),
              amount: Math.random() * 50 + 20,
              quantity: Math.random() * 40 + 20,
            }
          : order
      )
    );
    setIsLoading(false);
  }, []);

  // 取消订单
  const cancelOrder = useCallback(async (orderId: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setUserOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, status: 'cancelled' as OrderStatus }
          : order
      )
    );
    setIsLoading(false);
  }, []);

  // 获取订单统计
  const getOrderStats = useCallback(() => {
    const completed = userOrders.filter(o => o.status === 'completed');
    const totalAmount = completed.reduce((sum, o) => sum + (o.amount || 0), 0);
    const totalQuantity = completed.reduce((sum, o) => sum + (o.quantity || 0), 0);
    
    return {
      totalOrders: userOrders.length,
      completedOrders: completed.length,
      totalAmount,
      totalQuantity,
    };
  }, [userOrders]);

  return {
    orders: userOrders,
    isLoading,
    createOrder,
    completeOrder,
    cancelOrder,
    getOrderStats,
    chargingOrder,
  };
}
