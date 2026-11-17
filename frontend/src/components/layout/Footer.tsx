import Link from "next/link";
import Year from "@/components/ui/Year";
import { advisoryLinks, contactDetails, firmLinks } from "@/lib/site";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-ivory-200">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold-500/70 to-transparent" />
      <div className="container-wide py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo light />
            <p className="mt-6 max-w-xs text-sm leading-7 text-ivory-200/65">
              Independent M&amp;A advice for lower-middle-market businesses. We help founders and
              management teams make confident decisions at defining moments.
            </p>
            <div className="mt-6 flex gap-3">
              <span className="h-8 w-px bg-gold-500/60" />
              <p className="text-[11px] uppercase leading-5 tracking-[0.18em] text-gold-400/80">
                Discretion · Judgement · Execution
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-400">
              The Firm
            </h3>
            <ul className="space-y-3 text-sm text-ivory-200/70">
              {firmLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/industries" className="transition-colors hover:text-white">
                  Industries
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-400">
              Advisory
            </h3>
            <ul className="space-y-3 text-sm text-ivory-200/70">
              {advisoryLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-400">
              Get in Touch
            </h3>
            <address className="space-y-3 text-sm not-italic leading-6 text-ivory-200/70">
              <p>
                <a href={`mailto:${contactDetails.email}`} className="transition-colors hover:text-white">
                  {contactDetails.email}
                </a>
              </p>
              <p>
                <a href={`tel:${contactDetails.phone.replace(/[^+\d]/g, "")}`} className="transition-colors hover:text-white">
                  {contactDetails.phone}
                </a>
              </p>
              <p className="pt-2 text-xs text-ivory-200/45">{contactDetails.hours}</p>
              <p className="text-xs text-ivory-200/45">{contactDetails.note}</p>
            </address>
            <Link
              href="/consultation"
              className="mt-6 inline-flex border border-gold-500/60 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-400 transition-colors hover:bg-gold-500 hover:text-navy-950"
            >
              Start a Conversation
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-7 text-[11px] text-ivory-200/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <Year /> Meridiana. All rights reserved.
          </p>
          <p>
            M&amp;A advisory services are provided subject to a signed engagement letter. Nothing on
            this site constitutes an offer or solicitation.
          </p>
        </div>
      </div>
    </footer>
  );
}
