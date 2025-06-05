import type React from "react"
import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Total Aéreas - Locação de Plataformas Aéreas",
  description:
    "Líder no mercado de locação de plataformas aéreas há mais de 20 anos. Equipamentos de alta performance e segurança para seus projetos em altura.",
  keywords: "plataformas aéreas, locação, tesoura, articulada, telescópica, construção, manutenção",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
