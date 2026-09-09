import {
  Droplet,
  MapPin,
  Sparkles,
  Truck,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type FleetFeature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const fleetFeatures: readonly FleetFeature[] = [
  {
    title: "الوقود",
    description: "سجل عمليات الوقود وتابع الاستهلاك واكتشف الحالات غير الطبيعية.",
    icon: Droplet,
  },
  {
    title: "الصيانة",
    description: "خطط للصيانة وتابع الأعطال والمواعيد القادمة.",
    icon: Wrench,
  },
  {
    title: "إدارة المركبات",
    description: "تابع بيانات مركباتك وحالتها ووثائقها بسهولة.",
    icon: Truck,
  },
  {
    title: "التحليلات الذكية",
    description: "احصل على رؤى وتوصيات تساعدك على تحسين أداء الأسطول.",
    icon: Sparkles,
  },
  {
    title: "التتبع",
    description: "تابع مواقع مركباتك واعرف آخر موقع معروف لكل مركبة.",
    icon: MapPin,
  },
  {
    title: "السائقون",
    description: "إدارة بيانات السائقين والتراخيص والأداء.",
    icon: Users,
  },
];
