# Demonstração de TDD — Red-Green-Refactor

Este documento demonstra que o projeto GymRadar foi desenvolvido com a disciplina de **TDD (Test-Driven Development)**. Cada funcionalidade da plataforma de experimentação A/B foi construída seguindo o ciclo:

1. **RED** — escrever um teste que ainda falha (definindo o comportamento desejado);
2. **GREEN** — implementar o mínimo necessário para o teste passar;
3. **REFACTOR** — melhorar o código sem alterar comportamento.

> **Como as evidências foram obtidas:** os testes abaixo foram escritos **antes** da implementação de cada feature. Para reproduzir a fase RED de forma autêntica, a implementação foi **temporariamente removida** do repositório (movida para fora do projeto) e o teste foi executado — falhando por não encontrar o módulo que ainda não existia. Em seguida a implementação foi restaurada e o mesmo teste passou (GREEN). Os trechos de terminal são saídas **reais** das execuções.

Todas as suítes também rodam automaticamente no CI (`.github/workflows/ci.yml`). Relatórios de cobertura: [`docs/coverage/`](coverage/).

---

## Índice dos ciclos

| # | Feature | Suíte | Testes | Arquivo de teste |
|---|---------|-------|--------|------------------|
| 1 | `experimentService.js` — lógica estatística (backend) | Vitest | 19 | [`backend/test/experimentService.test.js`](../backend/test/experimentService.test.js) |
| 2 | Rotas `POST /experiments/event` e `GET /experiments/results` | Vitest + Supertest | 6 | [`backend/test/experimentRoutes.test.js`](../backend/test/experimentRoutes.test.js) |
| 3 | `experiment.ts` — atribuição de variantes (mobile) | jest-expo | 7 | [`src/experiments/__tests__/experiment.test.ts`](../mobile/GymRadar/src/experiments/__tests__/experiment.test.ts) |
| 4 | `GymRow.tsx` — variante B do layout (mobile) | RNTL | 2 | [`src/components/__tests__/GymRow.test.tsx`](../mobile/GymRadar/src/components/__tests__/GymRow.test.tsx) |
| 5 | `ExperimentResults.jsx` — painel de resultados (front) | Jest | 3 | [`ExperimentResults.test.js`](../front/src/components/ExperimentResults.test.js) |

**Total: 37 testes de feature + 2 de fluxo de autenticação (`App.test.js`) = 39 testes.**

---

## Ciclo 1 — `experimentService.js` (backend, Vitest)

### Requisito
Como analista de produto, quero que o backend **atribua cada usuário a uma variante de experimento de forma determinística** e **compute os resultados** (impressões, conversões, taxa, uplift e significância estatística) a partir dos eventos registrados, para decidir qual variante é a vencedora.

**Critérios de aceite:**
- `hashString` deve ser determinístico e retornar um inteiro não-negativo;
- `assignVariant` deve ser estável (mesmo usuário → mesma variante), retornar apenas variantes válidas e balancear ~50/50;
- `computeResults` deve agregar impressões/conversões, calcular taxa, uplift, p-value (qui-quadrado) e apontar o vencedor;
- `validateEvent` deve rejeitar payloads inválidos.

### RED — o teste é escrito primeiro e falha
`backend/test/experimentService.test.js` importa funções de um módulo que ainda não existe:

```js
import { describe, it, expect } from 'vitest';
import {
  hashString,
  assignVariant,
  computeResults,
  validateEvent,
} from '../src/services/experimentService.js';
```

Execução (implementação ainda inexistente):

```text
FAIL  test/experimentService.test.js [ test/experimentService.test.js ]
Error: Cannot find module '../src/services/experimentService.js' imported from
  C:/Users/leono/Desktop/fukuta/DSM-P4-G05-2026-01/backend/test/experimentService.test.js
 ❯ test/experimentService.test.js:2:1
      1| import { describe, it, expect } from 'vitest';
      2| import {
       | ^
      3|   hashString,
      4|   assignVariant,

 Test Files  1 failed (1)
      Tests  no tests
```

### GREEN — implementação mínima que faz o teste passar
`backend/src/services/experimentService.js` — exemplo de teste que passou após a implementação (balanceamento 50/50):

```js
it('balances roughly 50/50 over many users', () => {
  let countA = 0;
  for (let i = 0; i < 2000; i++) {
    if (assignVariant({ experiment: 'home_gym_layout', userId: `u${i}` }) === 'A') {
      countA++;
    }
  }
  const pctA = countA / 2000;
  expect(Math.abs(pctA - 0.5)).toBeLessThan(0.05);
});
```

```text
 Test Files  1 passed (1)
      Tests  19 passed (19)
```

### REFACTOR
Após o verde, o código foi limpo: extração da função `erf()` (aproximação de Abramowitz–Stegun) usada no cálculo do p-value, constantes `DEFAULT_VARIANTS`, `VALID_EVENT_TYPES` e `SIGNIFICANCE_LEVEL` no topo do arquivo, e suporte a pesos customizados em `assignVariant` sem quebrar os testes existentes.

---

## Ciclo 2 — Rotas `POST /experiments/event` e `GET /experiments/results` (backend, Supertest)

### Requisito
Como app e dashboard, quero **registrar eventos de experimento** (impression/conversion) via HTTP e **consultar os resultados agregados** de um experimento, de forma autenticada.

**Critérios de aceite:**
- `POST /experiments/event` aceita evento válido (201) e rejeita payload inválido (400);
- `GET /experiments/results` retorna resultados (200), exige `?experiment` (400) e exige JWT (401);
- Prisma é mockado (nenhum banco real necessário nos testes).

### RED
```text
FAIL  test/experimentRoutes.test.js [ test/experimentRoutes.test.js ]
Error: Cannot find module './routes/experimentRoutes.js' imported from
  C:/Users/leono/Desktop/fukuta/DSM-P4-G05-2026-01/backend/src/app.js
 ❯ src/app.js:9:1
 ❯ test/experimentRoutes.test.js:18:1

 Test Files  1 failed (1)
      Tests  no tests
```

### GREEN
```text
 Test Files  1 passed (1)
      Tests  6 passed (6)
```

Saída parcial dos testes (rota real recebendo chamadas):

```text
POST /experiments/event 400 0.7 ms - 26
POST /experiments/event 201 0.4 ms - 15
GET /experiments/results 200 0.6 ms - 42
GET /experiments/results 401 0.2 ms - 26
```

### REFACTOR
O controller foi separado das rotas (`experimentController.js` + `experimentRoutes.js`), mantendo a validação de negócio delegada ao `experimentService.validateEvent` — a lógica estatística não foi duplicada entre camadas.

---

## Ciclo 3 — `experiment.ts` (mobile, jest-expo)

### Requisito
Como usuário do app, quero ser **atribuído de forma estável e determinística** a uma variante do experimento `home_gym_layout`, e que o app **gere o payload** do evento a ser enviado ao backend.

**Critérios de aceite:** determinismo, apenas variantes válidas, balanceamento ~50/50 e payloads corretos de impressão/conversão.

### RED
```text
FAIL src/experiments/__tests__/experiment.test.ts
  ● Test suite failed to run
    Cannot find module '../experiment' from 'src/experiments/__tests__/experiment.test.ts'
      > 1 | import {
          | ^
         2 |   hashString,
         3 |   assignVariant,
         4 |   buildEventPayload,

Test Suites: 1 failed, 1 total
Tests:       0 total
```

### GREEN
```text
Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
```

### REFACTOR
Os tipos (`ExperimentName`, `Variant`, `EventType`, `ExperimentEvent`) foram adicionados e a constante `EXPERIMENTS` centraliza a definição dos experimentos — o que permitiu que `assignVariant` fosse tipado sem alterar os testes.

---

## Ciclo 4 — `GymRow.tsx` (mobile, Testing Library RN)

### Requisito
Como analista, quero que a **variante B** do layout da home exiba cada academia como uma **linha compacta** com nome, lotação (`25/100`) e barra de ocupação, acionável por toque — para testar contra a variante A (cartões grandes).

**Critérios de aceite:** renderiza nome e lotação; dispara `onPress` ao tocar.

### RED
```text
FAIL src/components/__tests__/GymRow.test.tsx
  ● Test suite failed to run
    Cannot find module '../GymRow' from 'src/components/__tests__/GymRow.test.tsx'
      > 3 | import GymRow from '../GymRow';

Test Suites: 1 failed, 1 total
Tests:       0 total
```

### GREEN
```text
Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

### REFACTOR
O componente foi extraído como componente puro (recebe `gym` e `onPress` opcional), permitindo reuso na home e nos testes; o cálculo de percentual com *fallbacks* seguros (`capacity`, `occupancy`) ficou isolado no corpo do componente.

---

## Ciclo 5 — `ExperimentResults.jsx` (frontend, Jest + Testing Library)

### Requisito
Como administrador, quero ver no **dashboard web** um painel que consome `GET /experiments/results` e exibe por variante (impressões, conversões, taxa), além do selo de significância, vencedor, uplift e p-value — com mensagem amigável quando ainda não há dados.

**Critérios de aceite:** renderiza as variantes com seus números; mostra selo *Significant* + vencedor quando o resultado é significativo; mostra mensagem de "no data" quando não há impressões.

### RED
```text
FAIL src/components/ExperimentResults.test.js
  ● Test suite failed to run
    Cannot find module './ExperimentResults' from 'src/components/ExperimentResults.test.js'
    However, Jest was able to find:
    	'./ExperimentResults.css'
    	'./ExperimentResults.test.js'
```

### GREEN
```text
Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

### REFACTOR
O estado de `loading`/`error` e o cancelamento de `setState` após desmontagem (flag `alive`) foram adicionados após o verde, sem alterar as asserções dos testes.

---

## Como executar as suítes

```bash
# Backend (Vitest + Supertest) — 25 testes
cd backend
npm test

# Mobile (jest-expo) — 9 testes + verificação de tipos
cd mobile/GymRadar
npm test
npm run typecheck

# Frontend (Jest) — 5 testes
cd front
npm test -- --watchAll=false
```

Cobertura de código: ver [`docs/coverage/`](coverage/).

---

## Evidência complementar no histórico do git

O histórico da branch **`main`** contém a sequência granular de commits RED → GREEN para as funcionalidades 1 e 4:

```text
test(red): experimentService atribui variantes deterministicamente   (teste falha)
feat(green): implementa experimentService                            (teste passa)
test(red): GymRow renderiza o layout compacto da variante B          (teste falha)
feat(green): implementa GymRow                                       (teste passa)
```

No GitHub, abra [Commits da `main`](https://github.com/FatecFranca/DSM-P4-G05-2026-01/commits/main) para ver a ordem exata: cada teste foi commitado **antes** da sua implementação.
