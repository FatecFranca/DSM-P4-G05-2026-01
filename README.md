# GymRadar - Sistema IoT de Monitoramento de Fluxo em Academias 🏋️‍♂️

O **GymRadar** é um ecossistema de software acadêmico completo voltado para a gestão e monitoramento em tempo real da ocupação de academias, integrando dispositivos IoT (Internet das Coisas) em catracas, até dashboards interativos com modelos de inteligência artificial.

Este projeto visa resolver um problema clássico: a superlotação de academias em horários de pico. Através do processamento massivo de dados de acessos, oferecemos uma ferramenta de análise preditiva para gestores e um aplicativo em tempo real para os alunos.

---

## Alunos 

Roberta Bacarollo, Leonardo Sudário, Daniel Olímpio, Gabriel Andrade Cintra 


## 📖 Visão Geral

O sistema coleta, processa e exibe dados de entrada e saída (check-ins e check-outs) dos clientes nas catracas físicas. Ele é composto por três frentes principais de tecnologia:
1. **Painel Web (Web Dashboard)**: Ferramenta administrativa com KPIs, mapas de calor e visualizações de demanda.
2. **Aplicativo Mobile (React Native)**: Aplicativo focado no aluno, permitindo que ele veja academias próximas via geolocalização e verifique a lotação atual de sua unidade antes de sair de casa.
3. **Módulo de Ciência de Dados (Data Science)**: Camada de inteligência que analisa o histórico dos acessos para prever lotações futuras usando Regressão Linear, indicando os horários mais vazios da semana.

---

## 💼 Regras de Negócio

As principais regras que orientam o ecossistema GymRadar:

1. **Gestão de Lotação Relativa**: A lotação da academia nunca é medida apenas em números absolutos, mas sim em porcentagem (`% de Ocupação = Check-ins / Capacidade Total da Unidade`). Isso permite comparações justas entre uma unidade pequena (capacidade: 100) e uma unidade grande (capacidade: 500).
2. **Definição Estatística de Horários de Pico**: Os horários de pico ou horários vazios não são decididos empiricamente. O sistema calcula a distribuição de tráfego, isola o quartil superior (Top 25% de tráfego) e o define como os **horários de pico** (Packed Hours). Por outro lado, o quartil inferior (Bottom 25%) é classificado como os **melhores horários** (Empty Hours).
3. **Previsão de Fluxo**: Através de Análise de Regressão pelo método OLS (Mínimos Quadrados Ordinários), o sistema encontra a correlação entre `dia_da_semana` e `hora_do_dia` para prever estatisticamente o fluxo de amanhã.
4. **Isolamento Geográfico (Geofencing)**: No aplicativo Mobile, a exibição de unidades é controlada por distância radial a partir das coordenadas GPS locais do usuário para a academia.
5. **Autenticação Segura**: Operações vitais do painel (como deletar unidades ou analisar dados confidenciais de catraca) estão contidas sob um middleware JWT no backend, impedindo acessos não autorizados.

---

## ⚙️ Arquitetura Técnica

O projeto segue uma arquitetura baseada em microsserviços (desacoplada) moderna e de alta escalabilidade:

### 1. Backend API (Node.js & Express)
* **ORM**: Prisma DB (Garante mapeamento robusto e typesafety na conexão).
* **Banco de Dados**: MongoDB (NoSQL) alocado na Nuvem (MongoDB Atlas), propiciando altíssima taxa de ingestão de eventos IoT sem lock-in estrutural restritivo.
* **Segurança**: Autenticação via JSON Web Tokens (JWT) e encriptação usando bcryptjs.

### 2. Frontend Administrativo (React.js)
* **Framework**: React.js estruturado em Vite/CRA.
* **Componentes Gráficos**: Utilização maciça de `Recharts` para plotar gráficos de Área e Barras com respostas elásticas ao filtro do usuário.
* **Consumo de API**: Autenticação stateful com tokens locais interconectados com endpoints construídos em Express.

### 3. Aplicativo Mobile (React Native + Expo)
* **Navegação**: Sistema moderno baseado em Expo Router (file-based routing) com Layouts para proteção de autenticação global.
* **Mapas Nativos**: Integração profunda com `react-native-maps` e `expo-location` para renderizar marcadores das academias e solicitar permissões ativas de GPS do dispositivo.

### 4. Machine Learning & Forecasting (Python)
* **Bibliotecas Base**: `pandas` e `numpy` para pré-processamento, agregação e limpeza das coletas do IoT.
* **Modelagem Numérica**: `scikit-learn` (LinearRegression) e `statsmodels` (Mínimos Quadrados Ordinários - OLS) extraindo resíduos e significância de p-value das lotações.
* **DataViz**: Gráficos estatísticos isolados (Heatmaps) elaborados com `plotly` exportados como `html` autossuficiente e JSONs consumíveis pelo React.

---

## 🔄 Fluxo de Dados (Data Flow Pipeline)

1. **Geração (IoT)**: Um evento de hardware de catraca (`evento: checkin` ou `checkout`) é disparado via requisição POST ao `/api/gyms/iot`. 
2. **Ingestão (Backend)**: O Express.js recebe o payload, anexa carimbos de data/hora rígidos em `UTC` (para evitar conflitos de fuso horário), e o Prisma cria um documento `IoTEvent` no cluster MongoDB Atlas.
3. **Processamento Preditivo (Cron/Python)**: Periodicamente, o script `previsao_ocupacao.py` consome massivamente toda a coleção `IoTEvent`, processa vetores estatísticos e sobrecreve matrizes JSON consolidadas (`best_times.json` e `previsao_futura.json`) localmente para o frontend.
4. **Exibição (Frontend)**: O usuário final interage com o React Dashboard, que de maneira unificada apresenta via `Recharts` uma intersecção do tempo real (puxado pelo Node.js) e do previsional (fornecido em arquivos estáticos gerados pelo Python).

---

## 🚀 Instruções de Instalação e Execução

### Pré-requisitos
* Node.js v18+ e NPM v9+
* Python 3.10+ (pip instanciado)
* Conta no Expo.dev (Para visualizar o Mobile)

### Passo 1: Configurar Variáveis de Ambiente
Na pasta raiz do `/backend`, copie o `.env.example` para `.env` e configure suas chaves do MongoDB e JWT Secret:
```bash
DATABASE_URL=mongodb+srv://<USER>:<PASS>@cluster.mongodb.net/database
JWT_SECRET=super_secret_key
```

### Passo 2: Executar o Backend
```bash
cd backend
npm install
npm run build # Gera o cliente Prisma
npm run dev
```

### Passo 3: Executar o Frontend Dashboard
Abra um novo terminal:
```bash
cd front
npm install
npm start
```

### Passo 4: Executar a Análise Preditiva e Gerar Gráficos (Python)
Certifique-se de estar na raiz do repositório inteiro:
```bash
pip install pandas scikit-learn statsmodels plotly python-dotenv pymongo
python previsao_ocupacao.py
```
*(Após rodar o script, os novos arquivos JSON serão injetados magicamente no projeto React!)*

### Passo 5: Executar o App Mobile (React Native)
Abra um terceiro terminal:
```bash
cd mobile/GymRadar
npm install
npx expo start
```
*Escaneie o QR Code usando o app "Expo Go" em seu smartphone Android/iOS.*

---

## 🧪 TDD (Desenvolvimento Orientado por Testes)

O projeto segue a disciplina Red-Green-Refactor: cada teste é escrito **antes** da implementação, observado falhar (RED), implementado minimamente (GREEN) e refatorado. Todos os testes rodam de forma automatizada no CI.

### Backend (Vitest + Supertest)
```bash
cd backend
npm test              # roda toda a suíte
npm run test:watch    # modo watch durante o desenvolvimento
```
Cobre a lógica pura de experimentação (`src/services/experimentService.js`: atribuição determinística de variantes, agregação de impressões/conversões, uplift e significância estatística via qui-quadrado) e as rotas HTTP (`POST /experiments/event`, `GET /experiments/results`) com Prisma mockado.

### Frontend (Jest + Testing Library)
```bash
cd front
npm test -- --watchAll=false
```
Cobre o fluxo de autenticação (tela de login/signup) e o painel de resultados A/B (`ExperimentResults`).

### Mobile (Jest + jest-expo)
```bash
cd mobile/GymRadar
npm test              # suíte de testes
npm run typecheck     # verificação de tipos (tsc --noEmit)
```
Cobre a lógica de atribuição de variantes (`src/experiments/experiment.ts`) e componentes (ex.: `GymRow`).

---

## 🎯 Testes A/B (Experimentação)

O GymRadar possui uma plataforma de experimentação própria e leve, aplicada ao app mobile.

### Experimento ativo: `home_gym_layout`
* **Hipótese**: como a home do app lista academias em cartões grandes que ocupam muito espaço vertical, acreditamos que um layout compacto em linhas (variante B) aumentará o engajamento com o dashboard em comparação ao layout atual em cartões (variante A).
* **Variante A (controle)**: cartões grandes (`OccupancyBar`).
* **Variante B (tratamento)**: linhas compactas (`GymRow`).
* **Métrica primária**: taxa de conversão = cliques em "View Analytics Dashboard" ÷ impressões da lista de academias.
* **Atribuição**: determinística por usuário (hash de `experiment:userId`), 50/50, estável entre sessões.

### Como funciona o fluxo
1. O app resolve um id anônimo estável (AsyncStorage) ou usa o username logado.
2. `assignVariant()` decide a variante de forma determinística.
3. Ao abrir a home → evento `impression` é registrado.
4. Ao tocar em "View Analytics Dashboard" → evento `conversion` é registrado.
5. Eventos são persistidos na coleção `ExperimentEvent` (MongoDB) via `POST /experiments/event`.

### Endpoints
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/experiments/event` | Registra `impression`/`conversion` (autenticado via JWT) |
| `GET` | `/experiments/results?experiment=home_gym_layout` | Retorna contagens por variante, taxa de conversão, uplift, p-value e vencedor |

### Onde ver os resultados
No **Dashboard Web** (`/dashboard`) existe o painel **"A/B Test"** que consome `GET /experiments/results` e exibe:
* Impressões, conversões e taxa por variante;
* Uplift relativo de B sobre A;
* p-value (qui-quadrado, df=1) e selo **Significant**/**Inconclusive**;
* Vencedor apontado quando houver diferença.

> Regra estatística: um resultado só deve ser declarado vencedor após a amostra ser suficiente e o p-value < 0.05. Não pare o experimento cedo (o famoso *peeking problem*).

---

## 🔁 CI/CD (Integração e Entrega Contínua)

Workflows do GitHub Actions em `.github/workflows/`:

### CI — `ci.yml` (PRs e push na `main`)
| Job | O que faz |
|-----|-----------|
| `backend` | `npm ci`, gera cliente Prisma e roda Vitest |
| `front` | `npm ci`, roda Jest e `npm run build` |
| `mobile` | `npm ci`, `tsc --noEmit` e Jest (jest-expo) |

### CD — `cd.yml` (push na `main`)
| Job | O que faz | Requer secret |
|-----|-----------|---------------|
| `deploy-backend` | Dispara deploy no Render via *deploy hook* | `RENDER_BACKEND_DEPLOY_HOOK_URL` |
| `deploy-front` | Faz build e dispara deploy estático no Render | `RENDER_FRONT_DEPLOY_HOOK_URL` |
| `publish-mobile` | Publica atualização OTA via EAS Update | `EXPO_TOKEN` |

Cada job do CD é **ignorado automaticamente** enquanto o secret correspondente não estiver configurado no repositório — a pipeline continua verde e passa a publicar assim que as credenciais forem adicionadas.

### Criando um deploy hook no Render
1. No painel do Render, acesse o serviço → **Settings** → **Deploy Hook** → **Generate Hook**.
2. Copie a URL gerada e adicione como secret no GitHub:
   `Settings → Secrets and variables → Actions → New repository secret`.
