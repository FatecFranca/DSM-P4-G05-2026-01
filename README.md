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