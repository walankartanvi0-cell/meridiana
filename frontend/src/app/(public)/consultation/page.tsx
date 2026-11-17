import type { Metadata } from "next";
import ConsultationForm from "@/components/forms/ConsultationForm";
import PageHero from "@/components/layout/PageHero";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Request a Consultation",
  description: "Request a confidential initial consultation with the Meridiana advisory team.",
};

const expectations = [
  {
    number: "01",
    title: "A senior response",
    description: "Your request is reviewed by an experienced advisor, not a general inbox or automated system.",
  },
  {
    number: "02",
    title: "About one business day",
    description: "We aim to respond within one business day to arrange a convenient, confidential conversation.",
  },
  {
    number: "03",
    title: "No obligation",
    description: "The first conversation is about understanding your situation. There is no commitment on either side.",
  },
];

export default function ConsultationPage() {
  return (
    <>
      <PageHero
        eyebrow="Private Consultation"
        title="Let's talk about what comes next."
        description="Share a few details and we will give you an initial, confidential view of your options — with no obligation and no pressure."
        image="/images/boardroom.jpg"
      />

      <section className="bg-white py-24 sm:py-28">
        <div className="container-wide grid gap-14 lg:grid-cols-[1.25fr_0.75fr] lg:gap-20">
          <Reveal>
            <div className="max-w-2xl">
              <SectionHeading
                eyebrow="Request Form"
                title={<>A few details to get us started.</>}
                description="The more context you can share, the more useful our first conversation will be. All information is treated as strictly confidential."
              />
            </div>
            <div className="mt-10">
              <ConsultationForm />
            </div>
          </Reveal>

          <div className="space-y-8">
            <Reveal delay={100}>
              <aside className="bg-navy-950 p-9 text-ivory-200">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-400">Your Privacy</p>
                <p className="mt-6 text-sm leading-7 text-ivory-200/75">
                  We understand that a potential transaction is highly sensitive. Details shared in this
                  form are seen only by the advisory team and are never used for marketing or shared
                  with third parties.
                </p>
                <div className="mt-8 border-t border-white/15 pt-6">
                  <p className="font-display text-xl italic leading-snug text-gold-300">
                    “Trust is built before the first offer, not during the negotiation.”
                  </p>
                </div>
              </aside>
            </Reveal>
            <Reveal delay={200}>
              <div className="border border-navy-900/10 p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-600">Who We Advise</p>
                <p className="mt-4 text-sm leading-7 text-charcoal-500">
                  Owners and management teams of businesses with EBITDA of roughly $2 million to $10
                  million, plus buyers seeking carefully selected lower-middle-market opportunities.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-ivory-50 py-24 sm:py-28">
        <div className="container-wide">
          <Reveal>
            <SectionHeading eyebrow="What To Expect" title={<>From enquiry to first conversation.</>} align="center" />
          </Reveal>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {expectations.map((item, index) => (
              <Reveal key={item.number} delay={index * 100}>
                <div className="border-t-2 border-gold-500/60 pt-6">
                  <span className="font-display text-2xl text-gold-600">{item.number}</span>
                  <h3 className="mt-4 font-display text-xl text-navy-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-charcoal-500">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
