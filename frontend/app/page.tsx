import {
  Navbar,
  Hero,
  HowItWorks,
  SmartInsight,
  SubscriptionPlans,
  Footer,
} from "@/features/landing";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg text-text font-sans overflow-x-hidden [direction:rtl]">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <SmartInsight />
        <SubscriptionPlans />
      </main>
      <Footer />
    </div>
  );
}
