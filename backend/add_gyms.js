import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const gyms = [
    {
      name: 'SmartFit',
      address: 'Av. Alonso Y Alonso, 500 - Jardim Veneza, Franca - SP, 14401-426',
      capacity: 200,
      phone: ''
    },
    {
      name: 'Exprime',
      address: 'Av. Reinaldo Chioca, 660 - Parque Progresso, Franca - SP, 14403-085',
      capacity: 150,
      phone: ''
    },
    {
      name: 'Hydrox',
      address: 'jose abraao da silva, 2340, parque progresso, Franca - SP',
      capacity: 100,
      phone: ''
    }
  ];

  for (const gym of gyms) {
    await prisma.gym.upsert({
      where: { name: gym.name },
      update: { address: gym.address, capacity: gym.capacity },
      create: gym,
    });
    console.log(`Added/Updated ${gym.name}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
