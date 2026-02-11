import { useState, useEffect } from 'react';
import { Battery, Clock, DollarSign, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// 默认电池容量（典型电动车）
const DEFAULT_BATTERY_CAPACITY = 60; // kWh

interface FeeCalculatorProps {
  price: number; // 充电桩价格（元/度）
  power: number; // 充电桩功率（kW）
  nearbyChargers?: Array<{
    name: string;
    price: number;
    distance?: string;
  }>;
}

interface CalculationResult {
  targetCharge: number; // 目标电量百分比
  currentCharge: number; // 当前电量百分比
  chargeAmount: number; // 充电电量（kWh）
  estimatedCost: number; // 预计费用（元）
  estimatedTime: number; // 预计时间（分钟）
}

export function FeeCalculator({ price, power, nearbyChargers = [] }: FeeCalculatorProps) {
  const [calcMode, setCalcMode] = useState<'percentage' | 'duration'>('percentage');
  const [currentCharge, setCurrentCharge] = useState(20);
  const [targetCharge, setTargetCharge] = useState(80);
  const [duration, setDuration] = useState(60);
  const [batteryCapacity, setBatteryCapacity] = useState(DEFAULT_BATTERY_CAPACITY);
  const [result, setResult] = useState<CalculationResult>({
    targetCharge: 80,
    currentCharge: 20,
    chargeAmount: 36,
    estimatedCost: 0,
    estimatedTime: 0,
  });

  // 计算费用
  useEffect(() => {
    let chargeAmount: number;
    let estimatedTime: number;
    let finalTargetCharge = targetCharge;

    if (calcMode === 'percentage') {
      // 按目标电量计算
      const chargePercentage = Math.max(0, targetCharge - currentCharge);
      chargeAmount = (batteryCapacity * chargePercentage) / 100;
      // 估算时间：充电电量 / 功率 * 60（分钟）
      estimatedTime = (chargeAmount / power) * 60;
    } else {
      // 按时长计算
      // 充电电量 = 功率 * 时长（小时）
      chargeAmount = power * (duration / 60);
      // 计算能达到的电量百分比
      const chargePercentage = (chargeAmount / batteryCapacity) * 100;
      finalTargetCharge = Math.min(100, currentCharge + chargePercentage);
      estimatedTime = duration;
    }

    const estimatedCost = chargeAmount * price;

    setResult({
      targetCharge: finalTargetCharge,
      currentCharge,
      chargeAmount: Math.round(chargeAmount * 10) / 10,
      estimatedCost: Math.round(estimatedCost * 100) / 100,
      estimatedTime: Math.round(estimatedTime),
    });
  }, [currentCharge, targetCharge, duration, batteryCapacity, price, power, calcMode]);

  // 计算与周边充电桩的价格对比
  const priceComparison = nearbyChargers.length > 0
    ? [
        { name: '当前充电桩', price, isCurrent: true },
        ...nearbyChargers.map(c => ({ ...c, isCurrent: false })),
      ].sort((a, b) => a.price - b.price)
    : [];

  // 获取价格优势描述
  const getPriceAdvantage = () => {
    if (priceComparison.length === 0) return null;
    const cheapest = priceComparison[0];
    if (cheapest.isCurrent) {
      const savings = priceComparison.slice(1).reduce((sum, c) => {
        const diff = c.price - price;
        return sum + diff;
      }, 0) / (priceComparison.length - 1);
      return {
        type: 'cheapest' as const,
        message: `比周边平均便宜 ¥${savings.toFixed(2)}/度`,
      };
    } else {
      const diff = price - cheapest.price;
      return {
        type: 'higher' as const,
        message: `比最贵的高 ¥${diff.toFixed(2)}/度`,
      };
    }
  };

  const priceAdvantage = getPriceAdvantage();

  return (
    <div className="space-y-4">
      {/* 费用计算器 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            充电费用计算器
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Tabs value={calcMode} onValueChange={(v) => setCalcMode(v as 'percentage' | 'duration')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="percentage">按电量计算</TabsTrigger>
              <TabsTrigger value="duration">按时长计算</TabsTrigger>
            </TabsList>

            {calcMode === 'percentage' ? (
              <div className="space-y-5">
                {/* 当前电量滑块 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-1 text-gray-600">
                      <Battery className="w-4 h-4" />
                      当前电量
                    </label>
                    <span className="font-medium text-blue-600">{currentCharge}%</span>
                  </div>
                  <Slider
                    value={[currentCharge]}
                    onValueChange={(v) => setCurrentCharge(v[0])}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* 目标电量滑块 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-1 text-gray-600">
                      <Zap className="w-4 h-4" />
                      目标电量
                    </label>
                    <span className="font-medium text-green-600">{targetCharge}%</span>
                  </div>
                  <Slider
                    value={[targetCharge]}
                    onValueChange={(v) => setTargetCharge(v[0])}
                    min={currentCharge + 5}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{currentCharge + 5}%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* 电池容量输入 */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-600 block">电池容量（kWh）</label>
                  <Input
                    type="number"
                    value={batteryCapacity}
                    onChange={(e) => setBatteryCapacity(Number(e.target.value) || DEFAULT_BATTERY_CAPACITY)}
                    min={20}
                    max={150}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-400">典型电动车电池容量约 40-100 kWh</p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* 当前电量 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-1 text-gray-600">
                      <Battery className="w-4 h-4" />
                      当前电量
                    </label>
                    <span className="font-medium text-blue-600">{currentCharge}%</span>
                  </div>
                  <Slider
                    value={[currentCharge]}
                    onValueChange={(v) => setCurrentCharge(v[0])}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* 充电时长 */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-600 block">充电时长（分钟）</label>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[duration]}
                      onValueChange={(v) => setDuration(v[0])}
                      min={15}
                      max={480}
                      step={15}
                      className="flex-1"
                    />
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-3 py-2 min-w-[100px]">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{duration} 分钟</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>15分钟</span>
                    <span>4小时</span>
                  </div>
                </div>

                {/* 电池容量输入 */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-600 block">电池容量（kWh）</label>
                  <Input
                    type="number"
                    value={batteryCapacity}
                    onChange={(e) => setBatteryCapacity(Number(e.target.value) || DEFAULT_BATTERY_CAPACITY)}
                    min={20}
                    max={150}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </Tabs>

          {/* 计算结果 */}
          <div className="mt-5 p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl border border-blue-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3">预计充电详情</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-500">充电量</span>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {result.chargeAmount}
                  <span className="text-xs font-normal ml-0.5">kWh</span>
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-500">预计费用</span>
                </div>
                <p className="text-lg font-bold text-green-600">
                  ¥{result.estimatedCost}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-gray-500">预计时间</span>
                </div>
                <p className="text-lg font-bold text-orange-600">
                  {result.estimatedTime}
                  <span className="text-xs font-normal ml-0.5">分钟</span>
                </p>
              </div>
            </div>
            {calcMode === 'duration' && (
              <div className="mt-3 pt-3 border-t border-blue-200 text-center">
                <span className="text-sm text-gray-600">
                  充电后预计电量：
                  <span className="font-bold text-green-600">{result.targetCharge.toFixed(0)}%</span>
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 价格对比 */}
      {priceComparison.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              周边价格对比
              {priceAdvantage && (
                <Badge variant={priceAdvantage.type === 'cheapest' ? 'default' : 'secondary'} className="ml-2">
                  {priceAdvantage.message}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2">
              {priceComparison.map((charger, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    charger.isCurrent
                      ? 'bg-blue-50 border-2 border-blue-300 shadow-sm'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <Badge variant="default" className="text-xs">
                        最低价
                      </Badge>
                    )}
                    {charger.isCurrent && !priceComparison[0].isCurrent && (
                      <Badge variant="outline" className="text-xs">
                        当前
                      </Badge>
                    )}
                    <span className={`text-sm ${charger.isCurrent ? 'font-medium' : ''}`}>
                      {charger.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {charger.distance && (
                      <span className="text-xs text-gray-400">{charger.distance}</span>
                    )}
                    <span className={`font-bold ${charger.isCurrent ? 'text-blue-600' : 'text-gray-700'}`}>
                      ¥{charger.price.toFixed(2)}
                      <span className="text-xs font-normal text-gray-400">/度</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {/* 价格差异说明 */}
            {priceAdvantage && priceAdvantage.type === 'cheapest' && priceComparison.length > 1 && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg text-sm text-green-700">
                <span className="font-medium">价格优势：</span>
                以充电 {result.chargeAmount} kWh 计算，可节省约
                <span className="font-bold">
                  ¥{(((priceComparison[1]?.price ?? price) - price) * result.chargeAmount).toFixed(2)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// 需要导入图标
function Calculator({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="16" x2="16" y1="14" y2="18" />
      <path d="M16 10h.01" />
      <path d="M12 10h.01" />
      <path d="M8 10h.01" />
      <path d="M12 14h.01" />
      <path d="M8 14h.01" />
      <path d="M12 18h.01" />
      <path d="M8 18h.01" />
    </svg>
  );
}

function BarChart3({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 3v18h18" />
      <path d="M19 9l-5 5-4-4-3 3" />
    </svg>
  );
}
