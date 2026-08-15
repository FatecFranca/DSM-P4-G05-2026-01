import { PrismaClient } from '@prisma/client';
import { computeResults, validateEvent } from '../services/experimentService.js';
const prisma = new PrismaClient();

export const recordExperimentEvent = async (req, res) => {
  try {
    const { experiment, variant, eventType, userId } = req.body || {};
    const validation = validateEvent({ experiment, variant, eventType });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    const event = await prisma.experimentEvent.create({
      data: {
        experiment: experiment.trim(),
        variant,
        eventType,
        userId: userId ?? null,
      },
    });
    return res.status(201).json({ ok: true, event });
  } catch (error) {
    console.error('recordExperimentEvent error:', error);
    return res
      .status(500)
      .json({ message: 'Error recording experiment event', error: error.message });
  }
};

export const getExperimentResults = async (req, res) => {
  try {
    const { experiment } = req.query;
    if (!experiment) {
      return res.status(400).json({ error: 'Missing experiment query param' });
    }
    const events = await prisma.experimentEvent.findMany({
      where: { experiment },
    });
    return res.json(computeResults(experiment, events));
  } catch (error) {
    console.error('getExperimentResults error:', error);
    return res
      .status(500)
      .json({ message: 'Error fetching experiment results', error: error.message });
  }
};
