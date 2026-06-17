import type { FootballApiPort } from '@/domain/ports/football-api.port'
import type { Fixture } from '@/domain/entities/fixture'

export class GetDayFixturesUseCase {
  constructor(private readonly footballApi: FootballApiPort) {}

  async execute(date: string): Promise<Fixture[]> {
    const fixtures = await this.footballApi.getFixturesByDate(date)
    return fixtures.sort((a, b) => a.fixture.date.localeCompare(b.fixture.date))
  }
}
