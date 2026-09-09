import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard TKA & UTBK', description: 'Analisis performa siswa TKA & UTBK' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="id"><body>{children}</body></html>
}