import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/layout/PageHero";
import ContactCTA from "@/components/sections/ContactCTA";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Meridiana, an independent M&A advisory firm for lower-middle-market businesses.",
};

const beliefs = [
  {
    title: "Discretion first",
    description:
      "Confidentiality is the foundation of our work. We protect your information, your relationships and your options at every stage.",
  },
  {
    title: "Clarity over complexity",
    description:
      "Transactions can be complicated. Our job is to make the choices understandable, the trade-offs explicit and the next step obvious.",
  },
  {
    title: "Judgement earned",
    description:
      "We combine financial analysis with operating experience, so our advice reflects how a business really works — not just how it models.",
  },
  {
    title: "Commitment to people",
    description:
      "For most owners, a transaction is personal. We respect the legacy behind the numbers and the people whose lives are affected.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="The Firm"
        title="Independent by design. Experienced by nature."
        description="We are a specialist advisory firm built around a clear idea: lower-middle-market businesses and their owners deserve focused, senior-level advice."
        image="/images/office-interior.jpg"
      />

      <section className="bg-white py-24 sm:py-28">
        <div className="container-wide grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div className="relative">
              <div className="absolute -bottom-5 -right-5 h-44 w-44 border border-gold-500/50" />
              <Image
                src="/images/architecture.jpg"
                alt="Contemporary architecture symbolising clarity and structure"
                width={900}
                height={700}
                className="relative aspect-[4/3] w-full object-cover"
              />
            </div>
          </Reveal>
          <div>
            <Reveal>
              <SectionHeading
                eyebrow="Our Story"
                title={
                  <>
                    Built around the needs of <span className="text-gold-600">owner-led businesses.</span>
                  </>
                }
              />
            </Reveal>
            <Reveal delay={100}>
              <div className="mt-7 space-y-5 text-sm leading-7 text-charcoal-500">
                <p>
                  Meridiana was created to serve a segment of the market that is often underserved.
                  Businesses with EBITDA between $2 million and $10 million are too substantial for a
                  casual introduction, yet too often overlooked by large institutions chasing bigger
                  fees.
                </p>
                <p>
                  We built a firm that sits in that gap deliberately. Our structure is lean, our
                  mandate list is short, and our senior advisors remain involved from the first
                  conversation through to completion. That focus allows us to give each client the
                  calm, considered attention a major decision deserves.
                </p>
                <p>
                  We measure our success not by the number of transactions we announce, but by
                  whether clients would ask us to advise them again — and whether they would
                  recommend us to someone they trust.
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
              eyebrow="What We Believe"
              title={<>Four principles guide every mandate.</>}
              align="center"
            />
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {beliefs.map((belief, index) => (
              <Reveal key={belief.title} delay={index * 80}>
                <article className="h-full border-t-2 border-gold-500/70 bg-white p-7">
                  <span className="text-[11px] font-semibold tracking-[0.18em] text-gold-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 font-display text-xl text-navy-900">{belief.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-charcoal-500">{belief.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-950 py-20">
        <div className="container-wide grid gap-10 lg:grid-cols-3 lg:items-center">
          <Reveal>
            <div className="lg:col-span-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-gold-400">
                The Meridiana Standard
              </p>
              <h2 className="mt-5 max-w-2xl font-display text-4xl leading-tight text-white">
                A small firm, deliberately. So your transaction never competes for attention.
              </h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="grid grid-cols-2 gap-6 border-l border-white/15 pl-8">
              <div>
                <p className="font-display text-4xl text-gold-400">Senior</p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-ivory-200/50">Advisors throughout</p>
              </div>
              <div>
                <p className="font-display text-4xl text-gold-400">Limited</p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-ivory-200/50">Concurrent mandates</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <ContactCTA />
    </>
  );
}
