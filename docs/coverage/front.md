# Cobertura de testes — Frontend

Gerado com `npm run test:coverage` (Jest + Istanbul, via CRA).

```
------------------------|---------|----------|---------|---------|----------------------
File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
------------------------|---------|----------|---------|---------|----------------------
All files               |   15.61 |    20.24 |   15.58 |   15.5  |
 src                    |   31.42 |    16.66 |    37.5 |   28.12 |
  App.js                |   45.83 |       25 |      50 |   42.85 | 17-21,25-28,34-36,39
  index.js              |       0 |      100 |     100 |       0 | 6-12
  reportWebVitals.js    |       0 |        0 |       0 |       0 | 1-8
 src/components         |   24.39 |    29.93 |   32.14 |   23.37 |
  ExperimentResults.jsx |   91.66 |    81.57 |     100 |      95 | 21
  authFetch.jsx         |      60 |    33.33 |     100 |   57.14 | 13-19
  login.jsx             |   33.33 |       35 |      50 |   33.33 | 10,16-38
 src/config             |     100 |      100 |     100 |     100 |
  api.js                |     100 |      100 |     100 |     100 |
------------------------|---------|----------|---------|---------|----------------------
Test Suites: 2 passed, 2 total
Tests:       5 passed, 5 total
```

## Leitura do relatório

O componente desenvolvido em TDD para a entrega — o painel de resultados A/B — tem cobertura alta:

| Arquivo | % Statements | % Branch | % Functions | % Lines |
|---------|-------------|----------|-------------|---------|
| `src/components/ExperimentResults.jsx` | 91.7 | 81.6 | 100 | 95.0 |
| `src/components/authFetch.jsx` | 60.0 | 33.3 | 100 | 57.1 |

Os percentuais gerais refletem o **código pré-existente** do dashboard (mapa, formulários, rotas) que não faz parte do escopo de TDD deste trabalho e não possui testes dedicados.

## Como regenerar

```bash
cd front
npm run test:coverage
```
