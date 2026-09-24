import L from 'leaflet';

export interface UnifiedVehicleMarkerOptions {
  plateNumber?: string;
  speed?: number;
  heading?: number;
  status?: 'moving' | 'idle' | 'available' | 'offline';
  isSelected?: boolean;
  label?: string;
}

const STATUS_COLORS = {
  moving: {
    primary: '#10b981', // Emerald
    glow: 'rgba(16, 185, 129, 0.45)',
    text: '#34d399',
    label: 'متحركة',
  },
  idle: {
    primary: '#f59e0b', // Amber
    glow: 'rgba(245, 158, 11, 0.35)',
    text: '#fbbf24',
    label: 'متوقفة',
  },
  available: {
    primary: '#3b82f6', // Blue
    glow: 'rgba(59, 130, 246, 0.35)',
    text: '#60a5fa',
    label: 'متاحة',
  },
  offline: {
    primary: '#64748b', // Slate
    glow: 'rgba(100, 116, 139, 0.25)',
    text: '#94a3b8',
    label: 'غير متصلة',
  },
};

/**
 * حقن أنماط الحركة التفاعلية في الصفحة مرة واحدة لدعم وميض وحركات الخريطة
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
        opacity: 0.85;
      }
      70% {
        transform: scale(1.6);
        opacity: 0;
      }
      100% {
        transform: scale(1.8);
        opacity: 0;
      }
    }
    @keyframes zemam-pulse-glow {
      0%, 100% {
        box-shadow: 0 0 12px rgba(16, 185, 129, 0.6), 0 4px 14px rgba(0, 0, 0, 0.5);
      }
      50% {
        box-shadow: 0 0 22px rgba(16, 185, 129, 0.9), 0 6px 18px rgba(0, 0, 0, 0.6);
      }
    }
    .zemam-marker-container {
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .zemam-marker-container:hover {
      transform: translate(-50%, -50%) scale(1.08) !important;
      z-index: 1000 !important;
    }
    .leaflet-popup-content-wrapper {
      background: #0f172a !important;
      color: #ffffff !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 14px !important;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6) !important;
    }
    .leaflet-popup-tip {
      background: #0f172a !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * إنشاء أيقونة تتبع المركبة الموحدة بتصميم حديث عالي الدقة (Top-Down Vehicle with Headlight Beam)
 */
export function createUnifiedVehicleMarker({
  plateNumber = '',
  speed = 0,
  heading = 0,
  status = 'moving',
  isSelected = false,
  label = '',
}: UnifiedVehicleMarkerOptions): L.DivIcon {
  injectMapMarkerStyles();

  const cfg = STATUS_COLORS[status] || STATUS_COLORS.moving;
  const isMoving = status === 'moving' || speed > 0;
  const roundedSpeed = Math.round(speed);
  const effectiveColor = isSelected ? '#38bdf8' : cfg.primary;

  const html = `
    <div class="zemam-marker-container" style="
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -50%);
      cursor: pointer;
      user-select: none;
    ">
      <!-- ── الوسم العلوي لمعلومات المركبة (Telemetry Tag) ── -->
      <div style="
        background: rgba(15, 23, 42, 0.92);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        padding: 3px 9px;
        border-radius: 9999px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.45);
        white-space: nowrap;
        margin-bottom: 5px;
        border: 1.5px solid ${effectiveColor};
        display: flex;
        align-items: center;
        gap: 5px;
        direction: rtl;
        font-family: inherit;
      ">
        <span style="
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: ${effectiveColor};
          box-shadow: 0 0 6px ${effectiveColor};
          display: inline-block;
          flex-shrink: 0;
        "></span>
        <span style="letter-spacing: 0.3px;">${plateNumber || label || 'مركبة'}</span>
        ${
          roundedSpeed > 0
            ? `<span style="
                background: rgba(16, 185, 129, 0.2);
                color: #34d399;
                font-size: 9.5px;
                font-weight: 800;
                padding: 1px 5px;
                border-radius: 6px;
                border: 1px solid rgba(16, 185, 129, 0.3);
              ">${roundedSpeed} كم/س</span>`
            : ''
        }
      </div>

      <!-- ── حاوية المركبة وشعاع الإضاءة ── -->
      <div style="
        position: relative;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <!-- موجة الرادار النبضية أثناء الحركة -->
        ${
          isMoving
            ? `<div style="
                position: absolute;
                inset: -4px;
                border-radius: 50%;
                border: 2px solid ${effectiveColor};
                animation: zemam-radar-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                pointer-events: none;
              "></div>`
            : ''
        }

        <!-- جسم المركبة الدوار مع زاوية الاتجاه (Heading) -->
        <div style="
          position: absolute;
          width: 48px;
          height: 48px;
          transform: rotate(${heading}deg);
          transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <!-- شعاع كشافات الإضاءة الأمامية (Headlight Beam) -->
          ${
            isMoving
              ? `<div style="
                  position: absolute;
                  top: -22px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 32px;
                  height: 28px;
                  background: radial-gradient(ellipse at bottom, rgba(56, 189, 248, 0.5) 0%, rgba(56, 189, 248, 0) 75%);
                  clip-path: polygon(25% 100%, 75% 100%, 100% 0, 0 0);
                  pointer-events: none;
                "></div>`
              : ''
          }

          <!-- الكبسولة الملاحية للمركبة (Navigation Vessel) -->
          <div style="
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: radial-gradient(circle at 35% 35%, #1e293b, #0f172a);
            border: 2.5px solid ${effectiveColor};
            box-shadow: 0 0 16px ${cfg.glow}, 0 4px 14px rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            ${isMoving ? 'animation: zemam-pulse-glow 2.5s infinite;' : ''}
          ">
            <!-- سهم ملاحة انسيابي أنيق مع مقصورة القيادة -->
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));">
              <path
                d="M12 2.5L19.5 19.5L12 16L4.5 19.5L12 2.5Z"
                fill="${effectiveColor}"
                stroke="#ffffff"
                stroke-width="1.8"
                stroke-linejoin="round"
              />
              <circle cx="12" cy="11.5" r="2.2" fill="#ffffff" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'zemam-unified-vehicle-marker',
    iconSize: [48, 64],
    iconAnchor: [24, 48],
  });
}

/**
 * إنشاء دبوس محطة موحد ومحسن (بداية / استلام / تسليم)
 */
export function createUnifiedLocationPin(
  type: 'start' | 'pickup' | 'delivery' | 'waypoint',
  customLabel?: string
): L.DivIcon {
  injectMapMarkerStyles();

  const configs = {
    start: {
      color: '#10b981',
      label: customLabel || 'نقطة الانطلاق',
      icon: `<path d="M5 3v18M5 5h11l-2 5 2 5H5" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    },
    pickup: {
      color: '#f59e0b',
      label: customLabel || 'نقطة الاستلام',
      icon: `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    },
    delivery: {
      color: '#8b5cf6',
      label: customLabel || 'نقطة التسليم',
      icon: `<circle cx="12" cy="12" r="9" stroke="#ffffff" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="#ffffff"/>`,
    },
    waypoint: {
      color: '#0284c7',
      label: customLabel || 'نقطة مسار',
      icon: `<circle cx="12" cy="12" r="5" fill="#ffffff"/>`,
    },
  };

  const cfg = configs[type] || configs.waypoint;

  const html = `
    <div style="
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
      cursor: pointer;
      user-select: none;
    ">
      <!-- شارة العنوان -->
      <div style="
        background: ${cfg.color};
        color: #ffffff;
        font-weight: 800;
        font-size: 10px;
        padding: 2.5px 8px;
        border-radius: 9999px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        white-space: nowrap;
        margin-bottom: 2px;
        border: 1.5px solid #ffffff;
        direction: rtl;
        letter-spacing: 0.2px;
      ">${cfg.label}</div>

      <!-- رأس الدبوس الدائري -->
      <div style="
        width: 26px;
        height: 26px;
        background: ${cfg.color};
        border: 2px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          ${cfg.icon}
        </svg>
      </div>

      <!-- ساق الدبوس السفلي -->
      <div style="
        width: 3px;
        height: 8px;
        background: ${cfg.color};
        border-radius: 0 0 2px 2px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.25);
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: `zemam-unified-pin-${type}`,
    iconSize: [26, 42],
    iconAnchor: [13, 42],
  });
}

/**
 * إعدادات رسم نقاط المسار المقطوعة (Breadcrumb Trail Points)
 */
export function createBreadcrumbDot(
  lat: number,
  lng: number,
  index: number,
  speed?: number,
  timestamp?: string | number
): L.CircleMarker {
  const dot = L.circleMarker([lat, lng], {
    radius: 4,
    color: '#0284c7',
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
      padding: 3px 5px;
      line-height: 1.5;
    ">
      <div style="font-weight: 800; color: #38bdf8;">نقطة مسار #${index}</div>
      ${speed !== undefined ? `<div style="color: #ffffff;">السرعة: <b>${Math.round(speed)} كم/س</b></div>` : ''}
      ${timeStr ? `<div style="color: #94a3b8; font-size: 10px;">الوقت: ${timeStr}</div>` : ''}
    </div>
  `;

  dot.bindTooltip(tooltipHtml, {
    direction: 'top',
    offset: [0, -5],
    className: 'zemam-breadcrumb-tooltip',
  });

  return dot;
}

export const UNIFIED_MAP_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const UNIFIED_MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
