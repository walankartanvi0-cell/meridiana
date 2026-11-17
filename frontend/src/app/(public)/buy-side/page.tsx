import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/layout/PageHero";
import ContactCTA from "@/components/sections/ContactCTA";
import ProcessTimeline from "@/components/sections/ProcessTimeline";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Buy-Side Advisory",
  description: "Search, assessment and acquisition support for strategic and private equity buyers.",
};

const steps = [
  {
    number: "01",
    title: "Define the mandate",
    description:
      "We agree a precise acquisition profile — sector, size, geography, capabilities and deal economics — so the search stays focused from the beginning.",
  },
  {
    number: "02",
    title: "Source opportunities",
    description:
      "We combine off-market outreach, sector networks and careful screening to bring you businesses that genuinely fit, rather than a long list of weak matches.",
  },
  {
    number: "03",
    title: "Initial assessment",
    description:
      "Each opportunity is reviewed for strategic fit, earnings quality and valuation. We filter early to protect your time and keep the process moving.",
  },
  {
    number: "04",
    title: "Diligence & validation",
    description:
      "We coordinate commercial, financial and operational diligence, manage information flow and surface risks while there is still time to respond.",
  },
  {
    number: "05",
    title: "Negotiate & close",
    description:
      "We support valuation discussions, structure and purchase agreement negotiations, and work alongside your legal and financing teams through completion.",
  },
];

const focusAreas = [
  {
    title: "Strategic acquisitions",
    description: "Add capabilities, customers or geographic reach with a clear view of post-deal integration.",
  },
  {
    title: "Platform investments",
    description: "Identify a strong first acquisition with the potential to build a larger, durable platform.",
  },
  {
    title: "Bolt-on opportunities",
    description: "Run repeatable, disciplined searches that extend an existing portfolio business.",
  },
  {
    title: "Management buyouts",
    description: "Advise management teams on structure, funding and partnership options.",
  },
];

export default function BuySidePage() {
  return (
    <>
      <PageHero
        eyebrow="Buy-Side Advisory"
        title="Find the right business. Buy it wisely."
        description="From mandate definition to completion, we give buyers a structured search, honest assessment and steady negotiation support."
        image="/images/strategy-session.jpg"
      />

      <section className="bg-white py-24 sm:py-28">
        <div className="container-wide grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div className="relative">
              <Image
                src="/images/office-interior.jpg"
                alt="Modern office used for acquisition planning"
                width={900}
                height={650}
                className="aspect-[4/3] w-full object-cover"
              />
              <span className="absolute -right-4 -top-4 bg-gold-500 px-6 py-4 font-display text-2xl text-navy-950">
                Evidence first.
              </span>
            </div>
          </Reveal>
          <div>
            <Reveal>
              <SectionHeading
                eyebrow="How We Think"
                title={<>An acquisition is only as good as the questions asked before it.</>}
                description="A successful acquisition starts long before an offer. We help you separate strategic logic from wishful thinking, test assumptions early and maintain the discipline to walk away when the evidence does not support the deal."
              />
            </Reveal>
            <Reveal delay={100}>
              <div className="mt-9 border-l-2 border-gold-500 pl-6">
                <p className="font-display text-2xl italic leading-snug text-navy-900">
                  “The right acquisition is the one that still makes sense after diligence.”
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-ivory-50 py-24 sm:py-28">
        <div className="container-wide">
          <Reveal>
            <SectionHeading
              eyebrow="Our Search Process"
              title={<>Structured, transparent and focused on fit.</>}
              align="center"
            />
          </Reveal>
          <ProcessTimeline steps={steps} />
        </div>
      </section>

      <section className="bg-white py-24 sm:py-28">
        <div className="container-wide">
          <Reveal>
            <SectionHeading eyebrow="Mandate Types" title={<>Buy-side work we regularly advise on.</>} />
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {focusAreas.map((area, index) => (
              <Reveal key={area.title} delay={index * 80}>
                <article className="h-full border-t-2 border-navy-900/10 pt-6 transition-colors hover:border-gold-500">
                  <h3 className="font-display text-xl text-navy-900">{area.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-charcoal-500">{area.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ContactCTA />
    </>
  );
}
