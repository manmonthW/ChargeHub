// 用户类型
export type UserRole = 'owner' | 'user';

export interface User {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
  favorites?: string[]; // 收藏的充电桩ID列表
}

// 收藏类型
export interface Favorite {
  id: string;
  userId: string;
  chargerId: string;
  chargerName: string;
  chargerAddress: string;
  createdAt: string;
}

// 充电桩类型
export type ChargerType = 'slow' | 'fast';
export type ChargerStatus = 'available' | 'in_use' | 'offline';

export interface Charger {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  name: string;
  type: ChargerType;
  power: number; // kW
  price: number; // 元/度
  status: ChargerStatus;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  description?: string;
  images?: string[];
  rating: number;
  orderCount: number;
  createdAt: string;
}

// 订单类型
export type OrderStatus = 'pending' | 'charging' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  chargerId: string;
  chargerName: string;
  userId: string;
  userName: string;
  ownerId: string;
  startTime: string;
  endTime?: string;
  duration?: number; // 分钟
  amount: number; // 金额
  quantity: number; // 充电度数
  status: OrderStatus;
  createdAt: string;
}

// 社区类型
export interface Community {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  chargerCount: number;
}

// 搜索筛选
export interface SearchFilters {
  type?: ChargerType;
  minPrice?: number;
  maxPrice?: number;
  onlyAvailable?: boolean;
}

// 评价类型
export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  chargerId: string;
  chargerName: string;
  orderId: string; // 关联订单，确保只有实际使用者可评价
  rating: number; // 1-5 星
  content: string; // 评价内容
  images?: string[]; // 评价图片（可选）
  createdAt: string;
}

// 评价统计
export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// 充电会话状态（用于实时监控）
export interface ChargingSession {
  orderId: string;
  currentLevel: number; // 当前电量百分比 0-100
  chargingSpeed: number; // 充电速度 kW
  chargedAmount: number; // 已充电量 kWh
  estimatedCost: number; // 预估费用 元
  remainingTime: number; // 剩余时间 分钟
  targetLevel?: number; // 目标电量（可选，默认100）
}
