import Image from "next/image";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";

const highlights = [
  { value: "$2M – $10M", label: "EBITDA focus" },
  { value: "100%", label: "Independent advice" },
  { value: "Confidential", label: "By design" },
];

export default function Hero() {
  return (
    <section className="relative flex min-h-[720px] items-center overflow-hidden bg-navy-950">
      <Image
        src="/images/hero-skyline.jpg"
        alt="Modern financial district skyline"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/90 to-navy-950/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-navy-950/40" />
      <div className="pointer-events-none absolute right-[8%] top-[18%] h-80 w-80 rounded-full border border-gold-500/20" />
      <div className="pointer-events-none absolute right-[12%] top-[22%] h-64 w-64 rounded-full border border-gold-500/10" />

      <div className="container-wide relative w-full py-24 sm:py-32">
        <div className="max-w-3xl">
          <Reveal>
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px w-12 bg-gold-500" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-400">
                M&amp;A Advisory · Lower Middle Market
              </span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="font-display text-5xl font-medium leading-[1.06] text-white sm:text-6xl lg:text-7xl">
              Clarity in every <span className="text-gold-400">consequential decision.</span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-8 max-w-xl text-base leading-8 text-ivory-200/80 sm:text-lg">
              Meridiana advises founders, shareholders and management teams of lower-middle-market
              businesses on buying, selling and transforming their enterprises — with discretion,
              judgement and an unwavering focus on outcomes.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button href="/consultation" size="lg">
                Request a Consultation
              </Button>
              <Button href="/expertise" variant="outline" size="lg">
                Explore Our Expertise
              </Button>
            </div>
          </Reveal>
        </div>

        <div className="mt-20 grid gap-8 border-t border-white/10 pt-8 sm:grid-cols-3 sm:gap-12">
          {highlights.map((item, index) => (
            <Reveal key={item.label} delay={index * 100}>
              <div className="flex items-baseline gap-4 sm:block">
                <p className="font-display text-3xl text-gold-400">{item.value}</p>
                <p className="mt-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-ivory-200/55 sm:mt-2">
                  {item.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
