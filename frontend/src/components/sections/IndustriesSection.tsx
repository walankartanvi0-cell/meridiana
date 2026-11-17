import Image from "next/image";
import ArrowLink from "@/components/ui/ArrowLink";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { industries } from "@/lib/site";

export default function IndustriesSection() {
  return (
    <section className="relative overflow-hidden bg-navy-900 py-24 sm:py-28">
      <Image
        src="/images/architecture.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-10"
      />
      <div className="container-wide relative">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <Reveal>
            <SectionHeading
              eyebrow="Where We Focus"
              title={
                <>
                  Deep sector knowledge. <span className="text-gold-400">Genuine perspective.</span>
                </>
              }
              description="We concentrate on industries where operating experience and transaction insight matter. This focus helps us speak the language of your business and identify the right counterparties quickly."
              light
            />
          </Reveal>
          <Reveal delay={100}>
            <ArrowLink href="/industries" light>
              All Industries
            </ArrowLink>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-x-12 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry, index) => (
            <Reveal key={industry.name} delay={(index % 3) * 100}>
              <div className="group flex items-start gap-5 border-t border-white/15 py-7 transition-colors hover:border-gold-500/60">
                <span className="mt-1 text-[11px] font-semibold tracking-[0.16em] text-gold-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-xl text-white transition-colors group-hover:text-gold-300">
                    {industry.name.trim()}
                  </h3>
                  <p className="mt-2 text-[13px] leading-6 text-ivory-200/55">
                    {industry.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
