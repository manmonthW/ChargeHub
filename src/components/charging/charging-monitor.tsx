import { useState, useEffect } from 'react';
import { Battery, Zap, Clock, DollarSign, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import type { ChargingSession } from '@/types';

interface ChargingMonitorProps {
  session: ChargingSession;
  chargerName: string;
  onComplete?: () => void;
}

export function ChargingMonitor({ session, chargerName, onComplete }: ChargingMonitorProps) {
  const [currentSession, setCurrentSession] = useState<ChargingSession>(session);
  const [isRunning, setIsRunning] = useState(true);

  // 模拟实时数据更新
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setCurrentSession(prev => {
        // 随机增加2-5%
        const increase = 2 + Math.random() * 3;
        const newLevel = Math.min(prev.currentLevel + increase, prev.targetLevel || 100);

        // 计算充电速度（3.5kW - 11kW 之间随机）
        const chargingSpeed = 3.5 + Math.random() * 7.5;

        // 更新已充电量
        const chargedAmount = prev.chargedAmount + (increase / 100 * 60); // 假设电池容量60kWh

        // 计算预估费用（暂时按1元/度计算，实际应从充电桩价格获取）
        const estimatedCost = chargedAmount * 1.0;

        // 计算剩余时间（分钟）
        const remainingPercent = (prev.targetLevel || 100) - newLevel;
        const remainingTime = chargingSpeed > 0 ? Math.ceil((remainingPercent / 100 * 60) / chargingSpeed * 60) : 0;

        const newSession: ChargingSession = {
          ...prev,
          currentLevel: newLevel,
          chargingSpeed,
          chargedAmount,
          estimatedCost,
          remainingTime,
        };

        // 检查是否达到目标电量
        if (newLevel >= (prev.targetLevel || 100) || newLevel >= 80) {
          setIsRunning(false);
          toast.success('充电完成！', {
            description: `已充至 ${newLevel.toFixed(0)}%，充电量 ${chargedAmount.toFixed(1)}kWh`,
          });
          onComplete?.();
        }

        return newSession;
      });
    }, 2000); // 每2秒更新一次

    return () => clearInterval(interval);
  }, [isRunning, onComplete]);

  // 圆形进度条的计算
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentSession.currentLevel / 100) * circumference;

  // 获取电量颜色
  const getBatteryColor = () => {
    if (currentSession.currentLevel < 20) return 'text-red-500';
    if (currentSession.currentLevel < 50) return 'text-yellow-500';
    if (currentSession.currentLevel < 80) return 'text-blue-500';
    return 'text-green-500';
  };

  const getProgressColor = () => {
    if (currentSession.currentLevel < 20) return '#ef4444';
    if (currentSession.currentLevel < 50) return '#eab308';
    if (currentSession.currentLevel < 80) return '#3b82f6';
    return '#22c55e';
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-blue-200 shadow-lg">
      <CardContent className="p-4">
        {/* 标题 */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
          <div>
            <h3 className="font-bold text-gray-800">正在充电</h3>
            <p className="text-sm text-gray-600">{chargerName}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* 圆形进度条 */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              {/* 背景圆 */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="#e5e7eb"
                strokeWidth="10"
                fill="none"
              />
              {/* 进度圆 */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke={getProgressColor()}
                strokeWidth="10"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>
            {/* 中心内容 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Battery className={`w-6 h-6 ${getBatteryColor()}`} />
              <span className="text-2xl font-bold text-gray-800">
                {currentSession.currentLevel.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* 实时数据 */}
          <div className="flex-1 space-y-3">
            {/* 充电速度 */}
            <div className="flex items-center justify-between bg-white/60 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-600">充电速度</span>
              </div>
              <span className="font-bold text-gray-800">
                {currentSession.chargingSpeed.toFixed(1)} kW
              </span>
            </div>

            {/* 已充电量 */}
            <div className="flex items-center justify-between bg-white/60 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">已充电量</span>
              </div>
              <span className="font-bold text-gray-800">
                {currentSession.chargedAmount.toFixed(1)} kWh
              </span>
            </div>

            {/* 预估费用 */}
            <div className="flex items-center justify-between bg-white/60 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">预估费用</span>
              </div>
              <span className="font-bold text-orange-600">
                ¥{currentSession.estimatedCost.toFixed(2)}
              </span>
            </div>

            {/* 剩余时间 */}
            <div className="flex items-center justify-between bg-white/60 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600">剩余时间</span>
              </div>
              <span className="font-bold text-gray-800">
                {isRunning ? `${currentSession.remainingTime} 分钟` : '已完成'}
              </span>
            </div>
          </div>
        </div>

        {/* 线性进度条（辅助显示） */}
        <div className="mt-4">
          <Progress value={currentSession.currentLevel} className="h-2" />
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>开始 (20%)</span>
            <span>目标 ({currentSession.targetLevel || 100}%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 获取正在充电的会话（模拟数据）
export const getChargingSession = (orderId: string): ChargingSession | null => {
  // 这里应该从实际的状态管理或API获取数据
  // 目前返回模拟数据
  return {
    orderId,
    currentLevel: 20,
    chargingSpeed: 7.0,
    chargedAmount: 0,
    estimatedCost: 0,
    remainingTime: 45,
    targetLevel: 80,
  };
};
