import { useState, useCallback, useMemo } from 'react';
import type { Charger, SearchFilters } from '@/types';
import { chargers, getChargerById } from '@/data/mock';

export function useChargers() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 筛选充电桩
  const filteredChargers = useMemo(() => {
    return chargers.filter(charger => {
      if (filters.type && charger.type !== filters.type) return false;
      if (filters.minPrice && charger.price < filters.minPrice) return false;
      if (filters.maxPrice && charger.price > filters.maxPrice) return false;
      if (filters.onlyAvailable && charger.status !== 'available') return false;
      return true;
    });
  }, [filters]);

  // 查看充电桩详情
  const viewChargerDetail = useCallback((chargerId: string) => {
    const charger = getChargerById(chargerId);
    if (charger) {
      setSelectedCharger(charger);
      setIsDetailOpen(true);
    }
  }, []);

  // 关闭详情
  const closeDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedCharger(null);
  }, []);

  // 更新筛选条件
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // 清除筛选
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    chargers: filteredChargers,
    allChargers: chargers,
    filters,
    selectedCharger,
    isDetailOpen,
    viewChargerDetail,
    closeDetail,
    updateFilters,
    clearFilters,
  };
}
