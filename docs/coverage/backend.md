# Cobertura de testes — Backend

Gerado com `npm run test:coverage` (Vitest + `@vitest/coverage-v8`).

```
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
  app.js           |   71.42 |    21.42 |   33.33 |   71.42 | 23,55,70,83,90-98
  experimentController.js | 80.00 |    75.00 |   100   |   80.00 | 22-23,40-41
  experimentService.js    | 94.50 |    87.87 |   100   |   96.34 | 22,30,113
  authenticateToken.js    | 88.88 |    100    |   100   |   100   |
-------------------|---------|----------|---------|---------|-------------------
Coverage summary
Statements   : 37.7% ( 161/427 )
Branches     : 33.03% ( 73/221 )
Functions    : 32.55% ( 14/43 )
Lines        : 57.2% ( 135/236 )
```

## Leitura do relatório

A cobertura do **código desenvolvido em TDD** — a plataforma de experimentação A/B — é alta:

| Arquivo | % Statements | % Branch | % Functions | % Lines |
|---------|-------------|----------|-------------|---------|
| `src/services/experimentService.js` | 94.5 | 87.9 | 100 | 96.3 |
| `src/controllers/experimentController.js` | 80.0 | 75.0 | 100 | 80.0 |
| `src/middleware/authenticateToken.js` | 88.9 | 100 | 100 | 100 |

Os percentuais gerais (37.7% de statements) refletem o **código pré-existente** do projeto (rotas de auth, gyms, clientes e IoT), que foi escrito antes da adoção da disciplina de TDD neste trabalho. As regras de negócio novas — e toda a lógica de experimentação — estão cobertas pelos testes (`experimentService.test.js` e `experimentRoutes.test.js`).

## Como regenerar

```bash
cd backend
npm run test:coverage
```
