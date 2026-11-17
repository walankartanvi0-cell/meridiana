import ArrowLink from "@/components/ui/ArrowLink";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { services } from "@/lib/site";

const icons = [
  <path key="a" d="M4 19V7l8 8 8-8v12" />,
  <path key="b" d="M4 7h16M4 7l6-4M20 7l-6-4M12 7v14M8 21h8" />,
  <path key="c" d="M4 18h16M6 18V9l6-5 6 5v9M10 18v-5h4v5" />,
];

export default function Services() {
  return (
    <section className="bg-white py-24 sm:py-28">
      <div className="container-wide">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <Reveal>
            <SectionHeading
              eyebrow="How We Help"
              title={
                <>
                  Focused expertise across the{" "}
                  <span className="text-gold-600">transaction lifecycle.</span>
                </>
              }
              description="Whether you are preparing to sell, searching for an acquisition or rethinking your capital structure, we bring the right process and the right people to the table."
            />
          </Reveal>
          <Reveal delay={100}>
            <ArrowLink href="/expertise">View All Expertise</ArrowLink>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.href} delay={index * 100}>
              <article className="group flex h-full flex-col border border-navy-900/10 bg-ivory-50/40 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/60 hover:bg-white hover:shadow-elevated">
                <div className="flex items-start justify-between">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-9 w-9 text-gold-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {icons[index]}
                  </svg>
                  <span className="font-display text-3xl text-navy-900/10">{service.number}</span>
                </div>
                <h3 className="mt-8 font-display text-2xl text-navy-900">{service.title}</h3>
                <p className="mt-4 flex-1 text-sm leading-7 text-charcoal-500">{service.summary}</p>
                <div className="mt-8 border-t border-navy-900/10 pt-6">
                  <ArrowLink href={service.href}>Explore Service</ArrowLink>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
