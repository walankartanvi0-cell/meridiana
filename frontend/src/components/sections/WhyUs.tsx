import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

const reasons = [
  {
    title: "Senior, hands-on team",
    description:
      "The people you meet are the people who run your transaction. No hand-offs to a junior team after the pitch.",
  },
  {
    title: "A selective process",
    description:
      "We take on a small number of mandates each year. That discipline protects your confidentiality and our attention.",
  },
  {
    title: "Realistic valuation",
    description:
      "We anchor expectations in live market evidence, not headline multiples that never close.",
  },
  {
    title: "Relationships that last",
    description:
      "Our work does not end at signing. Many of our strongest mandates come from clients we advised years earlier.",
  },
];

export default function WhyUs() {
  return (
    <section className="bg-white py-24 sm:py-28">
      <div className="container-wide">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal>
            <SectionHeading
              eyebrow="Why Meridiana"
              title={
                <>
                  Built for the <span className="text-gold-600">middle market.</span>
                </>
              }
              description="Lower-middle-market transactions are different. They demand patience, flexibility and an understanding that a business is also a personal legacy. That is precisely how we work."
            />
            <div className="mt-10 border-l-2 border-gold-500 pl-6">
              <p className="font-display text-2xl italic leading-snug text-navy-900">
                “The best advice is clear enough to act on and honest enough to trust.”
              </p>
            </div>
          </Reveal>

          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {reasons.map((reason, index) => (
              <Reveal key={reason.title} delay={index * 80}>
                <div className="border-t border-navy-900/15 pt-6">
                  <span className="text-[11px] font-semibold tracking-[0.18em] text-gold-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-display text-xl text-navy-900">{reason.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-charcoal-500">{reason.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
