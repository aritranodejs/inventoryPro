import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const dashboardController = new DashboardController();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Analytics and statistics
 */

router.use(authenticate);

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 */
router.get('/stats', dashboardController.getDashboardStats);

/**
 * @swagger
 * /api/dashboard/top-sellers:
 *   get:
 *     summary: Get top selling items
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of top sellers
 */
router.get('/top-sellers', dashboardController.getTopSellers);

/**
 * @swagger
 * /api/dashboard/stock-movement:
 *   get:
 *     summary: Get stock movement data for graph
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Stock movement data
 */
router.get('/stock-movement', dashboardController.getStockMovementData);

export default router;
