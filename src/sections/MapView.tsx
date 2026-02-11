import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Navigation, Battery, Filter, List, Map as MapIcon, AlertCircle, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { chargers as defaultChargers, updateChargersLocation } from '@/data/mock';
import { smartNavigate } from '@/lib/navigation';
import type { Charger } from '@/types';

interface MapViewProps {
  chargers: Charger[];
  onViewDetail: (chargerId: string) => void;
  filters: {
    onlyAvailable?: boolean;
    type?: 'slow' | 'fast';
  };
  onFilterChange: (filters: { onlyAvailable?: boolean; type?: 'slow' | 'fast' }) => void;
  onChargersUpdate?: (chargers: Charger[]) => void;
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  switch (status) {
    case 'available':
      return '#22c55e';
    case 'in_use':
      return '#3b82f6';
    default:
      return '#9ca3af';
  }
};

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'available':
      return '可用';
    case 'in_use':
      return '充电中';
    default:
      return '离线';
  }
};

// 创建当前位置标记（脉冲效果）
const createLocationMarkerContent = (): HTMLElement => {
  const container = document.createElement('div');
  container.style.cssText = `
    position: relative;
    width: 24px;
    height: 24px;
  `;
  
  const pulse = document.createElement('div');
  pulse.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    border: 3px solid #3b82f6;
    border-radius: 50%;
    opacity: 0.6;
    animation: location-pulse 2s ease-out infinite;
  `;
  
  const center = document.createElement('div');
  center.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 16px;
    height: 16px;
    background: #3b82f6;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    z-index: 2;
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes location-pulse {
      0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; }
      100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
    }
  `;
  
  container.appendChild(style);
  container.appendChild(pulse);
  container.appendChild(center);
  
  return container;
};

export function MapView({ chargers, onViewDetail, filters, onFilterChange, onChargersUpdate }: MapViewProps) {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isLocating, setIsLocating] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [localChargers, setLocalChargers] = useState<Charger[]>(chargers);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const locationMarkerRef = useRef<any>(null);

  // 等待 AMap 加载完成
  const waitForAMap = useCallback((): Promise<typeof window.AMap> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 100;
      
      const check = () => {
        attempts++;
        if (typeof window.AMap !== 'undefined') {
          resolve(window.AMap);
        } else if (attempts >= maxAttempts) {
          reject(new Error(`高德地图加载超时 (${attempts}次尝试)`));
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }, []);

  // 更新充电桩位置并刷新数据
  const updateChargersNearPosition = useCallback((lat: number, lng: number) => {
    updateChargersLocation(lat, lng);
    const newChargers = [...defaultChargers];
    setLocalChargers(newChargers);
    onChargersUpdate?.(newChargers);
    return newChargers;
  }, [onChargersUpdate]);

  // 初始化地图
  useEffect(() => {
    if (!mapContainerRef.current || viewMode !== 'map') return;

    let isMounted = true;

    const initMap = async () => {
      try {
        setIsMapLoading(true);
        setMapError(null);
        setDebugInfo('开始初始化地图...');

        const container = mapContainerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          setDebugInfo(prev => prev + `\n容器尺寸: ${rect.width}x${rect.height}`);
          if (rect.width === 0 || rect.height === 0) {
            throw new Error('地图容器尺寸为0，请检查样式设置');
          }
        }
        
        setDebugInfo(prev => prev + '\n等待高德地图加载...');
        
        const AMap = await waitForAMap();
        
        if (!isMounted || !mapContainerRef.current) return;

        setDebugInfo(prev => prev + '\n高德地图已加载');

        const center: [number, number] = currentPosition || [116.4074, 39.9042];

        setDebugInfo(prev => prev + '\n创建地图实例...');
        
        const map = new AMap.Map(mapContainerRef.current, {
          center: center,
          zoom: 15,
          viewMode: '2D',
        });

        mapRef.current = map;
        setDebugInfo(prev => prev + '\n地图实例创建成功');

        // 如果有当前位置，添加位置标记
        if (currentPosition) {
          const currentPositionMarker = new AMap.Marker({
            position: currentPosition,
            content: createLocationMarkerContent(),
            offset: new AMap.Pixel(-12, -12),
            zIndex: 100,
          });
          map.add(currentPositionMarker);
          locationMarkerRef.current = currentPositionMarker;
        }

        // 添加充电桩标记
        updateMarkers(localChargers, AMap);
        setDebugInfo(prev => prev + '\n充电桩标记已添加');

        setIsMapLoading(false);
        setDebugInfo(prev => prev + '\n地图初始化完成!');
      } catch (error) {
        console.error('[Map] 地图初始化失败:', error);
        if (isMounted) {
          const errorMsg = error instanceof Error ? error.message : '地图加载失败';
          setMapError(errorMsg);
          setDebugInfo(prev => prev + `\n错误: ${errorMsg}`);
          setIsMapLoading(false);
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, [viewMode, waitForAMap, currentPosition, localChargers]);

  // 获取当前位置
  const handleGetLocation = useCallback((isAuto = false) => {
    if (!navigator.geolocation) {
      if (!isAuto) {
        setLocationError('您的浏览器不支持地理定位功能');
      }
      return;
    }

    if (!isAuto) {
      setIsLocating(true);
    }
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        console.log('[Map] 获取到位置:', longitude, latitude);
        
        setCurrentPosition([longitude, latitude]);
        setIsLocating(false);
        
        // 更新充电桩位置
        const newChargers = updateChargersNearPosition(latitude, longitude);
        
        // 更新地图中心
        if (mapRef.current) {
          mapRef.current.setCenter([longitude, latitude]);
          mapRef.current.setZoom(16);
          
          // 更新位置标记
          if (locationMarkerRef.current) {
            mapRef.current.remove(locationMarkerRef.current);
          }
          
          const AMap = window.AMap;
          const currentPositionMarker = new AMap.Marker({
            position: [longitude, latitude],
            content: createLocationMarkerContent(),
            offset: new AMap.Pixel(-12, -12),
            zIndex: 100,
          });
          
          mapRef.current.add(currentPositionMarker);
          locationMarkerRef.current = currentPositionMarker;
          
          // 更新充电桩标记
          updateMarkers(newChargers, AMap);
        }
      },
      (error) => {
        console.error('[Map] 定位失败:', error);
        setIsLocating(false);
        
        let errorMsg = '定位失败';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = '定位被拒绝，请检查浏览器权限设置';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = '位置信息不可用';
            break;
          case error.TIMEOUT:
            errorMsg = '定位超时，请重试';
            break;
          default:
            errorMsg = '定位发生错误';
        }
        
        if (!isAuto) {
          setLocationError(errorMsg);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [updateChargersNearPosition]);

  // 页面加载时自动获取位置
  useEffect(() => {
    // 延迟1秒自动请求定位（体验更好）
    const timer = setTimeout(() => {
      if (!currentPosition) {
        handleGetLocation(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [handleGetLocation, currentPosition]);

  // 处理导航
  const handleNavigate = useCallback((charger: Charger, e: React.MouseEvent) => {
    e.stopPropagation();
    smartNavigate(
      charger.location.lat,
      charger.location.lng,
      charger.name
    );
  }, []);

  // 更新标记点
  const updateMarkers = useCallback((chargerList: Charger[], AMapInstance?: typeof window.AMap) => {
    if (!mapRef.current) return;

    const AMap = AMapInstance || window.AMap;
    if (!AMap) {
      console.warn('[Map] AMap 未定义，无法更新标记');
      return;
    }

    // 清除旧标记
    if (markersRef.current.length > 0) {
      mapRef.current.remove(markersRef.current);
      markersRef.current = [];
    }

    // 添加新标记
    const newMarkers = chargerList.map((charger) => {
      const color = getStatusColor(charger.status);
      const isCharging = charger.status === 'in_use';
      
      const content = document.createElement('div');
      content.innerHTML = `
        <div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
          <div style="width:40px;height:40px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">
            ${isCharging 
              ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.19M15 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3.19"/><line x1="23" x2="23" y1="13" y2="11"/><polyline points="11 6 7 12 13 12 9 18"/></svg>'
              : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/></svg>'
            }
          </div>
          <div style="position:absolute;bottom:-4px;right:-4px;background:white;border-radius:10px;padding:2px 6px;font-size:11px;font-weight:600;color:#f97316;box-shadow:0 1px 3px rgba(0,0,0,0.2);border:1px solid #e5e7eb;white-space:nowrap;">
            ¥${charger.price}
          </div>
        </div>
      `;

      const marker = new AMap.Marker({
        position: [charger.location.lng, charger.location.lat],
        content: content,
        offset: new AMap.Pixel(-20, -40),
        title: charger.name,
      });

      marker.on('click', () => {
        onViewDetail(charger.id);
      });

      return marker;
    });

    mapRef.current.add(newMarkers);
    markersRef.current = newMarkers;
  }, [onViewDetail]);

  // 充电桩变化时更新标记
  useEffect(() => {
    if (viewMode === 'map' && mapRef.current && !isMapLoading) {
      updateMarkers(localChargers);
    }
  }, [localChargers, viewMode, isMapLoading, updateMarkers]);

  // 同步外部 chargers 变化
  useEffect(() => {
    setLocalChargers(chargers);
  }, [chargers]);

  return (
    <div className="flex flex-col h-full">
      {/* 筛选栏 */}
      <div className="bg-white p-4 border-b shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">附近充电桩</h2>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
              className="flex items-center gap-1"
            >
              <MapIcon className="w-4 h-4" />
              地图
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-1"
            >
              <List className="w-4 h-4" />
              列表
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center space-x-2">
            <Switch
              id="available"
              checked={filters.onlyAvailable}
              onCheckedChange={(checked) => onFilterChange({ ...filters, onlyAvailable: checked })}
            />
            <Label htmlFor="available" className="text-sm cursor-pointer">仅看可用</Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <div className="flex gap-1">
              <Button
                variant={filters.type === undefined ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange({ ...filters, type: undefined })}
              >
                全部
              </Button>
              <Button
                variant={filters.type === 'slow' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange({ ...filters, type: 'slow' })}
              >
                慢充
              </Button>
              <Button
                variant={filters.type === 'fast' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange({ ...filters, type: 'fast' })}
              >
                快充
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto bg-gray-50 relative" style={{ minHeight: '500px' }}>
        {viewMode === 'map' ? (
          <div className="relative w-full h-full" style={{ minHeight: '500px' }}>
            {/* 高德地图容器 */}
            <div 
              ref={mapContainerRef}
              className="absolute inset-0"
              style={{ 
                width: '100%', 
                height: '100%',
                minHeight: '500px',
                backgroundColor: '#e5e7eb'
              }}
            />
            
            {/* 加载状态 */}
            {isMapLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-gray-600">地图加载中...</p>
                  <pre className="mt-4 text-xs text-gray-500 text-left bg-gray-800 text-green-400 p-2 rounded max-w-xs overflow-auto">
                    {debugInfo}
                  </pre>
                </div>
              </div>
            )}

            {/* 错误提示 */}
            {mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20 p-4">
                <Alert variant="destructive" className="max-w-md">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    地图加载失败：{mapError}
                    <br />
                    <span className="text-sm text-gray-500">
                      请检查网络连接或刷新页面重试
                    </span>
                    <pre className="mt-2 text-xs bg-gray-900 text-green-400 p-2 rounded overflow-auto">
                      {debugInfo}
                    </pre>
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            {/* 定位按钮组 */}
            {!isMapLoading && !mapError && (
              <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
                <Button
                  variant="default"
                  size="icon"
                  className="shadow-lg bg-blue-600 hover:bg-blue-700 text-white h-12 w-12"
                  onClick={() => handleGetLocation(false)}
                  disabled={isLocating}
                  title="定位到我的位置"
                >
                  {isLocating ? (
                    <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full" />
                  ) : (
                    <Crosshair className="w-5 h-5" />
                  )}
                </Button>
                <div className="bg-white/90 backdrop-blur-sm text-xs text-gray-600 px-2 py-1 rounded shadow-md text-center max-w-[80px]">
                  {currentPosition ? '已定位' : '获取位置'}
                </div>
              </div>
            )}

            {/* 定位错误提示 */}
            {locationError && (
              <div className="absolute top-20 left-4 right-4 z-10 max-w-sm mx-auto">
                <Alert variant="destructive" className="bg-white">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{locationError}</AlertDescription>
                </Alert>
              </div>
            )}

            {/* 位置信息提示 */}
            {currentPosition && !locationError && (
              <div className="absolute top-20 left-4 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-md z-10 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  已定位到当前位置，显示附近充电桩
                </div>
              </div>
            )}

            {/* 充电桩数量提示 */}
            {!isMapLoading && !mapError && (
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-md z-10">
                <p className="text-sm font-medium text-gray-700">
                  附近 <span className="text-blue-600 font-bold text-lg">{localChargers.length}</span> 个充电桩
                </p>
                {currentPosition && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    已定位到您的位置
                  </p>
                )}
              </div>
            )}

            {/* 首次定位提示 */}
            {!isMapLoading && !mapError && !currentPosition && !locationError && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-10 animate-pulse">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4" />
                  <span className="text-sm">正在获取您的位置...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {localChargers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Battery className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无符合条件的充电桩</p>
              </div>
            ) : (
              localChargers.map((charger) => (
                <Card 
                  key={charger.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onViewDetail(charger.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800">{charger.name}</h3>
                          <Badge variant={charger.status === 'available' ? 'default' : 'secondary'}>
                            {getStatusText(charger.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {charger.address}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Battery className="w-4 h-4 text-blue-500" />
                            {charger.power}kW
                          </span>
                          <span className="text-orange-600 font-semibold">
                            ¥{charger.price}/度
                          </span>
                          <span className="text-gray-500">
                            {charger.type === 'fast' ? '快充' : '慢充'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex items-center gap-1"
                          onClick={(e) => handleNavigate(charger, e)}
                        >
                          <Navigation className="w-4 h-4" />
                          导航
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
