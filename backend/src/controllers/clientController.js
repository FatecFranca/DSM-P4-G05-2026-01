import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export const addClient = async (req, res) => {
  try {
    console.log('POST /clients body:', req.body); 
    const { name, gymName, email, phone } = req.body || {};

    const trimmedGym = (gymName ?? '').toString().trim();
    if (!trimmedGym) {
      return res.status(400).json({ message: 'Missing gymName' }); 
    }

    const gym = await prisma.gym.findFirst({ where: { name: trimmedGym } });
    if (!gym) {
      return res.status(404).json({ message: `Gym not found: ${trimmedGym}` }); 
    }

    const clientName =
      (name ?? '').toString().trim() || `anon-${Math.random().toString(36).slice(2, 8)}`; 

    const client = await prisma.client.create({
      data: {
        name: clientName,
        gymName: gym.name,
        email: email ?? null,
        phone: phone ?? null,
      },
    });

    await prisma.gym.update({
      where: { id: gym.id },
      data: { occupancy: (gym.occupancy ?? 0) + 1 },
    });

    return res.status(201).json(client);
  } catch (error) {
    console.error('addClient error:', error);
    return res.status(500).json({ message: 'Error creating client', error: error.message });
  }
};


export const checkoutClient = async (req, res) => {
  try {
    console.log('POST /clients/checkout body:', req.body); 
    const { gymName, name } = req.body || {};

    const trimmedGym = (gymName ?? '').toString().trim();
    if (!trimmedGym) {
      return res.status(400).json({ message: 'Missing gymName' });
    }

    const gym = await prisma.gym.findFirst({ where: { name: trimmedGym } });
    if (!gym) {
      return res.status(404).json({ message: `Gym not found: ${trimmedGym}` }); 
    }

    let client = null;
    const trimmedName = (name ?? '').toString().trim();
    if (trimmedName) {
      client = await prisma.client.findFirst({
        where: { name: trimmedName, gymName: gym.name },
      });
    } else {
      client = await prisma.client.findFirst({ where: { gymName: gym.name } }); 
    }

    if (client) {
      await prisma.client.delete({ where: { id: client.id } });
    }

    await prisma.gym.update({
      where: { id: gym.id },
      data: { occupancy: Math.max(0, (gym.occupancy ?? 0) - 1) }, 
    });

    return res.status(200).json({ message: 'Checked out' });
  } catch (error) {
    console.error('checkoutClient error:', error);
    return res.status(500).json({ message: 'Error during checkout', error: error.message });
  }
};

export const getClients = async (_req, res) => {
  try {
    const clients = await prisma.client.findMany();
    return res.json(clients);
  } catch (error) {
    console.error('getClients error:', error);
    return res.status(500).json({ message: 'Error fetching clients', error: error.message });
  }
};