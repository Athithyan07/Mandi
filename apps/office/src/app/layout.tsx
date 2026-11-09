import type { Metadata } from "next"
import { Inter, Plus_Jakarta_Sans, Outfit, Space_Grotesk, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
})

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Mandi Connect — B2B Distribution Management",
  description: "Vegetables, Groceries & Rice Distribution Management System for APMC Mandis",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${plusJakarta.variable} ${outfit.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col liquid-mesh-canvas text-slate-100 font-sans">
        {children}
      </body>
    </html>
  )
}
