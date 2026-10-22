import { Bricolage_Grotesque, Geist, Geist_Mono, Inter, Instrument_Serif, Space_Grotesk } from "next/font/google"

/**
 * Loaded once and shared: the root layout puts their variables on <html>, and theme previews
 * (Creative Director) read a family directly to show a font other than the site's.
 */
export const sans = Geist({ variable: "--font-sans", subsets: ["latin"] })
export const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] })
export const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap", preload: false })

/** Display faces for headings. Only the Creative Director shows them, so none preload. */
export const serif = Instrument_Serif({ weight: "400", subsets: ["latin"], display: "swap", preload: false })
export const grotesk = Space_Grotesk({ subsets: ["latin"], display: "swap", preload: false })
export const bricolage = Bricolage_Grotesque({ subsets: ["latin"], display: "swap", preload: false })
