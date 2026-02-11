import { useState, useCallback, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { MapView } from '@/sections/MapView';
import { ChargerDetail } from '@/sections/ChargerDetail';
import { OwnerDashboard } from '@/sections/OwnerDashboard';
import { UserProfile } from '@/sections/UserProfile';
import { BottomNav } from '@/sections/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useChargers } from '@/hooks/useChargers';
import { useOrders } from '@/hooks/useOrders';
import { getOwnerChargers, updateChargersLocation } from '@/data/mock';
import type { Charger } from '@/types';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [dynamicChargers, setDynamicChargers] = useState<Charger[] | null>(null);

  const { user, switchRole, logout } = useAuth();
  const {
    chargers,
    filters,
    selectedCharger,
    isDetailOpen,
    viewChargerDetail,
    closeDetail,
    updateFilters
  } = useChargers();

  const {
    orders,
    createOrder,
    getOrderStats,
    chargingOrder
  } = useOrders(user?.id || '', user?.role);

  const isOwner = user?.role === 'owner';

  // 获取桩主相关数据
  const ownerChargers = isOwner && user ? getOwnerChargers(user.id) : [];
  const orderStats = getOrderStats();

  // 处理充电桩位置更新
  const handleChargersUpdate = useCallback((updatedChargers: Charger[]) => {
    setDynamicChargers(updatedChargers);
  }, []);

  // 使用动态更新的充电桩数据或原始数据
  const displayChargers = dynamicChargers || chargers;

  // 页面加载时自动获取位置并更新充电桩
  useEffect(() => {
    const timer = setTimeout(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log('[App] 获取用户位置:', latitude, longitude);
            // 更新充电桩位置到用户周边
            const updatedChargers = updateChargersLocation(latitude, longitude);
            handleChargersUpdate(updatedChargers);
            toast.success(`已定位到当前位置，发现 ${updatedChargers.length} 个充电桩`);
          },
          (error) => {
            console.warn('[App] 定位失败:', error.message);
            // 定位失败时使用默认位置，不显示错误提示
          }
        );
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [handleChargersUpdate]);

  // 处理预约
  const handleBook = async (chargerId: string) => {
    if (!user) {
      toast.error('请先登录');
      return;
    }
    
    try {
      await createOrder(chargerId, user.id);
      toast.success('预约成功！请在30分钟内到达');
    } catch (error) {
      toast.error('预约失败，请重试');
    }
  };

  // 处理添加充电桩
  const handleAddCharger = () => {
    toast.info('添加充电桩功能开发中...');
  };

  // 处理编辑充电桩
  const handleEditCharger = (_chargerId: string) => {
    toast.info('编辑功能开发中...');
  };

  // 处理上下线充电桩
  const handleToggleCharger = (_chargerId: string) => {
    toast.success('状态切换成功');
  };

  // 渲染内容区域
  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        return (
          <MapView
            chargers={displayChargers}
            onViewDetail={viewChargerDetail}
            filters={filters}
            onFilterChange={updateFilters}
            onChargersUpdate={handleChargersUpdate}
          />
        );
      case 'owner':
        return isOwner ? (
          <OwnerDashboard
            chargers={ownerChargers}
            orders={orders}
            onAddCharger={handleAddCharger}
            onEditCharger={handleEditCharger}
            onToggleCharger={handleToggleCharger}
          />
        ) : null;
      case 'profile':
        return (
          <UserProfile
            user={user!}
            orderCount={orders.length}
            totalSpent={orderStats.totalAmount}
            onSwitchRole={switchRole}
            onLogout={logout}
            chargingOrderId={chargingOrder?.id}
            chargerName={chargingOrder?.chargerName}
            orders={orders}
            onBookCharger={handleBook}
            onNavigateToCharger={viewChargerDetail}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast通知 */}
      <Toaster position="top-center" richColors />

      {/* 主内容区域 */}
      <main className="pb-20">
        {renderContent()}
      </main>

      {/* 底部导航 */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOwner={isOwner}
      />

      {/* 充电桩详情弹窗 */}
      <ChargerDetail
        charger={selectedCharger}
        isOpen={isDetailOpen}
        onClose={closeDetail}
        onBook={handleBook}
      />
    </div>
  );
}

export default App;
