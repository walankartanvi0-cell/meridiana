import Image from "next/image";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";

export default function ContactCTA() {
  return (
    <section className="relative overflow-hidden bg-navy-950">
      <div className="absolute inset-y-0 right-0 w-full lg:w-1/2">
        <Image
          src="/images/city-dusk.jpg"
          alt=""
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/60 to-transparent" />
      </div>
      <div className="container-wide relative py-24 sm:py-28">
        <Reveal>
          <div className="max-w-2xl">
            <div className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-400">
              <span className="h-px w-8 bg-gold-500" />
              Start a Conversation
            </div>
            <h2 className="font-display text-4xl leading-tight text-white sm:text-5xl">
              Every significant transaction begins with a private conversation.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-ivory-200/70">
              Tell us what you are considering. We will give you an honest view on timing,
              positioning and the right path forward — with no obligation.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button href="/consultation" size="lg">
                Request a Consultation
              </Button>
              <Button href="/contact" variant="outline" size="lg">
                Contact the Team
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
