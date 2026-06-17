import type { Metadata } from 'next'
import './globals.css'
import AppShell from './components/AppShell'
import { GetPreferredLeaguesUseCase } from '@/application/use-cases/get-preferred-leagues.use-case'
import { PrismaPreferredLeagueRepository } from '@/infrastructure/database/prisma/preferred-league.repository'
import type { PreferredLeague } from '@/domain/entities/preferred-league'

export const metadata: Metadata = {
  title: 'Football Scout — Análise de Apostas',
  description: 'Estatísticas e análise preditiva para apostas esportivas',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let preferred: PreferredLeague[] = []
  try {
    preferred = await new GetPreferredLeaguesUseCase(new PrismaPreferredLeagueRepository()).execute()
  } catch (err) {
    console.error('[layout] erro ao carregar ligas preferidas', err)
  }

  return (
    <html lang="pt-BR">
      <body>
        <AppShell preferred={preferred}>{children}</AppShell>
      </body>
    </html>
  )
}
