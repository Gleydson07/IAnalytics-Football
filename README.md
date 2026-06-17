# Football Scout ⚽

Análise estatística de futebol para apostas — Copa do Mundo 2026, Premier League, La Liga, Brasileirão A/B e mais.

## Setup rápido

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.local .env.local.example
# Editar .env.local com suas keys

# 3. Rodar
npm run dev
# Acesse http://localhost:3000
```

## Onde obter as API Keys

| Key | Link |
|-----|------|
| `API_FOOTBALL_KEY` | [dashboard.api-football.com](https://dashboard.api-football.com) |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |

## Funcionalidades

- Busca de times por nome (qualquer liga)
- Estatísticas: gols, Over/Under, BTTS, escanteios, cartões
- Últimos 10 jogos com resultado (V/E/D)
- Próximos jogos agendados
- Confronto direto H2H
- Análise preditiva com Claude IA

## Documentação completa

Ver [CLAUDE.md](./CLAUDE.md) para arquitetura, convenções e próximas evoluções.
