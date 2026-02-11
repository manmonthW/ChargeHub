// 高德地图 JS API v2.0 类型声明
// 参考文档: https://lbs.amap.com/api/javascript-api-v2/guide/abc/jscode

declare global {
  interface Window {
    AMap: typeof AMap;
    _AMapSecurityConfig?: {
      securityJsCode?: string;
      serviceHost?: string;
    };
  }
}

declare namespace AMap {
  // 地图类
  class Map {
    constructor(container: string | HTMLElement, opts?: MapOptions);
    destroy(): void;
    add(overlays: any | any[]): void;
    remove(overlays: any | any[]): void;
    setCenter(center: LngLatLike): void;
    setZoom(zoom: number): void;
    getCenter(): LngLat;
    getZoom(): number;
    on(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
    setFitView(overlays?: any[], immediately?: boolean, avoid?: number[], maxZoom?: number): void;
    clearMap(): void;
    setMapStyle(style: string): void;
  }

  // 标记点类
  class Marker {
    constructor(opts?: MarkerOptions);
    setPosition(position: LngLatLike): void;
    getPosition(): LngLat;
    setContent(content: string | HTMLElement): void;
    setOffset(offset: Pixel): void;
    setzIndex(zIndex: number): void;
    setTitle(title: string): void;
    on(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
  }

  // 经纬度类
  class LngLat {
    constructor(lng: number, lat: number);
    lng: number;
    lat: number;
    distance(lnglat: LngLat): number;
    offset(E: number, F: number): LngLat;
  }

  // 像素坐标类
  class Pixel {
    constructor(x: number, y: number);
    x: number;
    y: number;
  }

  // 信息窗体类
  class InfoWindow {
    constructor(opts?: InfoWindowOptions);
    open(map: Map, position: LngLatLike): void;
    close(): void;
    setContent(content: string | HTMLElement): void;
    setPosition(position: LngLatLike): void;
  }

  // 地图配置选项
  interface MapOptions {
    center?: LngLatLike;
    zoom?: number;
    viewMode?: '2D' | '3D';
    resizeEnable?: boolean;
    dragEnable?: boolean;
    zoomEnable?: boolean;
    doubleClickZoom?: boolean;
    keyboardEnable?: boolean;
    scrollWheel?: boolean;
    showIndoorMap?: boolean;
    showBuildingBlock?: boolean;
    mapStyle?: string;
    pitch?: number;
    rotation?: number;
  }

  // 标记点配置选项
  interface MarkerOptions {
    position?: LngLatLike;
    content?: string | HTMLElement;
    icon?: string | Icon;
    title?: string;
    offset?: Pixel;
    anchor?: string;
    clickable?: boolean;
    draggable?: boolean;
    cursor?: string;
    zIndex?: number;
    angle?: number;
    label?: LabelOptions;
  }

  // 图标类
  class Icon {
    constructor(opts?: IconOptions);
    setImageSize(size: Size): void;
  }

  interface IconOptions {
    size?: Size;
    image?: string;
    imageOffset?: Pixel;
    imageSize?: Size;
  }

  // 尺寸类
  class Size {
    constructor(width: number, height: number);
    width: number;
    height: number;
  }

  // 标签配置
  interface LabelOptions {
    content?: string;
    direction?: 'top' | 'right' | 'bottom' | 'left' | 'center';
    offset?: Pixel;
  }

  // 信息窗体配置
  interface InfoWindowOptions {
    content?: string | HTMLElement;
    offset?: Pixel;
    closeWhenClickMap?: boolean;
    size?: Size;
    anchor?: string;
  }

  // 坐标类型
  type LngLatLike = LngLat | [number, number] | { lng: number; lat: number };
}

export {};
