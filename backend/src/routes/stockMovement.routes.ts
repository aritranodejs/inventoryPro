import { Router } from 'express';
import { StockMovementController } from '../controllers/stockMovement.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const stockMovementController = new StockMovementController();

router.use(authenticate);

router.get('/', stockMovementController.getStockMovements);

export default router;
