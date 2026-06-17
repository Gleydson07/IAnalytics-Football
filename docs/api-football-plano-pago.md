# API-Football — Plano pago: próximos passos

Documento de referência para destravar estatísticas, comparação e IA quando o plano Free for substituído por um plano pago da API-Football (API-Sports).

**Contexto:** hoje o app funciona com `/fixtures?date=` e `/leagues?current=true`. Comparação e IA estão bloqueadas no Free porque dependem de temporada atual, `last` e `/teams/statistics`.

---

## 1. O que o plano pago destrava

| Recurso | Endpoint | Uso no Football Scout |
|---------|----------|------------------------|
| Estatísticas da temporada atual | `GET /teams/statistics` | Forma, V/E/D, gols/jogo, clean sheets |
| Confronto direto | `GET /fixtures/headtohead?h2h=&last=N` | Resumo H2H no ComparePanel |
| Calendário completo da liga | `GET /fixtures?league=&season=` | Over 2.5%, BTTS% via `calcGoalStats` |
| Janela de datas maior | `GET /fixtures?date=` | Agenda além de hoje+amanhã |
| Stats por jogo | `GET /fixtures/statistics` | Escanteios e cartões reais |
| Previsão da API | `GET /predictions?fixture=` | Input opcional para IA |
| Classificação | `GET /standings?league=&season=` | Posição, pontos, saldo |
| Odds | `GET /odds?fixture=` | Value bet (fase posterior) |

**Código já preparado:** `FootballApiService`, `CompareFixtureUseCase`, `ComparePanel`, TTLs no Redis (`teamStatistics`, `h2h`, `predictions`).

---

## 2. Checklist imediato (Dia 1 — upgrade)

### 2.1 Ambiente

- [ ] Atualizar `API_FOOTBALL_KEY` no `.env.local` (produção: secret da Vercel/host)
- [ ] Confirmar plano ativo no [dashboard API-Sports](https://dashboard.api-football.com/)
- [ ] Anotar limites do novo plano (req/dia, req/min) e ajustar TTLs se necessário

### 2.2 Smoke test manual

Executar (substituir IDs reais de um jogo do dia):

```bash
# Estatísticas — deve retornar response, não errors.plan
curl -H "x-apisports-key: $API_FOOTBALL_KEY" \
  "https://v3.football.api-sports.io/teams/statistics?team=TEAM_ID&league=LEAGUE_ID&season=2025"

# H2H — parâmetro last deve funcionar
curl -H "x-apisports-key: $API_FOOTBALL_KEY" \
  "https://v3.football.api-sports.io/fixtures/headtohead?h2h=HOME-AWAY&last=10"

# Calendário da liga — season atual
curl -H "x-apisports-key: $API_FOOTBALL_KEY" \
  "https://v3.football.api-sports.io/fixtures?league=LEAGUE_ID&season=2025"
```

### 2.3 App

- [ ] Clicar num jogo → comparação deve carregar (sem aviso âmbar no `Dashboard`)
- [ ] Gerar análise IA → prompt deve receber dados reais
- [ ] Verificar logs/cache Redis (hits em `team:stats:*`, `h2h:*`)

### 2.4 Ajustes de configuração

| Arquivo | Mudança sugerida |
|---------|------------------|
| `AppShell.tsx` | Aumentar `WINDOW_DAYS` (ex.: 7) conforme limite do plano |
| `Dashboard.tsx` | Remover ou condicionar mensagem de erro do plano Free |
| `CLAUDE.md` | Atualizar seção de limites do plano |

---

## 3. Fase A — Reativar comparação completa (já implementada)

**Objetivo:** fluxo atual passa a funcionar sem código novo de API.

### Fluxo existente

```
POST /api/compare
  → CompareFixtureUseCase
    → getTeamStatistics (home + away)
    → getH2H
    → getLeagueFixtures → calcGoalStats
    → estimateCorners / estimateCards (ainda fake)
  → ComparePanel + POST /api/fixture-analysis (IA)
```

### Tarefas

- [ ] Validar comparação em 2–3 ligas fixadas (BR, top europeia)
- [ ] Tratar edge cases: time recém-promovido, copa (liga diferente), início de temporada (`played.total === 0`)
- [ ] Exibir loading/error granulares no `ComparePanel` (stats vs H2H vs liga)

### Métricas exibidas (pós-upgrade)

| Métrica | Fonte | Status |
|---------|-------|--------|
| Forma | `/teams/statistics` | Real |
| Jogos, V/E/D | `/teams/statistics` | Real |
| Gols/jogo | `/teams/statistics` | Real |
| Over 2.5%, BTTS% | `calcGoalStats` + jogos da liga | Real |
| Escanteios/cartões | `estimateCorners/Cards` | **Ainda estimativa** → Fase B |
| H2H | `/fixtures/headtohead` | Real |

---

## 4. Fase B — Escanteios e cartões reais

**Endpoint:** `GET /fixtures/statistics?fixture={id}`

### 4.1 Domínio

Criar entidade `FixtureStatistics` (subconjunto):

- `team`, `statistics[]` com `type` (Shots, Corner Kicks, Yellow Cards, Red Cards, etc.) e `value`

### 4.2 Infraestrutura

```typescript
// football-api.port.ts
abstract getFixtureStatistics(fixtureId: number): Promise<FixtureStatistics[]>

// football-api.service.ts
GET /fixtures/statistics?fixture={id}
// Cache: fixtures:stats:{fixtureId}, TTL 24h (jogo finalizado não muda)
```

### 4.3 Agregação

Novo helper em `stats.ts` (substituir `estimateCorners` / `estimateCards`):

```typescript
calcCornerStats(fixtures: Fixture[], statsMap: Map<number, FixtureStatistics[]>, teamId: number)
calcCardStats(...)
```

**Estratégia de fetch:** para os últimos N jogos finalizados do time (de `getLeagueFixtures` ou H2H), buscar `/fixtures/statistics` por fixture — **N requests**. Mitigar:

1. Cache agressivo (24h+ para jogos FT)
2. Limitar N=5 ou N=10
3. `Promise.allSettled` + degradar se quota apertar
4. Opcional: fila/background para pré-cache dos jogos recentes da liga

### 4.4 UI

- [ ] Remover asterisco e texto "estimativas" do `ComparePanel`
- [ ] Adicionar Over 9.5 escanteios % e Over 3.5 cartões % (já calculados em `estimate*` — passar a calcular de verdade)

---

## 5. Fase C — Janela de agenda ampliada

**Hoje:** `WINDOW_DAYS = 1` (hoje + amanhã).

### Tarefas

- [ ] Tornar `WINDOW_DAYS` configurável via env: `LEAGUE_WINDOW_DAYS=7`
- [ ] `GetLeagueWindowFixturesUseCase` já usa queries por data — só expandir o range
- [ ] Monitorar consumo: 7 dias = 8 requests por abertura de liga (cache 2h amortiza)
- [ ] UI `LeagueAgenda`: agrupar por dia (já existe)

---

## 6. Fase D — Endpoints complementares (opcional)

### 6.1 Classificação — `/standings`

- Use case: `GetStandingsUseCase`
- Exibir no `ComparePanel`: posição, pontos, saldo de gols (mandante vs visitante)
- Cache: `standings:{leagueId}:{season}`, TTL 6h

### 6.2 Previsões — `/predictions`

- Adapter: `getPredictions(fixtureId)`
- **Não substituir IA própria** — usar como input extra no prompt ou badge "API: Over 2.5 68%"
- Cache: TTL já definido (`predictions: 86400` em `redis-cache.ts`)

### 6.3 Eventos / escalações (baixa prioridade)

- `/fixtures/events` — timeline de gols/cartões (útil pós-jogo)
- `/fixtures/lineups` — escalações (pré-jogo, quando disponível)

### 6.4 Odds

- API-Football `/odds` **ou** The Odds API (mencionado no roadmap)
- Use case: `GetFixtureOddsUseCase` + cálculo de value bet
- Fase separada; depende de estratégia de produto

---

## 7. Fase E — Otimização de quota

Com plano pago, o risco passa a ser **volume**, não bloqueio.

| Padrão | Requests | Mitigação |
|--------|----------|-----------|
| Abrir comparação | 3 + 2 team stats + 1 H2H | Cache 6–24h |
| Escanteios (Fase B) | +N fixture statistics | Cache 24h, N≤10 |
| Agenda 7 dias | 8 por liga | Cache 2h por data |
| Jogos do dia | 1 por dia | Compartilhado entre ligas |

### Regras

1. **Nunca** buscar por liga o que `/fixtures?date=` já traz
2. Invalidar cache de `team:stats` só após jogos FT daquele time (ou TTL 6h)
3. Log de consumo: contador diário no Redis (`api-football:requests:{date}`)
4. Alerta se >80% da quota diária

---

## 8. Fase F — Acumulação local (complementar, não substituta)

Mesmo com plano pago, persistir fixtures finalizados no Postgres continua útil:

- Reduz re-fetch de histórico
- Permite stats customizadas (últimos 5 em casa, etc.)
- Backup se API oscilar

**Coexistência:** `/teams/statistics` para temporada; Postgres para rolling windows customizados.

Modelo sugerido (futuro):

```prisma
model FinishedFixture {
  fixtureId   Int      @id
  date        DateTime
  leagueId    Int
  homeTeamId  Int
  awayTeamId  Int
  goalsHome   Int
  goalsAway   Int
  htHome      Int?
  htAway      Int?
  fetchedAt   DateTime @default(now())
}
```

---

## 9. Ordem de implementação recomendada

```
1. Checklist Dia 1 (smoke test + WINDOW_DAYS)
2. Fase A — validar comparação/IA existente
3. Fase B — /fixtures/statistics (escanteios/cartões)
4. Fase C — agenda ampliada
5. Fase D — standings → predictions → odds
6. Fase E — otimização de quota (contínuo)
7. Fase F — acumulação Postgres (paralelo, se fizer sentido)
```

---

## 10. Critérios de aceite

### Comparação (Fase A)

- [ ] Jogo de liga fixada abre comparação sem erro
- [ ] Forma e gols/jogo batem com dashboard API-Football
- [ ] H2H mostra últimos confrontos reais
- [ ] IA gera análise com dados reais (não estimativas de escanteios)

### Stats por jogo (Fase B)

- [ ] Escanteios/cartões batem com amostra manual de 3 jogos
- [ ] Sem `Math.random()` em `stats.ts` para corners/cards

### Agenda (Fase C)

- [ ] Liga mostra jogos de N dias configuráveis
- [ ] Consumo diário dentro da quota do plano

---

## 11. Referências no código

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/infrastructure/services/football-api.service.ts` | Adapters HTTP |
| `src/domain/ports/football-api.port.ts` | Contratos |
| `src/application/use-cases/compare-fixture.use-case.ts` | Orquestração comparação |
| `src/lib/stats.ts` | Cálculos puros |
| `src/domain/entities/team-statistics.ts` | Tipo `/teams/statistics` |
| `src/app/components/ComparePanel.tsx` | UI comparação |
| `src/infrastructure/cache/redis-cache.ts` | TTLs |
| `src/app/components/Dashboard.tsx` | Erro plano Free |
| `src/app/components/AppShell.tsx` | `WINDOW_DAYS` |

---

## 12. Variáveis de ambiente (pós-upgrade)

```env
# Existentes
API_FOOTBALL_KEY=
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io

# Sugeridas
LEAGUE_WINDOW_DAYS=7          # dias na agenda da liga
FIXTURE_STATS_SAMPLE_SIZE=10  # jogos para média escanteios/cartões
API_FOOTBALL_DAILY_LIMIT=7500 # conforme plano — para alerta
```

---

*Última atualização: junho/2025 — Football Scout*
