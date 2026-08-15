import { Router } from 'express';
import authenticateToken from '../middleware/authenticateToken.js';
import {
  recordExperimentEvent,
  getExperimentResults,
} from '../controllers/experimentController.js';

const router = Router();

router.post('/event', authenticateToken, recordExperimentEvent);
router.get('/results', authenticateToken, getExperimentResults);

export default router;
