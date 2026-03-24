import { Router } from 'express';
import authenticateToken from '../middleware/authenticateToken.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, address, phone, capacity } = req.body || {};
    if (!name || !String(name).trim() || !capacity) {
      return res.status(400).json({ message: 'Missing name or capacity' });
    }
    const gym = await prisma.gym.create({
      data: { name: String(name).trim(), address: address ?? '', phone: phone ?? '', capacity, occupancy: 0 },
    });
    return res.status(201).json(gym);
  } catch (error) {
    console.error('createGym error:', error);
    return res.status(500).json({ message: 'Error creating gym, Gym may already exist', error: error.message });
  }
});

router.get('/', authenticateToken, async (_req, res) => {
  try {
    const gyms = await prisma.gym.findMany();
    res.set('Cache-Control', 'no-store');
    return res.json(gyms);
  } catch (error) {
    console.error('getGyms error:', error);
    return res.status(500).json({ message: 'Error fetching gyms', error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.gym.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return res.status(404).json({ message: 'Gym not found' });
  }
});

export default router;