import type { LucideIcon } from "lucide-react";
import {
  CloudLightning,
  FileCheck,
  House,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Wrench,
} from "lucide-react";

export const PHONE = "(213) 415-6146";
export const PHONE_HREF = "tel:+12134156146";
export const EMAIL = "info@altroofingsolutionsinc.com";
export const EMAIL_HREF = "mailto:info@altroofingsolutionsinc.com";

export const siteCopy = {
  hero: {
    eyebrow: "Los Angeles · Licensed & Insured Roofing Contractor",
    titleLead: "Roofing done",
    titleAccent: "right.",
    subtitle:
      "Licensed Los Angeles roofers serving all of Southern California — free roof estimates, transparent pricing, and same-day response for repair, replacement, and emergency work.",
    bullets: ["Licensed & Insured", "5-Star Rated", "Free Inspections"],
    formLabel: "Free Quote · 60 seconds",
    formTitle: "Get your free roof estimate.",
    formSubtitle: "Quick details — we'll call you back today.",
    formDisclaimer: "No spam. No obligation. Just an honest quote.",
  },
  priceGuarantee: {
    label: "Lowest Price Guarantee",
    title: "We'll beat any price.",
    body: "Find a lower written estimate from a licensed roofing competitor in Southern California? We'll match it — and take an additional",
    highlight: "10% off",
    bodyEnd: "on top. Guaranteed.",
    ctaSecondary: "Get a free roof quote",
  },
  services: {
    label: "Roofing Services",
    titleLead: "Everything your roof needs.",
    titleMuted: "Nothing it doesn't.",
    intro:
      "From emergency leak repair to full roof replacement, ALT Roofing Solutions delivers licensed, insured roofing work across Los Angeles, Orange County, and the greater Southern California region.",
    cta: "Request quote",
  },
  manufacturers: {
    label: "Trusted Manufacturers",
    titleLead: "Premium roofing systems",
    titleAccent: "we work with.",
  },
  reviews: {
    label: "Customer Reviews",
    titleLead: "What our customers",
    titleAccent: "actually",
    titleEnd: "say.",
  },
  gallery: {
    label: "Recent Work",
    title: "Roofs we're proud of.",
    intro:
      "Real residential roof repair, replacement, and tile projects completed by ALT Roofing across Los Angeles and Southern California.",
  },
  whyAlt: {
    label: "Why ALT",
    titleLead: "A roofing company built on doing it",
    titleAccent: "right.",
    intro:
      "ALT Roofing Solutions was built for Los Angeles and Southern California homeowners who want a roofer they can trust — clear written estimates, experienced crews, and roofs that stand up to sun, wind, and rain.",
    imageAlt:
      "New asphalt shingle roof installation by ALT Roofing Solutions in Los Angeles, CA",
  },
  serviceArea: {
    label: "Service Area",
    titleLead: "Serving all of",
    titleAccent: "Southern California.",
    intro:
      "We provide roof repair, replacement, and inspection services throughout Los Angeles County and surrounding counties — from Orange County to the Inland Empire, Ventura, and Santa Barbara.",
  },
  quote: {
    label: "Free Quote",
    title: "Tell us about your roof.",
    intro:
      "Request a free roofing estimate for repair, replacement, or inspection. We respond fast — usually the same business day — with honest pricing and no pressure.",
    successTitle: "Thanks — we'll be in touch soon.",
    successBody:
      "A member of our roofing team will reach out shortly, usually the same day.",
  },
  footer: {
    tagline:
      "Licensed & insured roofing contractor in Los Angeles, CA. Roof repair, replacement, inspections, and maintenance across Southern California — with free estimates and honest pricing.",
    serviceArea:
      "Serving Los Angeles, Orange County, Riverside, San Bernardino, Ventura & Santa Barbara Counties",
  },
} as const;

export type Service = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const services: Service[] = [
  {
    title: "Roof Repair",
    description:
      "Expert roof repair in Los Angeles for leaks, missing shingles, damaged flashing, and storm-related damage — fast response and lasting fixes.",
    icon: Wrench,
  },
  {
    title: "Roof Replacement",
    description:
      "Complete roof replacement and tear-offs with premium Owens Corning and architectural shingles built to withstand Southern California weather.",
    icon: House,
  },
  {
    title: "Inspections",
    description:
      "Thorough roof inspections with detailed photos and honest reports — ideal before buying a home or after storm damage, with no sales pressure.",
    icon: Search,
  },
  {
    title: "Storm / Emergency",
    description:
      "24/7 emergency roof repair across Los Angeles and SoCal for active leaks, wind damage, and post-storm water intrusion.",
    icon: CloudLightning,
  },
  {
    title: "Roof Maintenance",
    description:
      "Preventive roof maintenance, debris removal, and seasonal tune-ups to extend shingle life and avoid costly repairs down the road.",
    icon: Shield,
  },
  {
    title: "Skylights & Coatings",
    description:
      "Skylight installation, reflective roof coatings, and cool-roof upgrades designed for LA's intense sun and energy efficiency goals.",
    icon: Sun,
  },
];

export const marqueeItems = [
  { label: "Licensed & Insured", icon: ShieldCheck },
  { label: "5-Star Rated", icon: Star },
  { label: "Free Estimates", icon: FileCheck },
  { label: "Free Inspections", icon: Sparkles },
] as const;

export const reviews = [
  {
    quote:
      "I had a really good experience with ALT Roofing Solutions. They responded fast, came out next day and found the issue right away. The crew showed up on time, worked efficiently and kept everything clean. You can tell they know what they're doing. The roof looks solid now and everything was quicker than expected. Definitely recommend them!",
    name: "Lina A.",
    initial: "L",
    location: "Glendale, CA · May 5, 2026",
  },
  {
    quote:
      "Called them for roof replacement. My shingle roof was old and missing some shingles. They came out, inspected it, and explained why we had heavy granule loss. They gave me a super competitive price and were here every day on time. Left everything nice and clean. Will definitely recommend ALT Roofing to anyone that needs a roof.",
    name: "Rad M.",
    initial: "R",
    location: "Sacramento, CA · May 9, 2026",
  },
] as const;

export const galleryImages = [
  {
    src: "/images/gallery/gallery-01.jpg",
    alt: "Completed roof replacement on a Craftsman-style Los Angeles home framed by mature trees",
  },
  {
    src: "/images/gallery/gallery-02.jpg",
    alt: "Fresh grey architectural shingles with a new vent pipe and brick chimney flashing",
  },
  {
    src: "/images/gallery/gallery-03.jpg",
    alt: "Aerial view of a completed dark asphalt shingle roof on a Southern California home",
  },
  {
    src: "/images/gallery/gallery-04.jpg",
    alt: "Overhead view of a finished shingle roof and driveway on a suburban Los Angeles home",
  },
  {
    src: "/images/gallery/gallery-05.jpg",
    alt: "Warm brown architectural shingle hip roof surrounded by tall pines",
  },
  {
    src: "/images/gallery/gallery-06.jpg",
    alt: "New shingle roof in progress with staged shingle bundles on the deck",
  },
  {
    src: "/images/gallery/gallery-07.jpg",
    alt: "Grey shingle roof under a clear blue sky with palm trees on the horizon",
  },
  {
    src: "/images/gallery/gallery-08.jpg",
    alt: "Concrete tile roof installation with underlayment strips and staged tiles",
  },
  {
    src: "/images/gallery/gallery-09.jpg",
    alt: "Aerial view of a grey architectural shingle hip roof with clean ridge lines",
  },
  {
    src: "/images/gallery/gallery-10.jpg",
    alt: "Grey shingle roof slope overlooking a backyard pool",
  },
  {
    src: "/images/gallery/gallery-11.jpg",
    alt: "Flat roof recover with a blue modified-bitumen membrane around the chimney",
  },
  {
    src: "/images/gallery/gallery-12.jpg",
    alt: "Coated flat roof section meeting new asphalt shingles on a residential home",
  },
  {
    src: "/images/gallery/gallery-13.jpg",
    alt: "Synthetic underlayment installed across a roof deck before shingle placement",
  },
  {
    src: "/images/gallery/gallery-14.jpg",
    alt: "Newly installed architectural shingles with a roof vent under a blue sky",
  },
  {
    src: "/images/gallery/gallery-15.jpg",
    alt: "Tan shingle roof with a hillside neighborhood view during installation",
  },
  {
    src: "/images/gallery/gallery-16.jpg",
    alt: "Grey shingle ridge and chimney on a completed roof, aerial neighborhood view",
  },
  {
    src: "/images/gallery/gallery-17.jpg",
    alt: "Two-story Los Angeles home with a freshly completed roof and clean gutters",
  },
  {
    src: "/images/gallery/gallery-18.jpg",
    alt: "Finished white flat roof at sunset with palm trees and a dramatic sky",
  },
] as const;

export type GalleryImage = (typeof galleryImages)[number];

export const whyAltFeatures = [
  {
    title: "Local LA team",
    description:
      "Born and based in Los Angeles — we know local building codes, coastal weather, and hillside roofing challenges.",
  },
  {
    title: "Quality materials",
    description:
      "Premium shingles and components from Owens Corning, Polyglass, and Westlake Royal — manufacturers we trust.",
  },
  {
    title: "Honest estimates",
    description:
      "Written, transparent pricing with no hidden fees, no upsells, and no high-pressure sales tactics.",
  },
  {
    title: "Satisfaction guaranteed",
    description:
      "We don't leave the job site until the roof is done right and you're completely satisfied with the work.",
  },
] as const;

export const serviceAreas: Record<string, string[]> = {
  "Orange County": [
    "Anaheim",
    "Santa Ana",
    "Irvine",
    "Huntington Beach",
    "Garden Grove",
    "Orange",
    "Fullerton",
    "Costa Mesa",
    "Mission Viejo",
    "Newport Beach",
    "Buena Park",
    "Westminster",
    "Laguna Niguel",
    "Yorba Linda",
    "La Habra",
    "Lake Forest",
    "Tustin",
    "Placentia",
    "Cypress",
    "Brea",
  ],
  "South Orange County": [
    "San Clemente",
    "Dana Point",
    "Laguna Beach",
    "San Juan Capistrano",
    "Laguna Hills",
    "Aliso Viejo",
    "Rancho Santa Margarita",
    "Ladera Ranch",
    "Coto de Caza",
    "Mission Viejo",
  ],
  "Riverside County": [
    "Riverside",
    "Corona",
    "Moreno Valley",
    "Murrieta",
    "Temecula",
    "Hemet",
    "Menifee",
    "Indio",
    "Palm Springs",
    "Cathedral City",
    "Palm Desert",
    "Perris",
    "Lake Elsinore",
    "Norco",
    "Eastvale",
    "Jurupa Valley",
  ],
  "San Bernardino County / Inland Empire": [
    "San Bernardino",
    "Fontana",
    "Ontario",
    "Rancho Cucamonga",
    "Upland",
    "Chino",
    "Chino Hills",
    "Victorville",
    "Hesperia",
    "Apple Valley",
    "Redlands",
    "Highland",
    "Colton",
    "Rialto",
  ],
  "Ventura County": [
    "Oxnard",
    "Ventura",
    "Thousand Oaks",
    "Simi Valley",
    "Camarillo",
    "Santa Paula",
    "Fillmore",
    "Ojai",
    "Moorpark",
    "Port Hueneme",
  ],
  "Santa Barbara County": [
    "Santa Barbara",
    "Goleta",
    "Carpinteria",
    "Montecito",
    "Summerland",
    "Isla Vista",
  ],
};

export const quoteServiceOptions = [
  "Roof Repair",
  "Roof Replacement",
  "Inspection",
  "Storm / Emergency",
  "Roof Maintenance",
  "Other",
] as const;

export const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#reviews", label: "Reviews" },
  { href: "#gallery", label: "Gallery" },
  { href: "#quote", label: "Contact" },
] as const;
