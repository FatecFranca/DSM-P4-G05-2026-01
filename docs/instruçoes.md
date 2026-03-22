Guia rápido para executar localmente (adaptado à estrutura lida no repositório)

Pré-requisitos:
- Node.js (recomendado >=16)
- npm
- MongoDB local (ou Atlas; ajuste MONGO_URI)

1) Backend
- Copie backend/.env.example -> backend/.env e ajuste MONGO_URI (ex.: mongodb://localhost:27017/gymapp)
- Instale dependências:
  cd backend
  npm install
- Rodar seed de exemplo (adicionado como backend/seed.js se presente):
  MONGO_URI="mongodb://localhost:27017/gymapp" node seed.js
  (Isso cria: duas academias, dois clientes e um usuário admin)
- Iniciar servidor:
  cd backend
  npm start
  (O package.json normalmente já tem "start": "node ./src/bin/server.js"; app.js registra rotas /auth, /gyms, /clients)
- Endpoints documentados: docs/openapi.yaml (pode importar no Swagger Editor ou Postman)

2) Frontend
- cd front
- npm install
- npm start
- Abra http://localhost:3000
- Fluxo de teste sugerido:
  - POST /auth/login (usar usuário admin criado pelo seed)
  - Use o token JWT retornado em Authorization: Bearer <token>
  - Teste POST /gyms, GET /gyms, POST /clients, POST /clients/checkout conforme spec.

Observações:
- O projeto atualmente usa payloads com "gymName" no POST /clients (conforme README). Recomenda-se migrar para gymId (ObjectId) posteriormente.
- Se a equipe optar por Prisma, executar (no backend):
  npx prisma generate
  npx prisma db push
  e ajustar DATABASE_URL no .env