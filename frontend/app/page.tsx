import { Navbar } from "@/shared/components/landing/Navbar";
import { Hero } from "@/shared/components/landing/Hero";
import { HowItWorks } from "@/shared/components/landing/HowItWorks";
import { SubscriptionPlans } from "@/shared/components/landing/SubscriptionPlans";
import { SmartInsight } from "@/shared/components/landing/SmartInsight";
import { Footer } from "@/shared/components/landing/Footer";

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
