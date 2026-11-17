import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/layout/PageHero";
import ContactCTA from "@/components/sections/ContactCTA";
import ProcessTimeline from "@/components/sections/ProcessTimeline";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Sell-Side Advisory",
  description: "Confidential, disciplined sell-side M&A advisory for lower-middle-market business owners.",
};

const steps = [
  {
    number: "01",
    title: "Discovery & readiness",
    description:
      "We understand your goals, review the financial picture and identify any issues that could affect value. Where useful, we coordinate a quality-of-earnings review before launch.",
  },
  {
    number: "02",
    title: "Valuation & positioning",
    description:
      "We develop a realistic valuation range and craft the investment case around your business's genuine differentiators — not generic market headlines.",
  },
  {
    number: "03",
    title: "Confidential outreach",
    description:
      "A targeted buyer list is built and contacted under strict confidentiality. We manage every conversation so your identity and operations remain protected until the right stage.",
  },
  {
    number: "04",
    title: "Diligence management",
    description:
      "We operate a controlled data room, prepare management for buyer meetings and keep the process on schedule by answering questions quickly and accurately.",
  },
  {
    number: "05",
    title: "Negotiation & selection",
    description:
      "We compare bids on price, certainty, structure and cultural fit — then negotiate terms that reflect your priorities rather than simply the highest headline number.",
  },
  {
    number: "06",
    title: "Closing & transition",
    description:
      "We coordinate with legal, tax and financing advisers through documentation and completion, and help plan the handover to the new owner.",
  },
];

const benefits = [
  "Senior advisor accessible throughout the process",
  "Auctions or targeted approaches designed around your goals",
  "Buyer screening that protects customers, staff and confidentiality",
  "Clear, regular reporting on process and feedback",
];

export default function SellSidePage() {
  return (
    <>
      <PageHero
        eyebrow="Sell-Side Advisory"
        title="Sell on your terms, not the market's."
        description="A confidential, carefully managed process that positions your business properly, reaches the right buyers and protects the value you have built."
        image="/images/handshake.jpg"
      />

      <section className="bg-white py-24 sm:py-28">
        <div className="container-wide grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <SectionHeading
                eyebrow="The Objective"
                title={<>Your legacy, properly represented.</>}
                description="Selling a business is rarely just a financial decision. Timing, privacy, employees and the future of the company all matter. We build a process around what you actually want to achieve, then manage the details so you can keep running your business."
              />
            </Reveal>
            <Reveal delay={100}>
              <ul className="mt-8 space-y-4">
                {benefits.map((item) => (
                  <li key={item} className="flex gap-4 text-sm leading-7 text-charcoal-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal delay={100}>
            <div className="relative">
              <Image
                src="/images/boardroom.jpg"
                alt="Boardroom discussion during a transaction process"
                width={900}
                height={650}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-navy-900 px-7 py-6 text-white">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold-400">Our commitment</p>
                <p className="mt-2 font-display text-2xl">Confidential from day one.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-ivory-50 py-24 sm:py-28">
        <div className="container-wide">
          <Reveal>
            <SectionHeading
              eyebrow="The Process"
              title={<>Six stages, clearly managed.</>}
              description="A structured approach removes surprises and keeps you in control of the decision at every point."
              align="center"
            />
          </Reveal>
          <ProcessTimeline steps={steps} />
        </div>
      </section>

      <ContactCTA />
    </>
  );
}
