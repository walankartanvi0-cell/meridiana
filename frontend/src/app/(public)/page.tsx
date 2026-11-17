import ApproachSection from "@/components/sections/ApproachSection";
import ContactCTA from "@/components/sections/ContactCTA";
import Hero from "@/components/sections/Hero";
import IndustriesSection from "@/components/sections/IndustriesSection";
import Introduction from "@/components/sections/Introduction";
import Services from "@/components/sections/Services";
import WhyUs from "@/components/sections/WhyUs";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Introduction />
      <Services />
      <IndustriesSection />
      <WhyUs />
      <ApproachSection />
      <ContactCTA />
    </>
  );
}
