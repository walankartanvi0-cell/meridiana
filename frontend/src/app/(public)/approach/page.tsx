import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/layout/PageHero";
import ContactCTA from "@/components/sections/ContactCTA";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { approachSteps } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our Approach",
  description: "How Meridiana runs advisory mandates from first conversation to completion.",
};

const stageImages = [
  "/images/boardroom.jpg",
  "/images/financial-analysis.jpg",
  "/images/handshake.jpg",
  "/images/advisory-team.jpg",
];

const commitments = [
  {
    title: "One senior point of contact",
    description: "You always know who is running your mandate and can reach them directly.",
  },
  {
    title: "A shared timeline",
    description: "We agree milestones at the start and report progress against them throughout.",
  },
  {
    title: "Honest feedback",
    description: "Even difficult buyer feedback reaches you quickly and with a recommended response.",
  },
  {
    title: "Confidentiality by default",
    description: "Your information is shared only with parties who have been properly vetted.",
  },
];

export default function ApproachPage() {
  return (
    <>
      <PageHero
        eyebrow="How We Work"
        title="A process you can trust, led by people you know."
        description="Transactions are complex enough without uncertainty about the process. We make each stage clear, measurable and properly managed."
        image="/images/advisory-team.jpg"
      />

      <section className="bg-white py-24 sm:py-28">
        <div className="container-wide space-y-24">
          {approachSteps.map((step, index) => (
            <Reveal key={step.number}>
              <article className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
                <div className={`relative ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                  <Image
                    src={stageImages[index]}
                    alt={step.title}
                    width={900}
                    height={650}
                    className="aspect-[16/10] w-full object-cover"
                  />
                  <div className="absolute -bottom-5 left-6 bg-navy-900 px-6 py-4">
                    <span className="font-display text-3xl text-gold-400">{step.number}</span>
                  </div>
                </div>
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-600">Stage {step.number}</p>
                  <h2 className="mt-4 font-display text-4xl leading-tight text-navy-900">{step.title}</h2>
                  <p className="mt-5 text-sm leading-7 text-charcoal-500">{step.description}</p>
                  <div className="mt-7 h-px w-16 bg-gold-500" />
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-ivory-50 py-24 sm:py-28">
        <div className="container-wide">
          <Reveal>
            <SectionHeading
              eyebrow="What You Can Expect"
              title={<>The same standard at every stage.</>}
              description="Our approach is not only about technique. It is about how you experience the process as a client."
              align="center"
            />
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {commitments.map((item, index) => (
              <Reveal key={item.title} delay={index * 80}>
                <div className="border border-navy-900/10 bg-white p-7">
                  <h3 className="font-display text-xl text-navy-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-charcoal-500">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ContactCTA />
    </>
  );
}
