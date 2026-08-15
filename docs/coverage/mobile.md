# Cobertura de testes — Mobile

Gerado com `npm run test:coverage` (Jest + jest-expo).

```
----------------|---------|----------|---------|---------|-------------------
File            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------|---------|----------|---------|---------|-------------------
All files       |     100 |     62.5 |     100 |     100 |
 components     |     100 |    66.66 |     100 |     100 |
  GymRow.tsx    |     100 |    66.66 |     100 |     100 | 17-18
 experiments    |     100 |       50 |     100 |     100 |
  experiment.ts |     100 |       50 |     100 |     100 | 20
----------------|---------|----------|---------|---------|-------------------
Test Suites: 2 passed, 2 total
Tests:       9 passed, 9 total
```

## Leitura do relatório

Todo o código mobile desenvolvido em TDD tem **100% de statements, funções e linhas** cobertas:

| Arquivo | % Statements | % Branch | % Functions | % Lines |
|---------|-------------|----------|-------------|---------|
| `src/experiments/experiment.ts` | 100 | 50 | 100 | 100 |
| `src/components/GymRow.tsx` | 100 | 66.7 | 100 | 100 |

Os ramos não cobertos são *fallbacks* defensivos (ex.: `capacity` inválido, ramo `else` do hash de usuário vazio), intencionalmente não exercitados nos cenários de sucesso.

## Como regenerar

```bash
cd mobile/GymRadar
npm run test:coverage
```
