import { useState, useCallback } from 'react';
import type { User, UserRole } from '@/types';
import { currentUser, ownerUser } from '@/data/mock';

export function useAuth() {
  const [user, setUser] = useState<User | null>(currentUser);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (_phone: string, role: UserRole = 'user') => {
    setIsLoading(true);
    // 模拟登录
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(role === 'owner' ? ownerUser : currentUser);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const switchRole = useCallback(() => {
    setUser(prev => {
      if (!prev) return currentUser;
      return prev.role === 'user' ? ownerUser : currentUser;
    });
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    switchRole,
  };
}
