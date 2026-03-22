1. users
   - Campos:
     - _id: ObjectId
     - username: string (unique)
     - passwordHash: string
     - role: string (ex.: "admin" | "staff")
     - createdAt: date
   - Índices:
     - username (único)
   - Justificativa:
     - Usuários são documentos próprios para autenticação/autorização.

2. gyms
   - Campos:
     - _id: ObjectId
     - name: string
     - address: string
     - phone: string
     - capacity: number
     - currentOccupancy: number
     - createdAt: date
     - meta: object (opcional)
   - Índices:
     - name (index para buscas por nome)
   - Justificativa:
     - Academias são entidades principais; currentOccupancy mantido no documento para leituras rápidas.

3. clients
   - Campos (compatível com o que o README recebe):
     - _id: ObjectId
     - name: string
     - email: string
     - phone: string
     - gymName: string  // campo atual usado pelo front/back do projeto
     - checkInAt: date
     - active: boolean
   - Índices:
     - email (opcionalmente único)
     - gymName (para consultas por academia)
   - Justificativa:
     - Manter gymName funciona e reflete o payload atual; porém, usar gymName causa duplicação e fragilidade (mudança de nome da academia quebra referência).

Recomendação técnica (melhoria)
- Migrar clients.gymName → clients.gymId (ObjectId referencing gyms._id):
  - Motivo: integridade referencial, menor risco de inconsistência, consultas mais confiáveis.
  - Como migrar:
    1. Criar campo gymId em clients e popular com o _id correspondente (script de migração).
    2. Atualizar endpoints front/back para aceitar/usar gymId.
    3. Preservar gymName se precisar exibição rápida (redundância controlada).
- Usar transações (Mongo replica set / Atlas) ao fazer check-in/out: inserir/atualizar client e incrementar/decrementar gyms.currentOccupancy para manter consistência.

Operações e consultas otimizadas
- Listar academias:
  - db.gyms.find().sort({ name: 1 })
- Buscar clientes de uma academia (se usar gymId):
  - db.clients.find({ gymId: ObjectId("...") })
- Check-in (recomendado com transação):
  - iniciar transação
  - criar/atualizar documento client (set active=true, checkInAt)
  - incrementar gyms.currentOccupancy
  - commit

Índices sugeridos
- users.username : unique
- clients.email : unique (se aplicável)
- clients.gymId (ou clients.gymName)
- gyms.name (text index se houver busca por fragmentos)