import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/layout/PageHero";
import ContactCTA from "@/components/sections/ContactCTA";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Industries",
  description: "Sectors served by Meridiana's lower-middle-market M&A advisory team.",
};

const sectors = [
  {
    name: "Industrial & Manufacturing",
    description: "Family-owned manufacturers, specialty fabricators and engineered product businesses with durable customer relationships.",
    mandates: "Owner transitions, strategic add-ons, recapitalisations",
  },
  {
    name: "Business Services",
    description: "Recurring-revenue service platforms, facilities, logistics and professional services with scalable operating models.",
    mandates: "Platform sales, bolt-on acquisitions, management buyouts",
  },
  {
    name: "Healthcare & Life Sciences",
    description: "Specialty clinics, diagnostics, distribution and healthcare services businesses with strong regulatory foundations.",
    mandates: "Consolidation, physician transitions, growth capital",
  },
  {
    name: "Consumer & Retail",
    description: "Branded consumer businesses, specialty retail and e-commerce platforms with loyal end customers.",
    mandates: "Brand sales, channel expansion, strategic investment",
  },
  {
    name: "Technology & Software",
    description: "B2B software, managed services and technology-enabled businesses with predictable subscription revenue.",
    mandates: "Acqui-hires, roll-ups, majority investments",
  },
  {
    name: "Food & Agriculture",
    description: "Processing, distribution and agricultural businesses with defensible supply chains and regional scale.",
    mandates: "Succession, geographic expansion, supply-chain consolidation",
  },
];

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Sector Focus"
        title="We know the businesses we advise."
        description="Sector fluency shortens the learning curve, sharpens positioning and helps us find counterparties who genuinely understand the value in your business."
        image="/images/architecture.jpg"
      />

      <section className="bg-white py-24 sm:py-28">
        <div className="container-wide">
          <Reveal>
            <SectionHeading
              eyebrow="Where We Work"
              title={<>Focused industries, relevant experience.</>}
              description="We selectively advise businesses across six sectors where operating insight and transaction experience make a measurable difference."
            />
          </Reveal>
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {sectors.map((sector, index) => (
              <Reveal key={sector.name} delay={(index % 2) * 100}>
                <article className="group h-full border border-navy-900/10 p-8 transition-all duration-300 hover:border-gold-500/60 hover:shadow-elevated">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="font-display text-2xl text-navy-900">{sector.name}</h2>
                    <span className="font-display text-2xl text-gold-500/60">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-charcoal-500">{sector.description}</p>
                  <div className="mt-6 border-t border-navy-900/10 pt-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-600">
                      Typical mandates
                    </p>
                    <p className="mt-2 text-sm text-charcoal-700">{sector.mandates}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory-50 py-24 sm:py-28">
        <div className="container-wide grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <Image
              src="/images/advisory-team.jpg"
              alt="Advisory team discussing a transaction"
              width={900}
              height={650}
              className="aspect-[16/10] w-full object-cover"
            />
          </Reveal>
          <div>
            <Reveal>
              <SectionHeading
                eyebrow="Why It Matters"
                title={<>Sector knowledge changes the conversation.</>}
                description="Buyers and investors can tell when an advisor understands the operating realities of a business. That credibility helps protect valuation, keeps diligence focused and builds the trust needed to close."
              />
            </Reveal>
            <Reveal delay={100}>
              <ul className="mt-8 space-y-4">
                {[
                  "We speak the language of your customers, suppliers and regulators.",
                  "Our counterparty lists are based on real transaction activity in your sector.",
                  "We anticipate the diligence questions a buyer will ask — before they ask them.",
                ].map((point) => (
                  <li key={point} className="flex gap-4 text-sm leading-7 text-charcoal-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-500" />
                    {point}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <ContactCTA />
    </>
  );
}
