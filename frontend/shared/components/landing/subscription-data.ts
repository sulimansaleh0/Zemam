export type SubscriptionPlan = {
  name: string;
  audience: string;
  price: string;
  currency?: string;
  features: readonly string[];
  cta: string;
  featured?: boolean;
};

export const subscriptionPlans: readonly SubscriptionPlan[] = [
  {
    name: "الخطة الأساسية",
    audience: "للأساطيل الصغيرة",
    price: "مجانية",
    features: ["إدارة المركبات", "إدارة السائقين", "متابعة المهام", "لوحة تحكم أساسية"],
    cta: "ابدأ مجانًا",
  },
  {
    name: "الخطة الاحترافية",
    audience: "للأساطيل المتنامية",
    price: "99",
    currency: "ر.س / شهريًا",
    features: [
      "جميع مزايا الخطة الأساسية",
      "التتبع GPS",
      "إدارة الصيانة",
      "إدارة الوقود",
      "التنبيهات",
      "تقارير وتحليلات",
    ],
    cta: "اشترك الآن",
    featured: true,
  },
  {
    name: "خطة الأعمال",
    audience: "للمنظمات الكبيرة",
    price: "249",
    currency: "ر.س / شهريًا",
    features: [
      "جميع مزايا الخطة الاحترافية",
      "إدارة متقدمة للأسطول",
      "تحليلات متقدمة",
      "دعم الأولوية",
      "إدارة متعددة للمستخدمين",
    ],
    cta: "اشترك الآن",
  },
];
