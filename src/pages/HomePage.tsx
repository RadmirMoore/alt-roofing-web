import { MobileTopBlur } from "../components/MobileBlurEdges";
import { ChatAgent } from "../components/ChatAgent";
import { Footer } from "../components/Footer";
import { Gallery } from "../components/Gallery";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { Manufacturers } from "../components/Manufacturers";
import { Marquee } from "../components/Marquee";
import { MobileBar } from "../components/MobileBar";
import { PriceGuarantee } from "../components/PriceGuarantee";
import { QuoteForm } from "../components/QuoteForm";
import { Reviews } from "../components/Reviews";
import { ServiceArea } from "../components/ServiceArea";
import { Services } from "../components/Services";
import { WhyAlt } from "../components/WhyAlt";
import { useEffect } from "react";
import { initAnalytics } from "../lib/analytics-tracker";

export function HomePage() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <MobileTopBlur />
      <Header />
      <Hero />
      <Marquee />
      <PriceGuarantee />
      <Services />
      <Manufacturers />
      <Reviews />
      <Gallery />
      <WhyAlt />
      <ServiceArea />
      <QuoteForm />
      <Footer />
      <MobileBar />
      <ChatAgent />
    </main>
  );
}
