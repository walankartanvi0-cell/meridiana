import Image from "next/image";
import Link from "next/link";

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  image?: string;
  breadcrumb?: string;
};

export default function PageHero({ eyebrow, title, description, image, breadcrumb }: Props) {
  return (
    <section className="relative overflow-hidden bg-navy-950">
      {image && (
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/90 to-navy-950/40" />
      <div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full border border-gold-500/20" />
      <div className="pointer-events-none absolute -right-10 -top-20 h-72 w-72 rounded-full border border-gold-500/10" />

      <div className="container-wide relative py-20 sm:py-24">
        <div className="mb-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-ivory-200/50">
          <Link href="/" className="transition-colors hover:text-gold-400">
            Home
          </Link>
          <span>/</span>
          <span className="text-gold-400">{breadcrumb ?? title}</span>
        </div>
        <div className="max-w-3xl">
          <div className="mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-400">
            <span className="h-px w-8 bg-gold-500" />
            {eyebrow}
          </div>
          <h1 className="font-display text-5xl font-medium leading-[1.08] text-white sm:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="mt-6 max-w-2xl text-base leading-7 text-ivory-200/75 sm:text-lg">
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
