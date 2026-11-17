import Reveal from "@/components/ui/Reveal";

export type ProcessStep = {
  number: string;
  title: string;
  description: string;
};

export default function ProcessTimeline({ steps }: { steps: ProcessStep[] }) {
  return (
    <div className="relative mt-14">
      <div className="absolute bottom-10 left-[23px] top-6 w-px bg-navy-900/10" />
      <div className="space-y-10">
        {steps.map((step, index) => (
          <Reveal key={step.number} delay={(index % 3) * 80}>
            <div className="relative grid gap-5 pl-16 sm:grid-cols-[1fr_1fr] sm:gap-12">
              <div className="absolute left-0 top-1 flex h-12 w-12 items-center justify-center border border-gold-500/60 bg-white font-display text-lg text-gold-600">
                {step.number}
              </div>
              <h3 className="pt-2 font-display text-2xl text-navy-900">{step.title}</h3>
              <p className="text-sm leading-7 text-charcoal-500">{step.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
