import type { User, Charger, Order, Community, Review } from '@/types';

// 模拟当前用户
export const currentUser: User = {
  id: 'u1',
  name: '张小明',
  phone: '138****1234',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  role: 'user',
  createdAt: '2025-01-01',
};

// 模拟桩主用户
export const ownerUser: User = {
  id: 'o1',
  name: '李大叔',
  phone: '139****5678',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  role: 'owner',
  createdAt: '2025-01-01',
};

// 充电桩相对位置偏移量（约 0.01 度 = 1 公里）
// 用于根据用户当前位置动态生成充电桩位置

// 根据用户位置生成充电桩位置
// 大约 0.01 度 = 1 公里, 0.001 度 = 100 米
export const generateChargersNearLocation = (userLat: number, userLng: number): Charger[] => {
  // 随机种子函数，用于生成一致的"随机"数据
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // 桩主数据
  const owners = [
    { id: 'o1', name: '李大叔', avatar: 'Aneka' },
    { id: 'o2', name: '王女士', avatar: 'Bella' },
    { id: 'o3', name: '赵先生', avatar: 'John' },
    { id: 'o4', name: '陈先生', avatar: 'Carl' },
    { id: 'o5', name: '刘阿姨', avatar: 'Lucy' },
    { id: 'o6', name: '张哥', avatar: 'Mike' },
    { id: 'o7', name: '孙姐', avatar: 'Emma' },
    { id: 'o8', name: '周师傅', avatar: 'Tom' },
  ];

  // 地点名称前缀
  const locationPrefixes = [
    '阳光小区', '幸福花园', '绿城广场', '金域名苑', '碧桂园',
    '万科城', '保利国际', '恒大华府', '龙湖地产', '中海地产'
  ];

  // 停车场位置
  const parkingAreas = [
    '地下停车场A区', '地下停车场B区', '地下停车场C区',
    '地面停车场', '立体停车场', '路边停车位'
  ];

  // 描述模板
  const descriptions = [
    '设备全新，充电稳定，支持预约，欢迎随时联系',
    '私人充电桩共享，白天可用，晚上更优惠',
    '大功率快充，30分钟可充80%，赶时间首选',
    '慢充桩，适合过夜充电，价格实惠',
    '24小时可用，设备维护良好，车位宽敞',
    '新装充电桩，欢迎大家体验，首次优惠',
    '车位好找，充电速度快，服务态度好',
    '周末全天可用，工作日晚上6点后可用'
  ];

  const chargers: Charger[] = [];

  // 生成 12-15 个充电桩
  const count = 12 + Math.floor(seededRandom(userLat * 1000) * 4);

  for (let i = 0; i < count; i++) {
    const seed = i + 1;
    const angle = (seed / count) * Math.PI * 2 + seededRandom(seed) * 0.5;
    // 距离 150米 - 800米 (0.0015 - 0.008 度)
    const distance = 0.0015 + seededRandom(seed + 100) * 0.0065;
    const latOffset = Math.cos(angle) * distance;
    const lngOffset = Math.sin(angle) * distance;

    const isFast = seededRandom(seed + 200) > 0.4;
    const ownerIndex = Math.floor(seededRandom(seed + 300) * owners.length);
    const owner = owners[ownerIndex];

    const power = isFast ? (7 + Math.floor(seededRandom(seed + 400) * 7)) : 3.5;
    const price = isFast ? (1.0 + seededRandom(seed + 500) * 0.6) : (0.6 + seededRandom(seed + 500) * 0.4);

    const locationIndex = Math.floor(seededRandom(seed + 600) * locationPrefixes.length);
    const areaIndex = Math.floor(seededRandom(seed + 700) * parkingAreas.length);
    const descIndex = Math.floor(seededRandom(seed + 800) * descriptions.length);

    const estimatedDistance = Math.round(distance * 111000); // 米

    chargers.push({
      id: `c${i + 1}`,
      ownerId: owner.id,
      ownerName: owner.name,
      ownerAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${owner.avatar}`,
      name: `${locationPrefixes[locationIndex]}${parkingAreas[areaIndex]}`,
      type: isFast ? 'fast' : 'slow',
      power,
      price: Math.round(price * 100) / 100,
      status: seededRandom(seed + 900) > 0.3 ? 'available' : (seededRandom(seed + 910) > 0.5 ? 'in_use' : 'offline'),
      address: `${locationPrefixes[locationIndex]}${parkingAreas[areaIndex]}`,
      location: {
        lat: userLat + latOffset,
        lng: userLng + lngOffset,
      },
      description: `距离您约${estimatedDistance}米，${descriptions[descIndex]}`,
      rating: Math.round((3.5 + seededRandom(seed + 1000) * 1.5) * 10) / 10,
      orderCount: Math.floor(5 + seededRandom(seed + 1100) * 95),
      createdAt: `2025-01-${String(1 + Math.floor(seededRandom(seed + 1200) * 28)).padStart(2, '0')}`,
    });
  }

  // 按距离排序
  return chargers.sort((a, b) => {
    const distA = Math.hypot(a.location.lat - userLat, a.location.lng - userLng);
    const distB = Math.hypot(b.location.lat - userLat, b.location.lng - userLng);
    return distA - distB;
  });
};

// 默认充电桩（北京朝阳）
export const defaultChargers: Charger[] = generateChargersNearLocation(39.9042, 116.4074);

// 当前使用的充电桩数据（会被动态更新）
export let chargers: Charger[] = [...defaultChargers];

// 更新充电桩位置
export const updateChargersLocation = (userLat: number, userLng: number) => {
  chargers = generateChargersNearLocation(userLat, userLng);
};

// 模拟社区
export const communities: Community[] = [
  {
    id: 'c1',
    name: '阳光花园小区',
    address: '附近阳光大街',
    location: { lat: 39.9042, lng: 116.4074 },
    chargerCount: 8,
  },
  {
    id: 'c2',
    name: '万科金色家园',
    address: '附近建国路',
    location: { lat: 39.9156, lng: 116.4184 },
    chargerCount: 5,
  },
];

// 模拟订单
export const orders: Order[] = [
  {
    id: 'o1',
    chargerId: 'c1',
    chargerName: '家用充电桩A01',
    userId: 'u1',
    userName: '张小明',
    ownerId: 'o1',
    startTime: '2025-01-29 09:00',
    endTime: '2025-01-29 11:30',
    duration: 150,
    amount: 42.5,
    quantity: 35.4,
    status: 'completed',
    createdAt: '2025-01-29 08:55',
  },
  {
    id: 'o2',
    chargerId: 'c2',
    chargerName: '家用充电桩B02',
    userId: 'u1',
    userName: '张小明',
    ownerId: 'o2',
    startTime: '2025-01-28 20:00',
    endTime: '2025-01-29 06:00',
    duration: 600,
    amount: 48.0,
    quantity: 60.0,
    status: 'completed',
    createdAt: '2025-01-28 19:50',
  },
  {
    id: 'o3',
    chargerId: 'c3',
    chargerName: '家用快充桩A03',
    userId: 'u1',
    userName: '张小明',
    ownerId: 'o3',
    startTime: '2025-01-30 14:00',
    endTime: undefined,
    duration: undefined,
    amount: 0,
    quantity: 0,
    status: 'charging',
    createdAt: '2025-01-30 13:55',
  },
];

// 桩主的订单
export const ownerOrders: Order[] = [
  {
    id: 'oo1',
    chargerId: 'c1',
    chargerName: '家用充电桩A01',
    userId: 'u2',
    userName: '王小红',
    ownerId: 'o1',
    startTime: '2025-01-30 10:00',
    endTime: undefined,
    duration: undefined,
    amount: 0,
    quantity: 0,
    status: 'charging',
    createdAt: '2025-01-30 09:55',
  },
  {
    id: 'oo2',
    chargerId: 'c1',
    chargerName: '家用充电桩A01',
    userId: 'u3',
    userName: '刘大伟',
    ownerId: 'o1',
    startTime: '2025-01-29 15:00',
    endTime: '2025-01-29 17:30',
    duration: 150,
    amount: 38.5,
    quantity: 32.1,
    status: 'completed',
    createdAt: '2025-01-29 14:50',
  },
  {
    id: 'oo3',
    chargerId: 'c5',
    chargerName: '家用充电桩A02',
    userId: 'u4',
    userName: '赵小芳',
    ownerId: 'o1',
    startTime: '2025-01-28 19:00',
    endTime: '2025-01-28 22:00',
    duration: 180,
    amount: 45.0,
    quantity: 40.9,
    status: 'completed',
    createdAt: '2025-01-28 18:50',
  },
];

// 获取可用充电桩
export const getAvailableChargers = () => chargers.filter(c => c.status === 'available');

// 根据ID获取充电桩
export const getChargerById = (id: string) => chargers.find(c => c.id === id);

// 获取用户的订单
export const getUserOrders = (userId: string) => orders.filter(o => o.userId === userId);

// 获取桩主的订单
export const getOwnerOrders = (ownerId: string) => ownerOrders.filter(o => o.ownerId === ownerId);

// 获取桩主的充电桩
export const getOwnerChargers = (ownerId: string) => chargers.filter(c => c.ownerId === ownerId);

// ============ 评价数据 ============

// 模拟评价数据
export const reviews: Review[] = [
  {
    id: 'r1',
    userId: 'u2',
    userName: '王小红',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
    chargerId: 'c1',
    chargerName: '家用充电桩A01',
    orderId: 'o_user_1',
    rating: 5,
    content: '非常好用！充电速度快，桩主很热情，位置也很好找。地下停车场B区很好停车，强烈推荐！',
    createdAt: '2025-01-28 18:00',
  },
  {
    id: 'r2',
    userId: 'u3',
    userName: '刘大伟',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
    chargerId: 'c1',
    chargerName: '家用充电桩A01',
    orderId: 'o_user_2',
    rating: 5,
    content: '设备很新，充电稳定。李大叔人很好，还详细教我怎么使用。白天充电很方便，下次还会来。',
    createdAt: '2025-01-27 14:30',
  },
  {
    id: 'r3',
    userId: 'u4',
    userName: '赵小芳',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucy',
    chargerId: 'c1',
    chargerName: '家用充电桩A01',
    orderId: 'o_user_3',
    rating: 4,
    content: '整体不错，充电速度够快，价格也合理。就是周末人多需要等一会儿，建议提前预约。',
    createdAt: '2025-01-26 10:15',
  },
  {
    id: 'r4',
    userId: 'u5',
    userName: '孙大明',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    chargerId: 'c2',
    chargerName: '家用充电桩B02',
    orderId: 'o_user_4',
    rating: 4,
    content: '慢充但是价格便宜，适合过夜充电。王女士的桩子维护得很好，位置也不错。',
    createdAt: '2025-01-25 20:00',
  },
  {
    id: 'r5',
    userId: 'u6',
    userName: '周小花',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    chargerId: 'c2',
    chargerName: '家用充电桩B02',
    orderId: 'o_user_5',
    rating: 5,
    content: '第一次用私桩体验很棒！比外面充电桩便宜多了，环境也安静，晚上充电特别划算。',
    createdAt: '2025-01-24 21:30',
  },
  {
    id: 'r6',
    userId: 'u7',
    userName: '吴小军',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom',
    chargerId: 'c3',
    chargerName: '家用快充桩A03',
    orderId: 'o_user_6',
    rating: 5,
    content: '大功率快充太爽了！30分钟就从20%充到80%，赶时间的时候特别有用。赵先生很专业。',
    createdAt: '2025-01-23 16:45',
  },
  {
    id: 'r7',
    userId: 'u8',
    userName: '郑小丽',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
    chargerId: 'c3',
    chargerName: '家用快充桩A03',
    orderId: 'o_user_7',
    rating: 5,
    content: '商业区位置方便，逛个街顺便就充好了。设备是最新的，充电效率很高，值得推荐！',
    createdAt: '2025-01-22 12:00',
  },
  {
    id: 'r8',
    userId: 'u9',
    userName: '冯小强',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel',
    chargerId: 'c3',
    chargerName: '家用快充桩A03',
    orderId: 'o_user_8',
    rating: 5,
    content: '体验超出预期！充电快，服务好，价格合理。以后就认准这家了。',
    createdAt: '2025-01-21 15:20',
  },
  {
    id: 'r9',
    userId: 'u10',
    userName: '陈小梅',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia',
    chargerId: 'c4',
    chargerName: '家用充电桩C01',
    orderId: 'o_user_9',
    rating: 4,
    content: '新装的设备确实好用，充电稳定。陈先生很耐心讲解了使用方法，整体很满意。',
    createdAt: '2025-01-20 09:30',
  },
  {
    id: 'r10',
    userId: 'u11',
    userName: '林小东',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam',
    chargerId: 'c5',
    chargerName: '家用充电桩A02',
    orderId: 'o_user_10',
    rating: 5,
    content: '周末来充电正好，停车位充足。李大叔的第二个桩子一样好用，7kW功率家用足够了。',
    createdAt: '2025-01-19 11:00',
  },
];

// 获取充电桩的所有评价
export const getChargerReviews = (chargerId: string) => {
  return reviews.filter(r => r.chargerId === chargerId);
};

// 获取充电桩的评价统计
export const getChargerReviewStats = (chargerId: string) => {
  const chargerReviews = getChargerReviews(chargerId);
  if (chargerReviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const totalRating = chargerReviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = Math.round((totalRating / chargerReviews.length) * 10) / 10;

  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  chargerReviews.forEach(r => {
    ratingDistribution[r.rating as keyof typeof ratingDistribution]++;
  });

  return {
    averageRating,
    totalReviews: chargerReviews.length,
    ratingDistribution,
  };
};

// 检查用户是否已评价某订单
export const hasUserReviewedOrder = (userId: string, orderId: string) => {
  return reviews.some(r => r.userId === userId && r.orderId === orderId);
};

// 添加新评价
export const addReview = (review: Omit<Review, 'id' | 'createdAt'>) => {
  const newReview: Review = {
    ...review,
    id: `r${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  reviews.push(newReview);

  // 更新充电桩的平均评分
  const stats = getChargerReviewStats(review.chargerId);
  const charger = chargers.find(c => c.id === review.chargerId);
  if (charger) {
    charger.rating = stats.averageRating;
    charger.orderCount = stats.totalReviews;
  }

  return newReview;
};
