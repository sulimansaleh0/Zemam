import L from 'leaflet';

export type MapTileStyleId = 'voyager' | 'dark' | 'satellite' | 'streets';

export interface MapTileStyle {
  id: MapTileStyleId;
  name: string;
  nameEn: string;
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string | string[];
}

export const CARTO_API_KEY =
  process.env.NEXT_PUBLIC_CARTO_API_KEY || 'cb1_43yc_1_7b2e47060fa7fbf58aafecbe';

const cartoKeyQuery = CARTO_API_KEY ? `?key=${CARTO_API_KEY}` : '';

export const MAP_TILE_STYLES: Record<MapTileStyleId, MapTileStyle> = {
  voyager: {
    id: 'voyager',
    name: 'شوارع حديثة (CARTO Voyager)',
    nameEn: 'Modern Streets',
    url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png${cartoKeyQuery}`,
    subdomains: 'abcd',
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  dark: {
    id: 'dark',
    name: 'الوضع الليلي التكتيكي (CARTO Dark Matter)',
    nameEn: 'Tactical Dark',
    url: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png${cartoKeyQuery}`,
    subdomains: 'abcd',
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  satellite: {
    id: 'satellite',
    name: 'أقمار صناعية (Satellite)',
    nameEn: 'Satellite Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
  streets: {
    id: 'streets',
    name: 'شوارع كلاسيكية (OSM)',
    nameEn: 'Standard OSM',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
};

export const UNIFIED_MAP_TILE_URL = MAP_TILE_STYLES.voyager.url;
export const UNIFIED_MAP_ATTRIBUTION = MAP_TILE_STYLES.voyager.attribution;

export interface UnifiedVehicleMarkerOptions {
  plateNumber?: string;
  speed?: number;
  heading?: number;
  status?: 'moving' | 'idle' | 'available' | 'offline';
  vehicleType?: 'truck' | 'van' | 'normal' | string;
  isSelected?: boolean;
  label?: string;
}

export const STATUS_COLORS = {
  moving: {
    primary: '#10b981',
    glow: 'rgba(16, 185, 129, 0.45)',
    text: '#34d399',
    badgeBg: 'rgba(16, 185, 129, 0.2)',
    badgeBorder: 'rgba(16, 185, 129, 0.35)',
    label: 'متحركة',
  },
  idle: {
    primary: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
    text: '#fbbf24',
    badgeBg: 'rgba(245, 158, 11, 0.2)',
    badgeBorder: 'rgba(245, 158, 11, 0.35)',
    label: 'متوقفة',
  },
  available: {
    primary: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.4)',
    text: '#60a5fa',
    badgeBg: 'rgba(59, 130, 246, 0.2)',
    badgeBorder: 'rgba(59, 130, 246, 0.35)',
    label: 'متاحة',
  },
  offline: {
    primary: '#64748b',
    glow: 'rgba(100, 116, 139, 0.3)',
    text: '#94a3b8',
    badgeBg: 'rgba(100, 116, 139, 0.2)',
    badgeBorder: 'rgba(100, 116, 139, 0.3)',
    label: 'غير متصلة',
  },
};

/**
 * حقن أنماط الحركة التفاعلية والظلال ثلاثية الأبعاد في الصفحة مرة واحدة
 */
export function injectMapMarkerStyles() {
  if (typeof document === 'undefined') return;
  const styleId = 'zemam-unified-map-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    @keyframes zemam-radar-ping {
      0% {
        transform: scale(0.9);
        opacity: 0.9;
      }
      70% {
        transform: scale(2.0);
        opacity: 0;
      }
      100% {
        transform: scale(2.2);
        opacity: 0;
      }
    }
    @keyframes zemam-pulse-glow {
      0%, 100% {
        box-shadow: 0 0 14px rgba(16, 185, 129, 0.6), 0 4px 14px rgba(0, 0, 0, 0.5);
      }
      50% {
        box-shadow: 0 0 24px rgba(16, 185, 129, 0.95), 0 6px 20px rgba(0, 0, 0, 0.7);
      }
    }
    @keyframes zemam-beam-sweep {
      0%, 100% { opacity: 0.75; }
      50% { opacity: 0.95; }
    }
    @keyframes zemam-dash-flow {
      to {
        stroke-dashoffset: -24;
      }
    }
    .zemam-marker-container {
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .zemam-marker-container:hover {
      transform: scale(1.1) !important;
      z-index: 1000 !important;
    }
    .leaflet-marker-icon {
      background: transparent !important;
      border: none !important;
    }
    .zemam-flow-path {
      animation: zemam-dash-flow 1.5s linear infinite;
    }
    .leaflet-popup-content-wrapper {
      background: #0f172a !important;
      color: #ffffff !important;
      border: 1px solid rgba(255, 255, 255, 0.12) !important;
      border-radius: 16px !important;
      box-shadow: 0 20px 35px -5px rgba(0, 0, 0, 0.7), 0 0 15px rgba(37, 99, 235, 0.2) !important;
      padding: 0 !important;
      overflow: hidden;
    }
    .leaflet-popup-content {
      margin: 0 !important;
      line-height: 1.5 !important;
    }
    .leaflet-popup-tip {
      background: #0f172a !important;
    }
    .zemam-breadcrumb-tooltip {
      background: rgba(15, 23, 42, 0.95) !important;
      color: #ffffff !important;
      border: 1px solid rgba(56, 189, 248, 0.4) !important;
      border-radius: 10px !important;
      box-shadow: 0 8px 20px rgba(0,0,0,0.5) !important;
      backdrop-filter: blur(8px) !important;
      padding: 6px 10px !important;
    }
    .zemam-breadcrumb-tooltip::before {
      border-top-color: rgba(15, 23, 42, 0.95) !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * توليد مجسم السيارة SVG المناسب لنوع المركبة مع إمكانية التوجيه الدقيق
 */
function getVehicleSilhouetteSvg(vehicleType: string = 'normal', color: string): string {
  const normalizedType = (vehicleType || '').toLowerCase();

  if (normalizedType.includes('truck') || normalizedType === 'truck') {
    // مجسم شاحنة نقل ثقيل (Heavy Truck with Cabin & Freight Container)
    return `
      <svg width="26" height="34" viewBox="0 0 26 34" fill="none">
        <!-- مقطورة الحاوية الخلفية -->
        <rect x="4" y="11" width="18" height="21" rx="2.5" fill="#1e293b" stroke="${color}" stroke-width="1.8"/>
        <!-- أضلاع الحاوية التكتيكية -->
        <line x1="7" y1="15" x2="19" y2="15" stroke="${color}" stroke-width="1" stroke-opacity="0.5"/>
        <line x1="7" y1="20" x2="19" y2="20" stroke="${color}" stroke-width="1" stroke-opacity="0.5"/>
        <line x1="7" y1="25" x2="19" y2="25" stroke="${color}" stroke-width="1" stroke-opacity="0.5"/>
        <!-- كابينة القيادة الأمامية -->
        <rect x="5.5" y="2" width="15" height="9" rx="2" fill="${color}"/>
        <!-- زجاج الكابينة الأمامي -->
        <path d="M7 4H19L17.5 7H8.5L7 4Z" fill="#ffffff" fill-opacity="0.9"/>
        <!-- كشافات الإضاءة الأمامية -->
        <circle cx="7" cy="2.5" r="1.2" fill="#38bdf8"/>
        <circle cx="19" cy="2.5" r="1.2" fill="#38bdf8"/>
      </svg>
    `;
  }

  if (normalizedType.includes('van') || normalizedType === 'van') {
    // مجسم فان توصيل بضائع (Cargo Delivery Van)
    return `
      <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
        <rect x="4" y="3" width="16" height="26" rx="5" fill="#1e293b" stroke="${color}" stroke-width="1.8"/>
        <!-- الزجاج الأمامي المقوس -->
        <path d="M6 7C6 5 8 4 12 4C16 4 18 5 18 7L17 10H7L6 7Z" fill="${color}" fill-opacity="0.85"/>
        <!-- كشافات الإضاءة -->
        <circle cx="6.5" cy="4" r="1.2" fill="#38bdf8"/>
        <circle cx="17.5" cy="4" r="1.2" fill="#38bdf8"/>
        <!-- سقف الفان -->
        <rect x="6.5" y="12" width="11" height="14" rx="2" fill="#0f172a"/>
        <line x1="12" y1="14" x2="12" y2="24" stroke="${color}" stroke-width="1" stroke-opacity="0.6"/>
      </svg>
    `;
  }

  // سيارة ركاب أو صالون انسيابية حديثة (Modern Sedan / Compact)
  return `
    <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
      <!-- هيكل السيارة الخارجي الانسيابي -->
      <path d="M7 4C7 2.5 9 1.5 12 1.5C15 1.5 17 2.5 17 4L19 11C19.5 13 19.5 22 19 26C18.5 29 16 30.5 12 30.5C8 30.5 5.5 29 5 26C4.5 22 4.5 13 5 11L7 4Z" fill="#1e293b" stroke="${color}" stroke-width="1.8"/>
      <!-- الزجاج الأمامي المقوس -->
      <path d="M6.5 9C7.5 7.5 9.5 7 12 7C14.5 7 16.5 7.5 17.5 9L16.5 13H7.5L6.5 9Z" fill="${color}"/>
      <!-- سقف السيارة الداخلي -->
      <rect x="7" y="14" width="10" height="7" rx="1.5" fill="#0f172a"/>
      <!-- الزجاج الخلفي -->
      <path d="M7.5 22H16.5L16 24.5C15 25.5 13.5 26 12 26C10.5 26 9 25.5 8 24.5L7.5 22Z" fill="${color}" fill-opacity="0.7"/>
      <!-- مصابيح الإضاءة الأمامية LED -->
      <circle cx="6.5" cy="3.5" r="1.2" fill="#38bdf8"/>
      <circle cx="17.5" cy="3.5" r="1.2" fill="#38bdf8"/>
    </svg>
  `;
}

/**
 * إنشاء أيقونة تتبع المركبة الموحدة بتصميم احترافي فائق الدقة
 * مع تمييز نوع المركبة (شاحنة، فان، سيارة)، شعاع كشافات الإضاءة الأمامية، وموجات الرادار
 */
export function createUnifiedVehicleMarker({
  plateNumber = '',
  speed = 0,
  heading = 0,
  status = 'moving',
  vehicleType = 'normal',
  isSelected = false,
  label = '',
}: UnifiedVehicleMarkerOptions): L.DivIcon {
  injectMapMarkerStyles();

  const cfg = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.moving;
  const isMoving = status === 'moving' || speed > 0;
  const roundedSpeed = Math.round(speed);
  const effectiveColor = isSelected ? '#38bdf8' : cfg.primary;

  const vehicleSilhouette = getVehicleSilhouetteSvg(vehicleType, effectiveColor);

  const html = `
    <div class="zemam-marker-container" style="
      position: relative;
      width: 44px;
      height: 44px;
      cursor: pointer;
      user-select: none;
    ">
      <!-- ── الوسم العلوي لمعلومات المركبة يطفو فوقها في المنتصف ── -->
      <div style="
        position: absolute;
        bottom: 50px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(15, 23, 42, 0.94);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        padding: 3px 9px;
        border-radius: 9999px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.55);
        white-space: nowrap;
        border: 1.5px solid ${effectiveColor};
        display: flex;
        align-items: center;
        gap: 6px;
        direction: rtl;
        font-family: inherit;
        pointer-events: none;
      ">
        <span style="
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: ${effectiveColor};
          box-shadow: 0 0 8px ${effectiveColor};
          display: inline-block;
          flex-shrink: 0;
        "></span>
        <span style="letter-spacing: 0.3px;">${plateNumber || label || 'مركبة'}</span>
        ${
          roundedSpeed > 0
            ? `<span style="
                background: ${cfg.badgeBg};
                color: ${cfg.text};
                font-size: 9.5px;
                font-weight: 800;
                padding: 1px 6px;
                border-radius: 6px;
                border: 1px solid ${cfg.badgeBorder};
              ">${roundedSpeed} كم/س</span>`
            : ''
        }
      </div>

      <!-- ── موجة الرادار النبضية أثناء الحركة ── -->
      ${
        isMoving
          ? `<div style="
              position: absolute;
              inset: -6px;
              border-radius: 50%;
              border: 2px solid ${effectiveColor};
              animation: zemam-radar-ping 2.2s cubic-bezier(0, 0, 0.2, 1) infinite;
              pointer-events: none;
            "></div>`
          : ''
      }

      <!-- ── كبسولة المركبة الدوارة حول مركزها الدقيق (22, 22) ── -->
      <div style="
        position: absolute;
        inset: 0;
        transform: rotate(${heading}deg);
        transform-origin: center center;
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <!-- شعاع كشافات الإضاءة الأمامية -->
        ${
          isMoving
            ? `<div style="
                position: absolute;
                top: -26px;
                left: 50%;
                transform: translateX(-50%);
                width: 36px;
                height: 30px;
                background: radial-gradient(ellipse at bottom, rgba(56, 189, 248, 0.6) 0%, rgba(56, 189, 248, 0.2) 45%, rgba(56, 189, 248, 0) 80%);
                clip-path: polygon(25% 100%, 75% 100%, 100% 0, 0 0);
                animation: zemam-beam-sweep 2s ease-in-out infinite;
                pointer-events: none;
              "></div>`
            : ''
        }

        <div style="
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #1e293b, #0f172a);
          border: 2.5px solid ${effectiveColor};
          box-shadow: 0 0 18px ${cfg.glow}, 0 6px 18px rgba(0,0,0,0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          ${isMoving ? 'animation: zemam-pulse-glow 2.5s infinite;' : ''}
        ">
          ${vehicleSilhouette}
        </div>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'zemam-unified-vehicle-marker',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  });
}

/**
 * إنشاء دبوس محطة موحد ومحسن بتقنية 3D واقعية (نقطة انطلاق A / نقطة تسليم B / مقر الشركة / محطة مسار)
 */
export function createUnifiedLocationPin(
  type: 'start' | 'pickup' | 'delivery' | 'waypoint' | 'hq',
  customLabel?: string
): L.DivIcon {
  injectMapMarkerStyles();

  const configs = {
    start: {
      color: '#10b981',
      badgeLetter: 'A',
      label: customLabel || 'نقطة الانطلاق (A)',
      icon: `<path d="M5 3v18M5 5h11l-2 5 2 5H5" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
    },
    pickup: {
      color: '#10b981',
      badgeLetter: 'A',
      label: customLabel || 'نقطة الاستلام (A)',
      icon: `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
    },
    delivery: {
      color: '#2563eb',
      badgeLetter: 'B',
      label: customLabel || 'نقطة التسليم (B)',
      icon: `<circle cx="12" cy="12" r="8" stroke="#ffffff" stroke-width="2.2"/><circle cx="12" cy="12" r="3.5" fill="#ffffff"/>`,
    },
    hq: {
      color: '#d97706',
      badgeLetter: 'HQ',
      label: customLabel || 'مقر الشركة الرئيسي',
      icon: `<path d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M12 3L2 7h20L12 3z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    },
    waypoint: {
      color: '#0284c7',
      badgeLetter: '•',
      label: customLabel || 'نقطة مسار',
      icon: `<circle cx="12" cy="12" r="5" fill="#ffffff"/>`,
    },
  };

  const cfg = configs[type] || configs.waypoint;

  const html = `
    <div style="
      position: relative;
      width: 36px;
      height: 48px;
      cursor: pointer;
      user-select: none;
    ">
      <!-- ── شارة العنوان العلوية المتوهجة تطفو أفقياً في المركز تماماً فوق الدبوس ── -->
      <div style="
        position: absolute;
        bottom: 52px;
        left: 50%;
        transform: translateX(-50%);
        background: #0f172a;
        color: #ffffff;
        font-weight: 800;
        font-size: 11px;
        padding: 3px 9px;
        border-radius: 9999px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.5);
        white-space: nowrap;
        border: 1.5px solid ${cfg.color};
        direction: rtl;
        letter-spacing: 0.2px;
        display: flex;
        align-items: center;
        gap: 5px;
        pointer-events: none;
      ">
        <span style="
          background: ${cfg.color};
          color: #ffffff;
          font-weight: 900;
          font-size: 9px;
          padding: 1px 5px;
          border-radius: 4px;
        ">${cfg.badgeLetter}</span>
        <span>${cfg.label}</span>
      </div>

      <!-- ── مجسم الدبوس الدقيق SVG: الطرف السفلي المدبب عند (18, 48) تماماً ── -->
      <svg width="36" height="48" viewBox="0 0 36 48" fill="none" style="display: block; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.45));">
        <path
          d="M 18 48 C 18 48 3 28 3 17 C 3 8.7 9.7 2 18 2 C 26.3 2 33 8.7 33 17 C 33 28 18 48 18 48 Z"
          fill="${cfg.color}"
          stroke="#ffffff"
          stroke-width="2.5"
          stroke-linejoin="round"
        />
        <circle cx="18" cy="17" r="10" fill="#0f172a" fill-opacity="0.85" />
        <g transform="translate(6, 5)">
          ${cfg.icon}
        </g>
      </svg>

      <!-- ── نقطة الإسقاط الأرضية الدقيقة (Ground Anchor Shadow) ── -->
      <div style="
        position: absolute;
        bottom: -2px;
        left: 50%;
        transform: translateX(-50%);
        width: 10px;
        height: 4px;
        background: rgba(0, 0, 0, 0.45);
        border-radius: 50%;
        filter: blur(1px);
        pointer-events: none;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: `zemam-unified-pin zemam-unified-pin-${type}`,
    iconSize: [36, 48],
    iconAnchor: [18, 48], // الطرف السفلي المدبب عند (18, 48) بالضبط
    popupAnchor: [0, -48],
  });
}

/**
 * تحديد لون نقطة الأثر الدقيقة بناءً على السرعة اللحظية
 */
export function getSpeedColor(speed?: number): { color: string; label: string } {
  if (speed === undefined || speed === null) {
    return { color: '#0284c7', label: 'قياسية' };
  }
  if (speed >= 65) {
    return { color: '#10b981', label: 'سريعة وسلسة' };
  }
  if (speed >= 30) {
    return { color: '#0284c7', label: 'سرعة معتدلة' };
  }
  if (speed > 0) {
    return { color: '#f59e0b', label: 'سرعة بطيئة' };
  }
  return { color: '#ef4444', label: 'توقف مؤقت' };
}

/**
 * إعدادات رسم نقاط المسار المقطوعة الدقيقة (Breadcrumb Trail Points)
 * تظهر السرعة الحقيقية والوقت والإحداثيات الدقيقة
 */
export function createBreadcrumbDot(
  lat: number,
  lng: number,
  index: number,
  speed?: number,
  timestamp?: string | number
): L.CircleMarker {
  const { color, label: speedLabel } = getSpeedColor(speed);

  const dot = L.circleMarker([lat, lng], {
    radius: 4.5,
    color: color,
    weight: 2,
    fillColor: '#ffffff',
    fillOpacity: 1,
  });

  const timeStr = timestamp
    ? new Date(timestamp).toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '';

  const tooltipHtml = `
    <div style="
      font-family: inherit;
      font-size: 11px;
      direction: rtl;
      text-align: right;
      padding: 4px 6px;
      line-height: 1.5;
    ">
      <div style="font-weight: 800; color: ${color}; display: flex; items-center; justify-content: space-between; gap: 8px;">
        <span>نقطة تتبع #${index}</span>
        <span style="font-size: 9.5px; opacity: 0.85;">${speedLabel}</span>
      </div>
      ${speed !== undefined ? `<div style="color: #ffffff; margin-top: 2px;">السرعة: <b style="color: ${color};">${Math.round(speed)} كم/س</b></div>` : ''}
      ${timeStr ? `<div style="color: #94a3b8; font-size: 10px;">الوقت: ${timeStr}</div>` : ''}
      <div style="color: #64748b; font-size: 9px; margin-top: 2px; direction: ltr; text-align: right;">
        ${lat.toFixed(5)}, ${lng.toFixed(5)}
      </div>
    </div>
  `;

  dot.bindTooltip(tooltipHtml, {
    direction: 'top',
    offset: [0, -6],
    className: 'zemam-breadcrumb-tooltip',
  });

  return dot;
}
