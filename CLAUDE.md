# Football Scout — CLAUDE.md

## Visão geral

App Next.js 14 (App Router) para análise estatística de futebol com foco em apostas esportivas.
Consome a API-Football (v3.football.api-sports.io) via proxy interno e usa Claude Sonnet para análise preditiva.

## Stack

- **Framework**: Next.js 14 App Router (TypeScript)
- **Estilos**: CSS-in-JS inline + globals.css (sem Tailwind no JSX, apenas utilitários)
- **API externa**: api-football.com (v3) — key em `API_FOOTBALL_KEY`
- **IA**: Anthropic Claude Sonnet via SDK — key em `ANTHROPIC_API_KEY`

## Estrutura

```
src/
  app/
    api/
      football/route.ts   # Proxy para api-football (evita CORS, esconde key)
      analysis/route.ts   # Endpoint Claude para análise preditiva
    components/
      TeamSearch.tsx       # Busca com debounce e dropdown
      StatCard.tsx         # Card de métrica individual
      BarMeter.tsx         # Barra de progresso visual
      FixtureRow.tsx       # Linha de resultado de jogo
    globals.css            # Design tokens CSS vars (tema escuro)
    layout.tsx
    page.tsx               # UI principal — toda lógica de estado aqui
  lib/
    football.ts            # Funções de fetch (proxy interno)
    stats.ts               # Cálculo de estatísticas puras
```

## Variáveis de ambiente

```env
API_FOOTBALL_KEY=     # dashboard.api-football.com — plano Free: 100 req/dia
ANTHROPIC_API_KEY=    # console.anthropic.com
```

## Design tokens (globals.css)

| Var | Uso |
|-----|-----|
| `--bg` | Fundo da página `#0A0E1A` |
| `--surface` | Cards principais `#111827` |
| `--surface2` | Cards internos / inputs `#1a2235` |
| `--border` | Bordas padrão `rgba(255,255,255,0.08)` |
| `--green` | Acento positivo `#00C97A` |
| `--amber` | Atenção `#F59E0B` |
| `--red` | Negativo `#EF4444` |
| `--text-muted` | Texto secundário `#8B93A8` |

## Proxy da API

Todas as chamadas ao api-football passam por `/api/football?path=/endpoint&param=valor`.
**Nunca chamar o api-football diretamente no frontend** — a key ficaria exposta.

Exemplo:
```ts
// ✅ correto
const data = await footballFetch('/fixtures', { team: 123, last: 10 })

// ❌ errado
fetch('https://v3.football.api-sports.io/fixtures?team=123&last=10', { headers: { 'x-apisports-key': '...' } })
```

## Limites da API (plano Free)

- 100 requests/dia
- Sem acesso a odds
- Estatísticas detalhadas (escanteios/cartões reais) requerem `/fixtures/statistics` — 1 req por jogo
- Economize requests: sempre use `last=10` e evite recargas desnecessárias

## Mercados cobertos

| Mercado | Fonte de dado | Status |
|---------|--------------|--------|
| Resultado (1X2) | `/fixtures` — `teams.home/away.winner` | ✅ real |
| Over/Under gols | `/fixtures` — `goals.home/away` | ✅ real |
| BTTS | `/fixtures` — ambos > 0 | ✅ real |
| Escanteios | Estimativa (ainda não real) | 🔄 estimativa |
| Cartões | Estimativa (ainda não real) | 🔄 estimativa |

## Próximas evoluções prioritárias

### 1. Dados reais de escanteios e cartões
Endpoint: `GET /fixtures/statistics?fixture={id}`
- Iterar sobre `fixtures[]` e fazer 1 req por jogo
- Parsear `type: "Corner Kicks"` e `type: "Yellow Cards"`
- Implementar cache local (localStorage ou ISR)

### 2. Comparação de dois times lado a lado
- Novo componente `ComparePanel`
- Buscar stats dos dois times em paralelo
- Side-by-side com destaque no mais forte em cada métrica

### 3. Filtro por liga e temporada
- Select de liga (`/leagues`) e temporada
- Passar `league` e `season` nos requests de fixtures
- Persistir seleção em `localStorage`

### 4. Odds integradas
- Integrar The Odds API (`the-odds-api.com`) — gratuito 500 req/mês
- Exibir odds das principais casas ao lado das stats
- Calcular value bet: probabilidade implícita vs % histórica

### 5. Histórico de análises
- Salvar análises IA em `localStorage` indexadas por `teamId + date`
- Aba "Histórico" no painel do time

### 6. Deploy
- Vercel: `vercel deploy`
- Variáveis de ambiente no painel da Vercel
- Domínio customizado opcional

## Comandos

```bash
npm install        # instalar dependências
npm run dev        # rodar em http://localhost:3000
npm run build      # build de produção
```

## Convenções de código

- Componentes: PascalCase em `src/app/components/`
- Funções de fetch: em `src/lib/football.ts` (sem lógica de UI)
- Cálculos de stats: em `src/lib/stats.ts` (funções puras, testáveis)
- Estado global: no `page.tsx` por enquanto; migrar para Context/Zustand se crescer
- Sem classes Tailwind no JSX — usar CSS vars inline para manter o tema coeso
