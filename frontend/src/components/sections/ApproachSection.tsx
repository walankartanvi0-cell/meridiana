import ArrowLink from "@/components/ui/ArrowLink";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { approachSteps } from "@/lib/site";

export default function ApproachSection() {
  return (
    <section className="bg-ivory-50 py-24 sm:py-28">
      <div className="container-wide">
        <Reveal>
          <SectionHeading
            eyebrow="Our Approach"
            title={
              <>
                A disciplined process. <span className="text-gold-600">A human touch.</span>
              </>
            }
            description="Every mandate is different, but the principles behind our work never change. Four stages, clearly defined, with you informed throughout."
            align="center"
          />
        </Reveal>

        <div className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-navy-900/10 md:block" />
          {approachSteps.map((step, index) => (
            <Reveal key={step.number} delay={index * 100}>
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center border border-gold-500/70 bg-ivory-50 font-display text-lg text-gold-600">
                  {step.number}
                </div>
                <h3 className="mt-7 font-display text-2xl text-navy-900">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-charcoal-500">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-14 text-center">
            <ArrowLink href="/approach">See Our Full Approach</ArrowLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
