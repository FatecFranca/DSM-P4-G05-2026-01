import { Router } from 'express';
import authenticateToken from '../middleware/authenticateToken.js';
import { addClient, checkoutClient, getClients } from '../controllers/clientController.js';

const router = Router();

router.post('/', authenticateToken, addClient);
router.post('/checkout', authenticateToken, checkoutClient);
router.get('/', authenticateToken, getClients);

export default router;