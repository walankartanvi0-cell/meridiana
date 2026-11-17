import type { Metadata } from "next";
import ContactForm from "@/components/forms/ContactForm";
import PageHero from "@/components/layout/PageHero";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { contactDetails } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact the Meridiana advisory team in complete confidence.",
};

const nextSteps = [
  {
    number: "01",
    title: "We read your message",
    description: "A senior advisor reviews every enquiry personally before any conversation is arranged.",
  },
  {
    number: "02",
    title: "We arrange a call",
    description: "If it is useful, we set up a confidential introductory call at a time that suits you.",
  },
  {
    number: "03",
    title: "We give you a view",
    description: "You receive an honest initial perspective on timing, positioning and possible next steps.",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Get in Touch"
        title="A confidential conversation starts here."
        description="Whether you have a specific mandate in mind or simply want an informed view, we would be glad to hear from you."
        image="/images/city-dusk.jpg"
      />

      <section className="bg-white py-24 sm:py-28">
        <div className="container-wide grid gap-14 lg:grid-cols-[1.3fr_0.7fr] lg:gap-20">
          <Reveal>
            <div className="max-w-2xl">
              <SectionHeading
                eyebrow="Send a Message"
                title={<>Tell us what is on your mind.</>}
                description="Please avoid sending sensitive financial documents at this stage. We will arrange a secure channel once a conversation begins."
              />
            </div>
            <div className="mt-10">
              <ContactForm />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <aside className="h-full bg-navy-950 p-9 text-ivory-200">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-400">Direct Contact</p>
              <div className="mt-8 space-y-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-ivory-200/45">Email</p>
                  <a href={`mailto:${contactDetails.email}`} className="mt-2 block font-display text-xl text-white hover:text-gold-300">
                    {contactDetails.email}
                  </a>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-ivory-200/45">Telephone</p>
                  <a href={`tel:${contactDetails.phone.replace(/[^+\d]/g, "")}`} className="mt-2 block font-display text-xl text-white hover:text-gold-300">
                    {contactDetails.phone}
                  </a>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-ivory-200/45">Availability</p>
                  <p className="mt-2 text-sm text-ivory-200/75">{contactDetails.hours}</p>
                </div>
              </div>
              <div className="mt-10 border-t border-white/15 pt-7">
                <p className="font-display text-xl italic leading-snug text-gold-300">
                  “Every enquiry is handled with complete discretion.”
                </p>
              </div>
            </aside>
          </Reveal>
        </div>
      </section>

      <section className="bg-ivory-50 py-24 sm:py-28">
        <div className="container-wide">
          <Reveal>
            <SectionHeading eyebrow="What Happens Next" title={<>A simple, considered response.</>} align="center" />
          </Reveal>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {nextSteps.map((step, index) => (
              <Reveal key={step.number} delay={index * 100}>
                <div className="border-t border-gold-500/60 pt-6">
                  <span className="text-[11px] font-semibold tracking-[0.18em] text-gold-600">{step.number}</span>
                  <h3 className="mt-4 font-display text-xl text-navy-900">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-charcoal-500">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
