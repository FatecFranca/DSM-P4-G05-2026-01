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

router.get('/dashboard/analytics', authenticateToken, async (req, res) => {
  try {
    const { gymName } = req.query;
    const whereClause = { eventType: 'checkin' };
    if (gymName) {
      whereClause.gymName = gymName;
    }

    let pico_checkins = 0;
    const diaCount = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const hourDateGymCount = {};
    
    // Using cursor-based pagination to fetch in chunks and prevent Out of Memory (OOM) on large datasets
    let cursor = null;
    let hasMore = true;
    const take = 15000;
    let total_checkins = 0;

    while (hasMore) {
      const args = {
        where: whereClause,
        select: { id: true, gymName: true, occurredAt: true, receivedAt: true },
        take,
        orderBy: { id: 'asc' }
      };

      if (cursor) {
        args.cursor = { id: cursor };
        args.skip = 1;
      }

      const events = await prisma.ioTEvent.findMany(args);

      if (events.length === 0) {
        hasMore = false;
        break;
      }

      cursor = events[events.length - 1].id;
      total_checkins += events.length;

      events.forEach(e => {
        const dateString = e.occurredAt || e.receivedAt;
        if (!dateString) return;
        const d = new Date(dateString);
        const hora = d.getUTCHours(); 
        const dateStr = d.toISOString().split('T')[0];
        const dia = days[d.getUTCDay()];
        const gym = e.gymName;

        if ([18, 19, 20].includes(hora)) pico_checkins++;

        const diaKey = `${gym}_${dia}`;
        if (!diaCount[diaKey]) diaCount[diaKey] = { gymName: gym, dia_semana: dia, checkins: 0 };
        diaCount[diaKey].checkins += 1;

        const hKey = `${gym}_${dateStr}_${hora}`;
        hourDateGymCount[hKey] = (hourDateGymCount[hKey] || 0) + 1;
      });
    }

    const gymHourSum = {};
    const gymHourDays = {};

    Object.keys(hourDateGymCount).forEach(key => {
      const [gym, dateStr, hora] = key.split('_');
      const ghKey = `${gym}_${hora}`;
      if (!gymHourSum[ghKey]) { gymHourSum[ghKey] = 0; gymHourDays[ghKey] = 0; }
      gymHourSum[ghKey] += hourDateGymCount[key];
      gymHourDays[ghKey] += 1;
    });

    const evolucao_hora = Object.keys(gymHourSum).map(key => {
      const [gym, hora] = key.split('_');
      return {
        gymName: gym,
        hora: Number(hora),
        checkins: gymHourSum[key] / gymHourDays[key]
      };
    }).sort((a, b) => a.hora - b.hora);

    const checkinsPerHourList = Object.values(hourDateGymCount);
    let media_hora = 0;
    let mediana_hora = 0;

    if (checkinsPerHourList.length > 0) {
       media_hora = checkinsPerHourList.reduce((a,b)=>a+b,0) / checkinsPerHourList.length;
       checkinsPerHourList.sort((a,b)=>a-b);
       const mid = Math.floor(checkinsPerHourList.length / 2);
       mediana_hora = checkinsPerHourList.length % 2 !== 0 ? checkinsPerHourList[mid] : (checkinsPerHourList[mid - 1] + checkinsPerHourList[mid]) / 2;
    }

    const pct_pico = total_checkins > 0 ? (pico_checkins / total_checkins) * 100 : 0;
    const volume_dia = Object.values(diaCount);

    res.json({
      total_checkins,
      media_hora,
      mediana_hora,
      pct_pico,
      evolucao_hora,
      volume_dia
    });
  } catch (error) {
    console.error('get dashboard analytics error:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

export default router;