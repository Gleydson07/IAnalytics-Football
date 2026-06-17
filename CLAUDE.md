# Football Scout — CLAUDE.md

## Visão geral

App Next.js 14 (App Router) para acompanhar jogos e análise estatística de futebol com foco em apostas.
Fluxo principal: **jogos do dia** (das ligas que o usuário fixa) → clicar numa liga abre a **agenda dela** (hoje + amanhã) → clicar num jogo abre a **comparação dos dois times + análise por IA**.

Arquitetura **hexagonal** (domain / application / infrastructure), provider de IA plugável (OpenAI default ou Anthropic), cache compartilhado no Upstash Redis e preferências de ligas persistidas em Postgres (Prisma).

## Stack

- **Framework**: Next.js 14 App Router (TypeScript, strict)
- **Estilos**: CSS-in-JS inline + design tokens em `globals.css` (sem Tailwind no JSX)
- **API externa**: API-Football v3 (`v3.football.api-sports.io`) — key em `API_FOOTBALL_KEY`
- **IA**: adapters intercambiáveis — OpenAI (default) ou Anthropic — selecionado por `AI_PROVIDER`
- **Cache**: Upstash Redis (REST) — degrada graciosamente sem credenciais
- **Banco**: PostgreSQL via `docker-compose` (porta **5433**) + **Prisma 6** — futuro: Supabase/Neon

## Arquitetura (hexagonal)

```
src/
  domain/
    entities/        # Tipos de domínio (fixture, league, team-statistics, comparison, preferred-league)
    ports/           # Classes abstratas (contratos): football-api, ai-provider, preferred-league.repository
  application/
    use-cases/       # Regra de negócio — 1 caso de uso por arquivo
  infrastructure/
    services/        # football-api.service.ts (implementa FootballApiPort; fetch + envelope errors)
    ai/              # openai/anthropic adapters + ai-adapter.factory (lê AI_PROVIDER)
    cache/           # redis-cache.ts (cached(key, ttl, fetcher) com no-op sem credencial)
    database/        # prisma.service.ts (singleton) + prisma/*.repository.ts
  app/
    api/             # Route handlers finos: instanciam use case + serviço/repo e retornam JSON
    components/      # Client/Server components (ver abaixo)
    minhas-ligas/    # Página de configuração de ligas (rota /minhas-ligas)
    layout.tsx       # Server Component: carrega preferidas e injeta no AppShell (sidebar persistente)
    page.tsx         # Server Component: carrega jogos de hoje → <Dashboard>
  lib/
    football.ts      # Funções client (fetch para as rotas /api/*) + re-export de tipos
    stats.ts         # Cálculos puros (gols, over2.5, BTTS, estimativas de escanteios/cartões)
    countries.ts     # translateCountry: EN→PT dos nomes de país
    timezone.ts      # APP_TIMEZONE + todayInAppTz (fuso da app, default America/Sao_Paulo)
```

**Regra**: route handler → use case → port. Route handlers são finos; toda regra vive em use case; I/O externo fica em `infrastructure` por trás de um port. Sem chamar API externa/DB direto no componente.

### Componentes (`src/app/components/`)

- `AppShell` (client) — shell com **sidebar persistente** (mora no `layout.tsx`) + Context que compartilha `selectedLeagueId`/`windowFixtures` com o Dashboard. Buscar a janela da liga acontece no clique (handler, não `useEffect`).
- `Sidebar` — "Todos os jogos" + ligas fixadas **agrupadas por país** (dropdowns; 1º país aberto). Engrenagem ⚙ → `/minhas-ligas`; lápis ✎ → `ReorderModal`.
- `Dashboard` (client) — decide a visão pelo `selectedLeagueId`: default = `DayFixtures`; liga selecionada = `LeagueAgenda`; jogo selecionado = `ComparePanel`.
- `DayFixtures` — jogos de hoje agrupados por liga (dropdowns abertos; título "País — Liga"), ordenados pelo `sortOrder` das preferidas.
- `LeagueAgenda` — jogos da liga agrupados por dia.
- `FixtureRow` (compartilhado) — linha de jogo (hora/placar; visitante alinhado à direita).
- `ComparePanel` — comparação lado a lado + botão de análise IA.
- `ReorderModal` — drag-and-drop (HTML5 nativo) para reordenar as ligas fixadas.

## Variáveis de ambiente

`.env.local` é lido pelo Next; `.env` é lido pelo **Prisma CLI** (não enxerga `.env.local`) — `DATABASE_URL` precisa estar no `.env`. Ver `.env.example`.

```env
API_FOOTBALL_KEY=            # dashboard.api-football.com (plano Free)
API_FOOTBALL_BASE_URL=       # default https://v3.football.api-sports.io

AI_PROVIDER=openai           # "openai" (default) ou "anthropic"
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-4-6

UPSTASH_REDIS_REST_URL=      # opcional em dev (sem isso, roda sem cache)
UPSTASH_REDIS_REST_TOKEN=

DATABASE_URL=                # postgres do docker-compose (porta 5433) — fica no .env
NEXT_PUBLIC_APP_TIMEZONE=    # opcional, default America/Sao_Paulo
```

## ⚠️ Limites do plano Free da API-Football (crítico)

A API **não tem parâmetro de idioma** e o plano Free é bem restrito. Só funciona:
- ✅ `/fixtures?date=AAAA-MM-DD` — **inclusive temporada atual** (única forma de ver dados atuais)
- ✅ `/leagues?current=true`
- ✅ `season` apenas **2022–2024** (histórico)

Bloqueado (responde HTTP 200 com `errors.plan`):
- ❌ `season` atual, parâmetros `next`/`last`, `/teams/statistics` atual
- ❌ datas fora de ~[ontem, amanhã]

**Consequências no código:**
- Jogos do dia e agenda da liga usam **só queries por data** (`getFixturesByDate`), com `timezone=America/Sao_Paulo` (senão jogos noturnos do BR caem no dia seguinte em UTC). Agenda capada a hoje+amanhã (`WINDOW_DAYS=1`) e tolerante (`Promise.allSettled`).
- **Comparação/IA não funciona no Free** (depende de `teams/statistics` atual + H2H com `last`): degrada com aviso âmbar. Reativa só com upgrade de plano.
- 100 req/dia, ~10 req/min. **Economize**: tudo passa pelo cache Redis (datas 2h, ligas 24h). Queries por data não são por liga → uma vez cacheadas servem qualquer liga de graça.

## Cache (TTLs em `redis-cache.ts`)

| Chave | TTL | Observação |
|-------|-----|------------|
| `fixtures:date:{data}:{tz}` | 2h | jogos do dia (qualquer liga) |
| `leagues:current` | 24h | catálogo de ligas |
| `team:stats` / `h2h` / `predictions` | 6–24h | usados pela comparação (bloqueada no Free) |

`externalFetch` lança erro quando o body traz `errors` não-vazio (api-football responde 200 mesmo em falha) — assim o motivo real sobe pra tela em vez de virar lista vazia silenciosa.

## Banco de dados

- `docker compose up -d` sobe o Postgres na porta **5433** (5432 pode estar ocupada por outro projeto).
- Migrations versionadas: `npx prisma migrate dev` (cria) / `migrate deploy` (aplica).
- Modelo único: `PreferredLeague` (`preferred_leagues`, snake_case) — ligas fixadas pelo usuário com `sortOrder` (drag-and-drop).

## Design tokens (globals.css)

| Var | Uso |
|-----|-----|
| `--bg` | Fundo `#0A0E1A` |
| `--surface` | Cards `#111827` |
| `--surface2` | Cards internos / inputs `#1a2235` |
| `--border` | Bordas `rgba(255,255,255,0.08)` |
| `--green` | Acento positivo `#00C97A` |
| `--amber` | Atenção `#F59E0B` |
| `--red` | Negativo `#EF4444` |
| `--text-muted` | Texto secundário `#8B93A8` |

## Comandos

```bash
docker compose up -d   # Postgres (porta 5433)
npx prisma migrate dev # aplica migrations + gera client
npm run dev            # http://localhost:3000
npm run build          # build de produção
```

## Convenções

- 1 caso de uso por arquivo em `application/use-cases/`; ports são classes abstratas em `domain/ports/`.
- Funções client (fetch) em `lib/football.ts`; cálculos puros em `lib/stats.ts`. Sem lógica de UI nesses.
- Server Components por padrão; `'use client'` só quando há interatividade/estado.
- Sem Tailwind no JSX — usar CSS vars inline pra manter o tema coeso.
- Datas/fuso sempre via `lib/timezone.ts`; nomes de país via `translateCountry`.

## Próximas evoluções

- **Upgrade do plano API** destrava comparação/IA e janela de dias maior.
- Escanteios/cartões reais (`/fixtures/statistics`) — hoje são estimativa em `stats.ts`.
- Odds (The Odds API) e cálculo de value bet.
- Deploy na Vercel + migração do Postgres para Supabase/Neon.
```
