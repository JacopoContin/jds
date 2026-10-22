import { Geist, Geist_Mono, Inter } from "next/font/google"

/**
 * Loaded once and shared: the root layout puts their variables on <html>, and theme previews
 * (Creative Director) read a family directly to show a font other than the site's.
 */
export const sans = Geist({ variable: "--font-sans", subsets: ["latin"] })
export const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] })
export const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap", preload: false })
