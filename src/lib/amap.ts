// 高德地图加载工具
// 参考: https://lbs.amap.com/api/javascript-api-v2/guide/abc/jscode

interface AMapLoaderOptions {
  key: string;
  securityJsCode: string;
  version?: string;
  plugins?: string[];
}

// 加载高德地图脚本
export const loadAMap = (options: AMapLoaderOptions): Promise<typeof window.AMap> => {
  return new Promise((resolve, reject) => {
    // 如果已经加载过，直接返回
    if (typeof window.AMap !== 'undefined') {
      resolve(window.AMap);
      return;
    }

    // 配置安全密钥
    window._AMapSecurityConfig = {
      securityJsCode: options.securityJsCode,
    };

    // 构建脚本 URL
    const version = options.version || '2.0';
    const plugins = options.plugins ? `&plugin=${options.plugins.join(',')}` : '';
    const scriptUrl = `https://webapi.amap.com/maps?v=${version}&key=${options.key}${plugins}`;

    // 创建脚本元素
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = scriptUrl;

    // 加载成功回调
    script.onload = () => {
      // 等待 AMap 全局变量可用
      const checkAMap = () => {
        if (typeof window.AMap !== 'undefined') {
          resolve(window.AMap);
        } else {
          setTimeout(checkAMap, 50);
        }
      };
      checkAMap();
    };

    // 加载失败回调
    script.onerror = () => {
      reject(new Error('高德地图脚本加载失败'));
    };

    // 添加到页面
    document.head.appendChild(script);
  });
};

// 高德地图配置
export const AMAP_CONFIG = {
  key: 'b138a576d232b4f6e03ee221f60c0a9a',
  securityJsCode: '38e2f3ea143ee52c09d08281801fa6cd',
  version: '2.0',
};
