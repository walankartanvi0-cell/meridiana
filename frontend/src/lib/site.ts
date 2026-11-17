/**
 * Shared content and navigation data for the public website.
 * Keeping this in one place makes the site consistent and easy to update.
 */

export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

export const mainNavigation: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "The Firm",
    href: "/about",
    children: [
      { label: "About Us", href: "/about" },
      { label: "Our Approach", href: "/approach" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    label: "Advisory",
    href: "/expertise",
    children: [
      { label: "Our Expertise", href: "/expertise" },
      { label: "Sell-Side Advisory", href: "/sell-side" },
      { label: "Buy-Side Advisory", href: "/buy-side" },
      { label: "Strategic Advisory", href: "/strategic-advisory" },
    ],
  },
  { label: "Industries", href: "/industries" },
];

export const firmLinks: NavItem[] = [
  { label: "About Us", href: "/about" },
  { label: "Our Approach", href: "/approach" },
  { label: "Contact Us", href: "/contact" },
];

export const advisoryLinks: NavItem[] = [
  { label: "Our Expertise", href: "/expertise" },
  { label: "Sell-Side Advisory", href: "/sell-side" },
  { label: "Buy-Side Advisory", href: "/buy-side" },
  { label: "Strategic Advisory", href: "/strategic-advisory" },
];

export const industries = [
  {
    name: "Industrial & Manufacturing",
    description:
      "Family-owned manufacturers, specialty fabricators and engineered product businesses with durable customer relationships.",
  },
  {
    name: "Business Services",
    description:
      "Recurring-revenue service platforms, facilities, logistics and professional services with scalable operating models.",
  },
  {
    name: "Healthcare & Life Sciences",
    description:
      "Specialty clinics, diagnostics, distribution and healthcare services businesses with strong regulatory foundations.",
  },
  {
    name: "Consumer & Retail",
    description:
      "Branded consumer businesses, specialty retail and e-commerce platforms with loyal end customers.",
  },
  {
    name: "Technology & Software",
    description:
      "B2B software, managed services and technology-enabled businesses with predictable subscription revenue.",
  },
  {
    name: "Food & Agriculture",
    description:
      "Processing, distribution and agricultural businesses with defensible supply chains and regional scale.",
  },
];

export const services = [
  {
    number: "01",
    title: "Sell-Side Advisory",
    summary:
      "Position your business, run a disciplined process and secure the right partner on the right terms.",
    href: "/sell-side",
  },
  {
    number: "02",
    title: "Buy-Side Advisory",
    summary:
      "Source, evaluate and acquire businesses that strengthen your strategy — with rigorous diligence throughout.",
    href: "/buy-side",
  },
  {
    number: "03",
    title: "Strategic Advisory",
    summary:
      "Independent advice on capital structure, growth strategy, joint ventures and corporate transactions.",
    href: "/strategic-advisory",
  },
];

export const approachSteps = [
  {
    number: "01",
    title: "Listen & Understand",
    description:
      "We begin with your objectives, not a template. Every mandate starts with a careful review of the business, its people and its potential.",
  },
  {
    number: "02",
    title: "Position & Prepare",
    description:
      "We shape the narrative, organise the data room and build a targeted counterparty list built on evidence rather than guesswork.",
  },
  {
    number: "03",
    title: "Execute & Negotiate",
    description:
      "We manage outreach, coordinate diligence and negotiate terms while protecting confidentiality and momentum at every stage.",
  },
  {
    number: "04",
    title: "Close & Transition",
    description:
      "We stay close through documentation, regulatory steps and handover, so the transaction lands as planned.",
  },
];

export const contactDetails = {
  email: "hello@meridiana.com",
  phone: "+1 (212) 555-0148",
  hours: "Monday – Friday, 9:00 – 18:00 ET",
  note: "All enquiries are treated as strictly confidential.",
};
