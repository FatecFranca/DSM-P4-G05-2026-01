# GymRadar

Projeto interdisciplinar da Faculdade de Tecnologia — FATEC — primeiro semestre de 2026

Aplicativo móvel (Expo/React Native) com backend Node.js/Express + Prisma (MongoDB) para gerenciamento de academias, autenticação, registro de clientes (check-in/out) e visualização em tempo real da ocupação das unidades.

## Sumário
- Visão Geral
- Principais Funcionalidades
- Stack Tecnológica
- Arquitetura
- Como Executar (Backend e Mobile)
- Configuração
- API (Resumo)
- Modelos de Dados (Prisma)
- Dicas e Solução de Problemas
- Scripts Úteis
- Licença e Créditos

---

## Visão Geral
GymRadar permite:
- Criar e gerenciar academias (nome único, capacidade, telefone, endereço)
- Autenticação de usuários (login e cadastro) com JWT
- Check-in/Check-out de clientes por academia
- Visualização da ocupação atual versus capacidade com uma barra colorida:
  - Verde: abaixo de 50%
  - Laranja: entre 50% e 90%
  - Vermelho: acima de 90%

Este projeto foi desenvolvido como parte do “Projeto interdisciplinar da faculdade de tecnologia — FATEC — primeiro semestre de 2026”.

## Principais Funcionalidades
- Autenticação (login, signup) e guarda de rotas: usuários não autenticados são redirecionados para a tela de login.
- Lista de academias com barra de ocupação animada e ação de exclusão.
- Registro de clientes (check-in/out) por academia configurada.
- Atualização imediata da ocupação ao realizar check-in/out.
- Simulador IoT (tela separada) para testes de dados.

## Stack Tecnológica
- Mobile: Expo + React Native + Expo Router
- Backend: Node.js + Express
- ORM: Prisma
- Banco de dados: MongoDB
- Autenticação: JWT
- Armazenamento local (mobile): AsyncStorage

## Arquitetura
- mobile/GymRadar
  - src/api: cliente HTTP (fetch) com gerenciamento de token
  - src/context: contexto de Auth (token/usuário) e Gym (ocupação/refresh)
  - src/components: componentes UI (OccupancyBar, InputGym, CheckInNOut, etc.)
  - app/: telas e navegação com Expo Router (index, login, signup, simulator, addGym)
- backend
  - src/routes: rotas Express (auth, gyms, clients)
  - Prisma: schema de modelos (User, Client, Gym) com MongoDB

## Como Executar

### Pré-requisitos
- Node.js 18+
- MongoDB (local ou Atlas) e variável `DATABASE_URL`
- Expo CLI (opcional, via `npx`)

### Backend
1. Instale dependências:
   - `npm install`
2. Configure variável de ambiente:
   - `.env` → `DATABASE_URL="mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority"`
3. Prisma:
   - `npx prisma generate`
   - Para MongoDB, não há migrations tradicionais; garanta que a conexão está correta.
4. Execute o servidor:
   - `npm run dev` (ou `npm start`)
5. O backend deve responder em `http://localhost:5000` (ajuste conforme necessário).

### Mobile (Expo)
1. Instale dependências:
   - `npm install` (ou `yarn`)
2. Configure o backend no app:
   - Em `app.json` ou `app.config.js`, configure `extra.backendUrl` (LAN/localhost):
     - Ex.: `"extra": { "backendUrl": "http://192.168.100.166:5000", "gymId": "Academia Centro" }`
3. Inicie o app:
   - `npx expo start`
   - Android emulador usa `http://10.0.2.2:5000` para apontar ao host local; no dispositivo físico, use IP da máquina na mesma rede.
4. Escaneie o QR code no Expo Go ou rode no emulador.

## Configuração

### Variáveis Expo (extra)
- `backendUrl`: URL do backend (ex.: `http://192.168.100.166:5000`)
- `gymId`: nome da academia padrão para operações de check-in/out (ex.: `Academia Centro`)

### Armazenamento de Token
- Chave AsyncStorage: `auth_token`
- O cliente HTTP (`src/api/client.ts`) aplica automaticamente `Authorization: Bearer <token>` quando o token está definido.
- Em `AuthContext`, o estado de autenticação é derivado da presença do token e hidratação inicial.

## API (Resumo)

- Auth
  - POST `/auth/login` → body: `{ username, password }` → retorno: `{ token }`
  - POST `/auth/signup` → body: `{ username, password }` → retorno: `{ token }`
- Gyms
  - GET `/gyms` → lista de academias
  - POST `/gyms` → body: `{ name, address?, phone?, capacity }`
  - DELETE `/gyms/:id` → remove academia por id (ObjectId string)
- Clients
  - POST `/clients` → body: `{ gymName }` → registra check-in (cliente simulado ou real)
  - POST `/clients/checkout` → body: `{ gymName }` → registra check-out

Respostas incorretas (erros) retornam `message` para exibição no cliente.

## Modelos de Dados (Prisma)

Schema (MongoDB) típico:
```prisma
generator client {
  provider = "prisma-client-js"
}
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id        String  @id @map("_id") @db.ObjectId @default(auto())
  username  String  @unique
  password  String
}

model Client {
  id       String  @id @map("_id") @db.ObjectId @default(auto())
  name     String
  gymName  String
  email    String?
  phone    String?
}

model Gym {
  id         String  @id @map("_id") @db.ObjectId @default(auto())
  name       String  @unique
  address    String?
  phone      String?
  capacity   Int
  occupancy  Int      @default(0)
}
```

Observações:
- `Gym.name` é único — a tentativa de criar um nome já existente gera erro Prisma `P2002`.
- IDs são `ObjectId` via string; não envie `id` ao criar, e ao deletar use exatamente o `id` retornado.
- `capacity` é `Int` e `occupancy` inicia em 0.

## Dicas e Solução de Problemas

- Erro 500 ao criar academia:
  - Geralmente por `P2002` (nome duplicado), tipo inválido (capacity não numérico) ou campo obrigatório ausente.
  - Valide no cliente (nome não vazio; `capacity` > 0) e trate `P2002` no backend com retorno 409.
- Android emulador e localhost:
  - Use `http://10.0.2.2:5000` no emulador para atingir o host local. Em dispositivo físico, use IP da máquina.
- JWT decode:
  - Evite dependência extra (jwt-decode) se já obtém `username` do `AuthContext`.
- Barra de ocupação:
  - Cores baseadas no percentual:
    - `< 50%` → Verde
    - `>= 50% e < 90%` → Laranja
    - `>= 90%` → Vermelho
- Atualização imediata após check-in/out:
  - Chame `GymContext.refresh()` e recarregue a lista de academias (`getGyms()`) ao concluir operações de cliente.

## Scripts Úteis (exemplos)
- Backend:
  - `npm run dev` → inicia servidor com nodemon
  - `npx prisma generate` → gera client Prisma
- Mobile:
  - `npx expo start -c` → inicia Expo e limpa cache
  - `npm run android` / `npm run ios` → roda em emuladores

## Licença e Créditos
- Projeto acadêmico: “Projeto interdisciplinar da faculdade de tecnologia — FATEC — primeiro semestre de 2026”.
- Este repositório é para fins educacionais/demonstração.
- Créditos aos participantes e docentes da FATEC.

---