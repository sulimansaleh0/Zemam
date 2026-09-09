export const landingNavLinks = [
  { label: "الرئيسية", href: "#hero" },
  { label: "المميزات", href: "#features" },
  { label: "كيف تعمل", href: "#how-it-works" },
  { label: "رؤى الأسطول", href: "#insights" },
  { label: "الاشتراكات", href: "#pricing" },
] as const;

export const footerNavLinks = landingNavLinks.slice(0, 3);
