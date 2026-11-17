import Image from "next/image";
import ArrowLink from "@/components/ui/ArrowLink";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

const principles = [
  "Senior attention on every mandate, from first conversation to closing",
  "A focused buyer and investor network built over years of transaction work",
  "Straight advice, even when the answer is not the one you expected",
];

export default function Introduction() {
  return (
    <section className="bg-ivory-50 py-24 sm:py-28">
      <div className="container-wide grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
        <Reveal>
          <div className="relative">
            <div className="absolute -bottom-5 -left-5 h-40 w-40 border border-gold-500/50" />
            <Image
              src="/images/boardroom.jpg"
              alt="Advisors in a confidential boardroom discussion"
              width={900}
              height={680}
              className="relative aspect-[4/3] w-full object-cover shadow-elevated"
            />
            <div className="absolute -right-4 -top-4 bg-navy-900 px-6 py-5 text-white">
              <p className="font-display text-3xl text-gold-400">Independent</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-ivory-200/60">
                By conviction
              </p>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <SectionHeading
              eyebrow="Who We Are"
              title={
                <>
                  A specialist firm for businesses at an{" "}
                  <span className="text-gold-600">inflection point.</span>
                </>
              }
              description="Meridiana was founded on a simple belief: mid-market business owners deserve the same quality of advice, discretion and execution that large corporations take for granted. We work on a limited number of mandates at any one time, so your transaction always has the attention it deserves."
            />
          </Reveal>

          <Reveal delay={100}>
            <ul className="mt-9 space-y-4">
              {principles.map((principle) => (
                <li key={principle} className="flex gap-4 text-sm leading-6 text-charcoal-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-500" />
                  {principle}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-10">
              <ArrowLink href="/about">Learn About Meridiana</ArrowLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
