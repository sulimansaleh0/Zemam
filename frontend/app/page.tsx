import {
  Navbar,
  Hero,
  HowItWorks,
  SmartInsight,
  StatsBanner,
  SubscriptionPlans,
  MobileAppBanner,
  FaqSection,
  Footer,
} from "@/features/landing";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#0F172A] font-sans overflow-x-hidden [direction:rtl]">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <SmartInsight />
        <StatsBanner />
        <SubscriptionPlans />
        <MobileAppBanner />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
