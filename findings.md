# 研究发现: 用户评价功能

## 项目分析

### 现有数据结构
- **位置**: `src/types/index.ts`
- **当前模型**: User, Charger, Order, Community
- **数据源**: `src/data/mock.ts`

### 技术栈
- **框架**: React + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **状态管理**: React Hooks (useState)
- **地图**: 高德地图 API

## 设计决策

### Review 数据模型设计
```typescript
interface Review {
  id: string;
  userId: string;
  chargerId: string;
  orderId: string;  // 关联订单，确保只有实际使用者可评价
  rating: number;   // 1-5 星
  content: string;  // 评价内容
  createdAt: Date;
  userName: string;
  userAvatar?: string;
}
```

### 代码分析结果 (阶段 1 完成)

**现有类型定义** (`src/types/index.ts`):
- ✓ User 接口完整 (id, name, phone, avatar, role)
- ✓ Charger 接口已有 `rating: number` 字段
- ✓ Order 接口完整，支持关联评价
- ⚠️ **缺失**: Review 接口需要新增

**现有数据结构** (`src/data/mock.ts`):
- ✓ 充电桩数据已包含评分 (rating: 4.5-4.9)
- ✓ 订单数据完整，包含已完成订单
- ⚠️ **缺失**: 具体评价内容数据
- ⚠️ **缺失**: 评价列表数据

**集成点分析**:
- 充电桩详情页: 需显示评价列表和评分
- 订单页面: 已完成订单可添加评价
- 充电桩卡片: 显示平均评分

### UI 组件结构
```
src/components/reviews/
├── rating-display.tsx   - 星级显示组件
├── review-card.tsx      - 单个评价卡片
├── review-stats.tsx     - 评价统计组件
├── review-list.tsx      - 评价列表主组件
├── review-form.tsx      - 评价表单组件
└── index.ts             - 组件导出
```

### 组件功能说明 (阶段 3 完成)

**RatingDisplay** (`rating-display.tsx`):
- 显示 1-5 星评分
- 支持不同尺寸
- 可选择显示/隐藏数值

**ReviewCard** (`review-card.tsx`):
- 显示单条评价完整信息
- 包含用户头像、姓名、时间
- 显示星级和评价内容
- 支持评价图片展示

**ReviewStats** (`review-stats.tsx`):
- 显示平均评分
- 显示评价总数
- 显示评分分布条形图

**ReviewList** (`review-list.tsx`):
- 主容器组件
- 集成统计和列表
- 支持排序（最新/好评/差评）

**ReviewForm** (`review-form.tsx`):
- 交互式星级选择
- 评价内容输入
- 表单验证（最少10字）

## 参考资源
- shadcn/ui 评价组件示例
- 高德地图 POI 评价功能

## 待确认事项
- [x] 是否需要评价回复功能 → 未实现
- [x] 评价是否需要图片上传 → Review接口已支持
- [x] 是否需要评价筛选/排序 → 已实现（最新/好评/差评）

## 集成点 (阶段 4 完成)

**ChargerDetail.tsx 修改**:
- 添加评价区域卡片
- 检测已完成订单，显示"写评价"按钮
- 集成 ReviewList 显示评价列表
- 集成 ReviewForm 允许提交评价
- 提交后使用 toast 提示成功
