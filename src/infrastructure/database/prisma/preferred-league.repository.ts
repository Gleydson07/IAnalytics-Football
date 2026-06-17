import { PreferredLeagueRepository } from '@/domain/ports/preferred-league.repository.port'
import type { PreferredLeague } from '@/domain/entities/preferred-league'
import { prisma } from '../prisma.service'

export class PrismaPreferredLeagueRepository extends PreferredLeagueRepository {
  async findAll(): Promise<PreferredLeague[]> {
    const rows = await prisma.preferredLeague.findMany({
      orderBy: [{ country: 'asc' }, { name: 'asc' }],
    })
    return rows.map(toEntity)
  }

  async add(league: PreferredLeague): Promise<PreferredLeague> {
    const data = {
      name: league.name,
      country: league.country,
      season: league.season,
      logo: league.logo ?? null,
    }
    const row = await prisma.preferredLeague.upsert({
      where: { leagueId: league.leagueId },
      update: data,
      create: { leagueId: league.leagueId, ...data },
    })
    return toEntity(row)
  }

  async remove(leagueId: number): Promise<void> {
    await prisma.preferredLeague.deleteMany({ where: { leagueId } })
  }
}

function toEntity(row: {
  leagueId: number; name: string; country: string; season: number; logo: string | null
}): PreferredLeague {
  return {
    leagueId: row.leagueId,
    name: row.name,
    country: row.country,
    season: row.season,
    logo: row.logo,
  }
}
