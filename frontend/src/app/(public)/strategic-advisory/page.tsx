import type { Metadata } from "next";
import PageHero from "@/components/layout/PageHero";
import ContactCTA from "@/components/sections/ContactCTA";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Strategic Advisory",
  description: "Independent advice on strategy, capital structure and corporate transactions.",
};

const services = [
  {
    number: "01",
    title: "Growth strategy",
    description: "Assess markets, capabilities and capital requirements to identify the most credible routes to growth.",
  },
  {
    number: "02",
    title: "Capital structure review",
    description: "Evaluate debt and equity options, refinancing needs and the trade-offs between control and flexibility.",
  },
  {
    number: "03",
    title: "Divestitures & carve-outs",
    description: "Separate non-core businesses cleanly, protect value and manage the operational complexity of a carve-out.",
  },
  {
    number: "04",
    title: "Joint ventures & partnerships",
    description: "Structure alliances that align incentives, governance and long-term strategic intent.",
  },
  {
    number: "05",
    title: "Valuation opinions",
    description: "Provide independent, well-documented valuation analysis for boards, shareholders and transactions.",
  },
  {
    number: "06",
    title: "Board advisory",
    description: "Give management and boards a candid, commercially grounded view when decisions are difficult.",
  },
];

export default function StrategicAdvisoryPage() {
  return (
    <>
      <PageHero
        eyebrow="Strategic Advisory"
        title="The right question before the right transaction."
        description="Independent thinking for boards and management teams facing decisions about growth, capital, structure and the future of the business."
        image="/images/financial-analysis.jpg"
      />

      <section className="bg-white py-24 sm:py-28">
        <div className="container-wide">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <Reveal>
              <SectionHeading
                eyebrow="Independent Perspective"
                title={<>Advice you can trust, even when it is uncomfortable.</>}
                description="Strategic decisions are rarely clear-cut. We bring an outside perspective backed by transaction experience, and we give you a view you can act on — including when the answer is to wait, restructure or do nothing at all."
              />
            </Reveal>
            <Reveal delay={100}>
              <div className="border-l-2 border-gold-500 bg-ivory-50 p-8">
                <p className="font-display text-2xl italic leading-snug text-navy-900">
                  “Independence means we can tell you what the market will actually support, not what you would like to hear.”
                </p>
              </div>
            </Reveal>
          </div>

          <div className="mt-16 grid gap-px bg-navy-900/10 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Reveal key={service.title} delay={(index % 3) * 80}>
                <article className="h-full bg-white p-8">
                  <span className="text-[11px] font-semibold tracking-[0.18em] text-gold-600">{service.number}</span>
                  <h2 className="mt-5 font-display text-xl text-navy-900">{service.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-charcoal-500">{service.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-900 py-20">
        <div className="container-wide grid gap-10 lg:grid-cols-3">
          {[
            { title: "Objective", text: "No product to sell and no transaction to push. Our recommendation is based on your interests." },
            { title: "Practical", text: "Advice grounded in what buyers, lenders and regulators will actually accept in the current market." },
            { title: "Confidential", text: "Sensitive discussions stay within a small, senior team bound by discretion." },
          ].map((item, index) => (
            <Reveal key={item.title} delay={index * 100}>
              <div className="border-t border-gold-500/60 pt-6">
                <h3 className="font-display text-2xl text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-ivory-200/65">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <ContactCTA />
    </>
  );
}
