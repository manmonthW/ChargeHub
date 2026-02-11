import { useState, useEffect, useCallback } from 'react';
import type { Favorite } from '@/types';

const FAVORITES_STORAGE_KEY = 'share_charge_favorites';

interface StoredFavorite {
  chargerId: string;
  chargerName: string;
  chargerAddress: string;
  createdAt: string;
}

export function useFavorites(userId?: string) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 从 localStorage 加载收藏数据
  useEffect(() => {
    const loadFavorites = () => {
      try {
        const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (stored) {
          const data: Record<string, StoredFavorite[]> = JSON.parse(stored);
          const userFavorites = data[userId || 'default'] || [];
          setFavorites(
            userFavorites.map((fav, index) => ({
              id: `fav_${userId}_${index}`,
              userId: userId || 'default',
              ...fav,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to load favorites:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadFavorites();
  }, [userId]);

  // 保存到 localStorage
  const saveFavorites = useCallback(
    (newFavorites: Favorite[]) => {
      try {
        const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
        const data: Record<string, StoredFavorite[]> = stored ? JSON.parse(stored) : {};
        data[userId || 'default'] = newFavorites.map(
          ({ chargerId, chargerName, chargerAddress, createdAt }) => ({
            chargerId,
            chargerName,
            chargerAddress,
            createdAt,
          })
        );
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('Failed to save favorites:', error);
      }
    },
    [userId]
  );

  // 添加收藏
  const addFavorite = useCallback(
    (chargerId: string, chargerName: string, chargerAddress: string) => {
      if (!userId || isFavorite(chargerId)) return;

      const newFavorite: Favorite = {
        id: `fav_${userId}_${Date.now()}`,
        userId,
        chargerId,
        chargerName,
        chargerAddress,
        createdAt: new Date().toISOString(),
      };

      const newFavorites = [...favorites, newFavorite];
      setFavorites(newFavorites);
      saveFavorites(newFavorites);
    },
    [favorites, userId, saveFavorites]
  );

  // 取消收藏
  const removeFavorite = useCallback(
    (chargerId: string) => {
      const newFavorites = favorites.filter(fav => fav.chargerId !== chargerId);
      setFavorites(newFavorites);
      saveFavorites(newFavorites);
    },
    [favorites, saveFavorites]
  );

  // 检查是否已收藏
  const isFavorite = useCallback(
    (chargerId: string) => {
      return favorites.some(fav => fav.chargerId === chargerId);
    },
    [favorites]
  );

  // 切换收藏状态
  const toggleFavorite = useCallback(
    (chargerId: string, chargerName: string, chargerAddress: string) => {
      if (isFavorite(chargerId)) {
        removeFavorite(chargerId);
        return false;
      } else {
        addFavorite(chargerId, chargerName, chargerAddress);
        return true;
      }
    },
    [addFavorite, removeFavorite, isFavorite]
  );

  // 获取收藏列表
  const getFavorites = useCallback(() => {
    return favorites;
  }, [favorites]);

  // 获取收藏的充电桩ID列表
  const getFavoriteIds = useCallback(() => {
    return favorites.map(fav => fav.chargerId);
  }, [favorites]);

  return {
    favorites,
    isLoaded,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavorites,
    getFavoriteIds,
  };
}
