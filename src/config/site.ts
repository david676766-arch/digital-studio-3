/**
 * Central site configuration — contacts, services, photography and concept projects.
 * Every component reads from this file.
 */

export const site = {
  name: "DIGITAL STUDIO",
  /** Real studio contacts (used in the contact section, mobile menu, footer and structured data). */
  contacts: {
    email: "Digitalst@gmail.com",
    emailHref: "mailto:Digitalst@gmail.com",
    telegram: "@davu_li",
    telegramHref: "https://t.me/davu_li",
    phone: "+38097847158",
    phoneHref: "tel:+38097847158",
  },
  /** Social profiles. Only entries with real URLs should be added — they render automatically when present. */
  socials: [] as { label: string; href: string }[],
};

/** Fallback hero video (used only when WebGL is unavailable). */
export const heroVideo = {
  sources: [{ src: "/videos/hero.mp4", type: "video/mp4" }],
  poster: "/videos/hero-poster.jpg",
};

export type Photo = { id: string; author: string; page: string };
const unsplash = (id: string, author: string, page: string): Photo => ({ id, author, page });

/** All photography is from Unsplash, free to use under the Unsplash License. */
export const photos = {
  serviceWeb: unsplash("1498050108023-c5249f4df085", "Christopher Gower", "https://unsplash.com/photos/m_HRfLhgABo"),
  serviceVideo: unsplash("1650654291685-d4e8f17e36a3", "dlxmedia.hu", "https://unsplash.com/photos/2qu4YY3p-V4"),
  serviceAds: unsplash("1485848225137-7a97afbde637", "Brandon Holmes", "https://unsplash.com/photos/A5nduvsqHLg"),
  serviceBrand: unsplash("1559028009-e2f915dc68ae", "Eftakher Alam", "https://unsplash.com/photos/IySy-pWyt8Y"),
  heroFallback: unsplash("1498721425774-488298864da7", "CHUTTERSNAP", "https://unsplash.com/photos/8nMjIn195p0"),
  about: unsplash("1780639680456-8c92beca7056", "HYEWON HWANG", "https://unsplash.com/photos/HrKQUwCV_go"),
  ring: unsplash("1714188662137-813203f9d8c5", "Karl Moore", "https://unsplash.com/photos/NYDTA45Djw4"),
  goldLeaf: unsplash("1760784213096-4545961ba4a8", "Colin Watts", "https://unsplash.com/photos/2IuvCGmfQyM"),
  perfume: unsplash("1760920250029-36af9369a0bb", "Kier in Sight Archives", "https://unsplash.com/photos/j1vg92xdoX4"),
  nightCity: unsplash("1643044058777-23e555c1236f", "Caught In Joy", "https://unsplash.com/photos/dbRWBcACjCY"),
  studioDesk: unsplash("1676208972443-f6ac603af62c", "Georgia de Lotz", "https://unsplash.com/photos/Q5UJf5ZPXfQ"),
  lessIsMore: unsplash("1563691067913-71b101e003d0", "Prateek Katyal", "https://unsplash.com/photos/MGRv3qZfyTs"),
  cameraStudio: unsplash("1760768550727-00f5e02feb72", "Brandi Alexandra", "https://unsplash.com/photos/Afmj6XG2yVg"),
  filmmaker: unsplash("1758390851386-79c99432120e", "Oleg Brovchenko", "https://unsplash.com/photos/5rC0gmRR7G0"),
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;

export const SERVICE_IDS = ["web", "video", "ads", "brand"] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

/** SEO-friendly URL slugs of the service pages: /en/services/website-development */
export const SERVICE_SLUGS: Record<ServiceId, string> = {
  web: "website-development",
  video: "video-editing",
  ads: "digital-advertising",
  brand: "brand-identity",
};

export function serviceIdFromSlug(slug: string): ServiceId | null {
  const found = (Object.keys(SERVICE_SLUGS) as ServiceId[]).find((id) => SERVICE_SLUGS[id] === slug);
  return found ?? null;
}

export const servicePhoto: Record<ServiceId, PhotoKey> = {
  web: "serviceWeb",
  video: "serviceVideo",
  ads: "serviceAds",
  brand: "serviceBrand",
};

/** Visual theme of a concept project's fictional website (used by the device mockups). */
export type ConceptTheme = {
  bg: string;
  surface: string;
  fg: string;
  muted: string;
  accent: string;
  serif: boolean;
  /** Brand wordmark shown inside the mockups */
  brand: string;
  /** Short UI labels inside the mockups (part of the fictional site, so not translated) */
  nav: [string, string, string];
  headline: string;
  cta: string;
};

export type ConceptProject = {
  slug: string;
  service: ServiceId;
  services: ServiceId[];
  hero: PhotoKey;
  second: PhotoKey;
  theme: ConceptTheme;
  palette: { name: string; hex: string }[];
  fonts: [string, string];
};

/** Concept projects — always labelled as concepts on the site. Replace with real case studies when available. */
export const PROJECTS: ConceptProject[] = [
  {
    slug: "maison-aurel",
    service: "web",
    services: ["web", "brand"],
    hero: "ring",
    second: "goldLeaf",
    theme: {
      bg: "#f3efe7",
      surface: "#e8e1d4",
      fg: "#1b1712",
      muted: "#6f665a",
      accent: "#a8875a",
      serif: true,
      brand: "MAISON AUREL",
      nav: ["Collections", "Bridal", "Maison"],
      headline: "Light, held forever.",
      cta: "Discover",
    },
    palette: [
      { name: "Porcelain", hex: "#F3EFE7" },
      { name: "Ink", hex: "#1B1712" },
      { name: "Antique gold", hex: "#A8875A" },
      { name: "Sand", hex: "#E8E1D4" },
    ],
    fonts: ["Cormorant Garamond", "Manrope"],
  },
  {
    slug: "nocturne",
    service: "ads",
    services: ["ads", "video", "web"],
    hero: "perfume",
    second: "nightCity",
    theme: {
      bg: "#0b0a10",
      surface: "#17141f",
      fg: "#f1ecf7",
      muted: "#9a92a8",
      accent: "#c7a46b",
      serif: true,
      brand: "NOCTURNE",
      nav: ["The scent", "Campaign", "Stores"],
      headline: "After midnight, everything glows.",
      cta: "Explore",
    },
    palette: [
      { name: "Midnight", hex: "#0B0A10" },
      { name: "Violet ash", hex: "#17141F" },
      { name: "Lamp gold", hex: "#C7A46B" },
      { name: "Moon", hex: "#F1ECF7" },
    ],
    fonts: ["Cormorant Garamond", "Manrope"],
  },
  {
    slug: "atelier-nord",
    service: "brand",
    services: ["brand", "web"],
    hero: "about",
    second: "studioDesk",
    theme: {
      bg: "#eceae5",
      surface: "#dcd9d1",
      fg: "#1e2321",
      muted: "#66706a",
      accent: "#5f7a6a",
      serif: false,
      brand: "ATELIER NORD",
      nav: ["Projects", "Studio", "Contact"],
      headline: "Quiet spaces, built to last.",
      cta: "View projects",
    },
    palette: [
      { name: "Chalk", hex: "#ECEAE5" },
      { name: "Charcoal", hex: "#1E2321" },
      { name: "Sage", hex: "#5F7A6A" },
      { name: "Stone", hex: "#DCD9D1" },
    ],
    fonts: ["Manrope", "Manrope"],
  },
  {
    slug: "lumen-films",
    service: "video",
    services: ["video", "web"],
    hero: "filmmaker",
    second: "cameraStudio",
    theme: {
      bg: "#0d0c0b",
      surface: "#1a1816",
      fg: "#f4f1ea",
      muted: "#9b958b",
      accent: "#d1a35a",
      serif: false,
      brand: "LUMEN FILMS",
      nav: ["Showreel", "Films", "Studio"],
      headline: "Stories in motion.",
      cta: "Play reel",
    },
    palette: [
      { name: "Darkroom", hex: "#0D0C0B" },
      { name: "Film grey", hex: "#1A1816" },
      { name: "Tungsten", hex: "#D1A35A" },
      { name: "Paper", hex: "#F4F1EA" },
    ],
    fonts: ["Manrope", "Cormorant Garamond"],
  },
];

export type ProjectSlug = "maison-aurel" | "nocturne" | "atelier-nord" | "lumen-films";

export const NAV_SECTIONS = ["top", "services", "work", "about", "process", "contact"] as const;
export type NavSection = (typeof NAV_SECTIONS)[number];
