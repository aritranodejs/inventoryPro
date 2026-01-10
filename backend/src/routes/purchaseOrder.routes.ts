import { Router } from 'express';
import { PurchaseOrderController } from '../controllers/purchaseOrder.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { UserRole } from '../types';

const router = Router();
const poController = new PurchaseOrderController();

/**
 * @swagger
 * tags:
 *   name: PurchaseOrders
 *   description: Purchase order management
 */

router.use(authenticate);

/**
 * @swagger
 * /api/purchase-orders:
 *   post:
 *     summary: Create a new purchase order
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PurchaseOrder'
 *     responses:
 *       201:
 *         description: Purchase order created
 */
router.post('/', authorize(UserRole.OWNER, UserRole.MANAGER), poController.createPurchaseOrder);

/**
 * @swagger
 * /api/purchase-orders:
 *   get:
 *     summary: Get all purchase orders
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of purchase orders
 */
router.get('/', poController.getPurchaseOrders);

/**
 * @swagger
 * /api/purchase-orders/{id}/status:
 *   put:
 *     summary: Update purchase order status
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
router.put('/:id/status', authorize(UserRole.OWNER, UserRole.MANAGER), poController.updatePOStatus);

/**
 * @swagger
 * /api/purchase-orders/{id}/receive:
 *   put:
 *     summary: Receive items for purchase order
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receivedItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     variantSku: { type: string }
 *                     quantity: { type: number }
 *     responses:
 *       200:
 *         description: Items received
 */
router.put('/:id/receive', authorize(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF), poController.receiveItems);

export default router;
