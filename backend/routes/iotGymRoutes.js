import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import authenticateIot from "../middleware/authenticateiot.js";

const prisma = new PrismaClient();
const router = Router();

function parseOccurredAt(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

router.post("/gym/:gymName/checkin", authenticateIot, async (req, res) => {
  try {
    const { gymName } = req.params;
    const { deviceId, occurredAt } = req.body || {};

    if (!deviceId) return res.status(400).json({ message: "Missing deviceId" });

    const gym = await prisma.gym.findUnique({ where: { name: gymName } });
    if (!gym) return res.status(404).json({ message: `Gym not found: ${gymName}` });

    // Bloqueia lotação
    if (gym.occupancy >= gym.capacity) {
      return res.status(409).json({
        ok: false,
        message: `Gym full: ${gymName}`,
        gym: { name: gym.name, occupancy: gym.occupancy, capacity: gym.capacity },
      });
    }

    const updated = await prisma.gym.update({
      where: { id: gym.id },
      data: { occupancy: gym.occupancy + 1 },
    });

    await prisma.ioTEvent.create({
      data: {
        gymName,
        deviceId,
        eventType: "checkin",
        source: "simulator", // ou "button" (tanto faz; use "simulator" se vem do simulador)
        occurredAt: parseOccurredAt(occurredAt),
      },
    });

    return res.json({ ok: true, gym: { name: updated.name, occupancy: updated.occupancy } });
  } catch (error) {
    console.error("iot checkin error:", error);
    return res.status(500).json({ message: "Error on checkin", error: error.message });
  }
});

router.post("/gym/:gymName/checkout", authenticateIot, async (req, res) => {
  try {
    const { gymName } = req.params;
    const { deviceId, occurredAt } = req.body || {};

    if (!deviceId) return res.status(400).json({ message: "Missing deviceId" });

    const gym = await prisma.gym.findUnique({ where: { name: gymName } });
    if (!gym) return res.status(404).json({ message: `Gym not found: ${gymName}` });

    // Bloqueia saída quando já está 0
    if (gym.occupancy <= 0) {
      return res.status(409).json({
        ok: false,
        message: `Gym empty: ${gymName}`,
        gym: { name: gym.name, occupancy: gym.occupancy, capacity: gym.capacity },
      });
    }

    const updated = await prisma.gym.update({
      where: { id: gym.id },
      data: { occupancy: gym.occupancy - 1 },
    });

    await prisma.ioTEvent.create({
      data: {
        gymName,
        deviceId,
        eventType: "checkout",
        source: "simulator",
        occurredAt: parseOccurredAt(occurredAt),
      },
    });

    return res.json({ ok: true, gym: { name: updated.name, occupancy: updated.occupancy } });
  } catch (error) {
    console.error("iot checkout error:", error);
    return res.status(500).json({ message: "Error on checkout", error: error.message });
  }
});

// Seu /telemetry pode ficar igual (opcional manter)
router.post("/gym/:gymName/telemetry", authenticateIot, async (req, res) => {
  try {
    const { gymName } = req.params;
    const { deviceId, eventType, source, occurredAt } = req.body || {};

    if (!deviceId) return res.status(400).json({ message: "Missing deviceId" });
    if (!eventType) return res.status(400).json({ message: "Missing eventType" });

    const gym = await prisma.gym.findUnique({ where: { name: gymName } });
    if (!gym) return res.status(404).json({ message: `Gym not found: ${gymName}` });

    const created = await prisma.ioTEvent.create({
      data: {
        gymName,
        deviceId,
        eventType,
        source: source || "unknown",
        occurredAt: parseOccurredAt(occurredAt),
      },
    });

    return res.status(201).json({ ok: true, event: created });
  } catch (error) {
    console.error("iot telemetry error:", error);
    return res.status(500).json({ message: "Error on telemetry", error: error.message });
  }
});

export default router;