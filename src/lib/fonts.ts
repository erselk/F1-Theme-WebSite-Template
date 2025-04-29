import { Inter, Titillium_Web } from 'next/font/google'

export const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
})

export const titilliumWeb = Titillium_Web({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-titillium',
})