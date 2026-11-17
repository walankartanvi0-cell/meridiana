import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/layout/PageHero";
import ContactCTA from "@/components/sections/ContactCTA";
import ArrowLink from "@/components/ui/ArrowLink";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Our Expertise",
  description: "Sell-side, buy-side and strategic advisory for lower-middle-market transactions.",
};

const capabilities = [
  {
    title: "Transaction readiness",
    description: "Quality-of-earnings coordination, financial clean-up and data room preparation before you go to market.",
  },
  {
    title: "Valuation analysis",
    description: "Evidence-based valuation ranges grounded in comparable transactions and current buyer behaviour.",
  },
  {
    title: "Counterparty targeting",
    description: "A researched, prioritised list of strategic buyers, private equity groups and lending sources.",
  },
  {
    title: "Diligence management",
    description: "Structured information flow, management preparation and rapid resolution of buyer questions.",
  },
  {
    title: "Negotiation support",
    description: "Term sheet and purchase agreement guidance, with clear advice on price, structure and risk.",
  },
  {
    title: "Closing coordination",
    description: "We stay engaged through legal documentation, financing conditions and the transition period.",
  },
];

const offerings = [
  {
    number: "01",
    label: "Sell-Side Advisory",
    title: "Take your business to the right market.",
    description:
      "We help owners prepare, position and run a confidential sale process that attracts credible buyers and protects value. From the first valuation discussion to the final signature, you have a senior advisor by your side.",
    points: ["Pre-sale positioning and readiness review", "Confidential buyer outreach", "Diligence and negotiation management"],
    image: "/images/handshake.jpg",
    href: "/sell-side",
  },
  {
    number: "02",
    label: "Buy-Side Advisory",
    title: "Acquire with confidence and clarity.",
    description:
      "We identify, assess and help you acquire businesses that fit your strategy. Our process brings structure to an often fragmented search and keeps momentum through diligence and closing.",
    points: ["Search and origination", "Commercial and financial assessment", "Deal structuring and negotiation"],
    image: "/images/strategy-session.jpg",
    href: "/buy-side",
  },
  {
    number: "03",
    label: "Strategic Advisory",
    title: "Make the right decision before the transaction.",
    description:
      "Not every question starts with a sale or an acquisition. We advise boards and management teams on strategy, capital structure and corporate transactions with complete independence.",
    points: ["Growth and portfolio strategy", "Capital structure review", "Divestitures and joint ventures"],
    image: "/images/financial-analysis.jpg",
    href: "/strategic-advisory",
  },
];

export default function ExpertisePage() {
  return (
    <>
      <PageHero
        eyebrow="Advisory Services"
        title="Expertise built around the transaction."
        description="Three complementary practices, one consistent standard of senior attention, market knowledge and careful execution."
        image="/images/financial-analysis.jpg"
      />

      <section className="bg-white py-24 sm:py-28">
        <div className="container-wide space-y-20">
          {offerings.map((offering, index) => (
            <Reveal key={offering.href}>
              <article className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
                <div className={`relative ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                  <div className="absolute -left-4 top-6 h-48 w-px bg-gold-500/60" />
                  <Image
                    src={offering.image}
                    alt={offering.label}
                    width={900}
                    height={640}
                    className="aspect-[16/10] w-full object-cover"
                  />
                  <span className="absolute -bottom-4 right-0 bg-navy-900 px-5 py-3 font-display text-2xl text-gold-400">
                    {offering.number}
                  </span>
                </div>
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-600">{offering.label}</p>
                  <h2 className="mt-4 font-display text-4xl leading-tight text-navy-900">{offering.title}</h2>
                  <p className="mt-5 text-sm leading-7 text-charcoal-500">{offering.description}</p>
                  <ul className="mt-7 space-y-3">
                    {offering.points.map((point) => (
                      <li key={point} className="flex gap-3 text-sm text-charcoal-700">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-500" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <ArrowLink href={offering.href}>Learn More</ArrowLink>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-ivory-50 py-24 sm:py-28">
        <div className="container-wide">
          <Reveal>
            <SectionHeading
              eyebrow="Across Every Mandate"
              title={<>The practical capabilities behind a successful close.</>}
              description="Our value is not limited to introductions. We provide the structure and discipline that turn a good opportunity into a completed transaction."
            />
          </Reveal>
          <div className="mt-14 grid gap-px bg-navy-900/10 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((item, index) => (
              <Reveal key={item.title} delay={(index % 3) * 80}>
                <div className="h-full bg-ivory-50 p-8">
                  <h3 className="font-display text-xl text-navy-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-charcoal-500">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ContactCTA />
    </>
  );
}
