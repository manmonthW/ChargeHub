// 地图导航工具函数

/**
 * 打开高德地图导航
 * @param destLat 目的地纬度
 * @param destLng 目的地经度
 * @param destName 目的地名称
 * @param startLat 起始纬度（可选，不传则使用当前位置）
 * @param startLng 起始经度（可选）
 */
export const navigateWithAMap = (
  destLat: number,
  destLng: number,
  destName: string,
  startLat?: number,
  startLng?: number
) => {
  // 高德地图导航 URL  scheme
  // 格式: https://uri.amap.com/navigation?to=lng,lat,name&mode=car&policy=1
  const dest = `${destLng},${destLat},${encodeURIComponent(destName)}`;
  
  let url: string;
  
  if (startLat !== undefined && startLng !== undefined) {
    // 有起始位置
    const start = `${startLng},${startLat}`;
    url = `https://uri.amap.com/navigation?from=${start}&to=${dest}&mode=car&policy=1`;
  } else {
    // 使用当前位置作为起点
    url = `https://uri.amap.com/navigation?to=${dest}&mode=car&policy=1`;
  }
  
  // 尝试打开高德地图 App，如果不存在则打开网页版
  openMapApp(url, `https://ditu.amap.com/search?query=${encodeURIComponent(destName)}`);
};

/**
 * 打开百度地图导航
 * @param destLat 目的地纬度
 * @param destLng 目的地经度
 * @param destName 目的地名称
 */
export const navigateWithBaiduMap = (
  destLat: number,
  destLng: number,
  destName: string
) => {
  // 百度地图导航 URL
  // 格式: baidumap://map/direction?destination=latlng:lat,lng|name:xxx&mode=driving
  const url = `baidumap://map/direction?destination=latlng:${destLat},${destLng}|name:${encodeURIComponent(destName)}&mode=driving`;
  const fallbackUrl = `https://api.map.baidu.com/direction?origin=latlng:${destLat},${destLng}|name:我的位置&destination=latlng:${destLat},${destLng}|name:${encodeURIComponent(destName)}&mode=driving`;
  
  openMapApp(url, fallbackUrl);
};

/**
 * 打开腾讯地图导航
 * @param destLat 目的地纬度
 * @param destLng 目的地经度
 * @param destName 目的地名称
 */
export const navigateWithQQMap = (
  destLat: number,
  destLng: number,
  destName: string
) => {
  // 腾讯地图导航 URL
  const url = `qqmap://map/routeplan?type=drive&from=我的位置&fromcoord=CurrentLocation&tocoord=${destLat},${destLng}&to=${encodeURIComponent(destName)}`;
  const fallbackUrl = `https://map.qq.com/?type=drive&to=${encodeURIComponent(destName)}&tocoord=${destLat},${destLng}`;
  
  openMapApp(url, fallbackUrl);
};

/**
 * 打开苹果地图导航（iOS）
 * @param destLat 目的地纬度
 * @param destLng 目的地经度
 * @param destName 目的地名称
 */
export const navigateWithAppleMap = (
  destLat: number,
  destLng: number,
  destName: string
) => {
  // 苹果地图 URL scheme
  const url = `http://maps.apple.com/?daddr=${destLat},${destLng}&q=${encodeURIComponent(destName)}&dirflg=d`;
  window.open(url, '_blank');
};

// 下一个函数

/**
 * 打开 Google 地图导航
 * @param destLat 目的地纬度
 * @param destLng 目的地经度
 * @param destName 目的地名称
 */
export const navigateWithGoogleMap = (
  destLat: number,
  destLng: number,
  _destName: string
) => {
  // Google 地图导航 URL (destName 保留用于未来的目的地名称显示)
  const url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
  window.open(url, '_blank');
};

/**
 * 智能导航 - 根据平台自动选择地图应用
 * @param destLat 目的地纬度
 * @param destLng 目的地经度
 * @param destName 目的地名称
 */
export const smartNavigate = (
  destLat: number,
  destLng: number,
  destName: string
) => {
  const ua = navigator.userAgent.toLowerCase();
  
  // 判断平台
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);
  const isWeChat = /micromessenger/.test(ua);
  
  if (isWeChat) {
    // 微信内使用腾讯地图或高德地图网页版
    navigateWithAMap(destLat, destLng, destName);
  } else if (isIOS) {
    // iOS 优先使用苹果地图，备选高德
    navigateWithAppleMap(destLat, destLng, destName);
  } else if (isAndroid) {
    // Android 优先使用高德地图
    navigateWithAMap(destLat, destLng, destName);
  } else {
    // PC 或其他设备使用高德网页版
    navigateWithAMap(destLat, destLng, destName);
  }
};

/**
 * 显示导航选择对话框
 * @param destLat 目的地纬度
 * @param destLng 目的地经度
 * @param destName 目的地名称
 */
export const showNavigationOptions = (
  destLat: number,
  destLng: number,
  destName: string
): { name: string; action: () => void }[] => {
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  
  const options = [
    {
      name: '高德地图',
      action: () => navigateWithAMap(destLat, destLng, destName),
    },
    {
      name: '百度地图',
      action: () => navigateWithBaiduMap(destLat, destLng, destName),
    },
    {
      name: '腾讯地图',
      action: () => navigateWithQQMap(destLat, destLng, destName),
    },
  ];
  
  if (isIOS) {
    options.push({
      name: '苹果地图',
      action: () => navigateWithAppleMap(destLat, destLng, destName),
    });
  }
  
  return options;
};

/**
 * 尝试打开地图 App，失败则打开网页版
 */
const openMapApp = (appUrl: string, webUrl: string) => {
  // 尝试打开 App
  const start = Date.now();
  
  // 创建一个隐藏的 iframe 来尝试打开 App
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = appUrl;
  document.body.appendChild(iframe);
  
  // 超时后清理并打开网页版
  setTimeout(() => {
    document.body.removeChild(iframe);
    
    // 如果用户在 App 中，页面会失去焦点
    // 这里简单地打开网页版作为备选
    if (Date.now() - start < 1500) {
      window.open(webUrl, '_blank');
    }
  }, 1000);
};
