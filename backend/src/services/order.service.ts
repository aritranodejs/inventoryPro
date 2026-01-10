import { OrderRepository } from '../repositories/order.repository';
import { ProductRepository } from '../repositories/product.repository';
import { StockMovementRepository } from '../repositories/stockMovement.repository';
import { PurchaseOrderRepository } from '../repositories/purchaseOrder.repository';
import { OrderStatus, MovementType } from '../types';
import { AppError } from '../middleware/errorHandler';
import { withTransaction } from '../utils/transactionWrapper';
import { emitToTenant } from '../socket';

export class OrderService {
    private orderRepo: OrderRepository;
    private productRepo: ProductRepository;
    private stockMovementRepo: StockMovementRepository;
    private poRepo: PurchaseOrderRepository;

    constructor() {
        this.orderRepo = new OrderRepository();
        this.productRepo = new ProductRepository();
        this.stockMovementRepo = new StockMovementRepository();
        this.poRepo = new PurchaseOrderRepository();
    }

    async createOrder(
        tenantId: string,
        userId: string,
        data: { items: any[]; customerName?: string; customerEmail?: string; notes?: string }
    ) {
        return await withTransaction(async (session) => {
            const pendingPOs = await this.poRepo.findPending(tenantId);
            const replenishingSkus = new Set(
                pendingPOs.flatMap(po => po.items.map(item => item.variantSku))
            );

            for (const item of data.items) {
                // Atomic deduction with check
                const updatedProduct = await this.productRepo.deductVariantStock(
                    item.productId,
                    item.variantSku,
                    item.quantity,
                    tenantId,
                    session
                );

                if (!updatedProduct) {
                    throw new AppError(
                        `Insufficient stock or product/variant not found for SKU: ${item.variantSku}`,
                        400
                    );
                }

                const variant = updatedProduct.variants.find(v => v.sku === item.variantSku)!;

                await this.stockMovementRepo.create({
                    tenantId,
                    productId: updatedProduct._id,
                    variantSku: item.variantSku,
                    type: MovementType.SALE,
                    quantity: -item.quantity,
                    userId,
                    reference: 'Order'
                } as any, session);

                emitToTenant(tenantId, 'stock_movement', {
                    productId: updatedProduct._id,
                    productName: updatedProduct.name,
                    variantSku: item.variantSku,
                    quantity: -item.quantity,
                    type: MovementType.SALE,
                    timestamp: new Date()
                });

                if (variant.stock < updatedProduct.lowStockThreshold && !replenishingSkus.has(item.variantSku)) {
                    emitToTenant(tenantId, 'low_stock', {
                        productId: updatedProduct._id,
                        productName: updatedProduct.name,
                        variantSku: item.variantSku,
                        currentStock: variant.stock,
                        threshold: updatedProduct.lowStockThreshold
                    });
                }
            }

            const orderCount = await this.orderRepo.countByTenant(tenantId);
            const orderNumber = `ORD-${String(orderCount + 1).padStart(6, '0')}`;

            const totalAmount = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            const order = await this.orderRepo.create({
                tenantId,
                orderNumber,
                status: OrderStatus.CONFIRMED,
                items: data.items.map(item => ({
                    ...item,
                    fulfilledQuantity: 0
                })),
                totalAmount,
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                notes: data.notes,
                createdBy: userId
            } as any, session);

            emitToTenant(tenantId, 'order_created', order);
            return order;
        });
    }

    async getOrders(
        tenantId: string,
        filters: { status?: string },
        pagination: { page: number; limit: number }
    ) {
        return await this.orderRepo.findAll(tenantId, filters, pagination);
    }

    async fulfillOrder(id: string, tenantId: string) {
        const order = await this.orderRepo.findById(id, tenantId);
        if (!order) {
            throw new AppError('Order not found', 404);
        }

        if (order.status === OrderStatus.FULFILLED) {
            throw new AppError('Order already fulfilled', 400);
        }

        if (order.status === OrderStatus.CANCELLED) {
            throw new AppError('Cannot fulfill cancelled order', 400);
        }

        const updatedOrder = await this.orderRepo.update(id, tenantId, { status: OrderStatus.FULFILLED } as any);
        if (updatedOrder) {
            emitToTenant(tenantId, 'order_updated', updatedOrder);
        }
        return updatedOrder;
    }

    async fulfillOrderItems(
        id: string,
        tenantId: string,
        items: Array<{ variantSku: string, quantity: number }>
    ) {
        return await withTransaction(async (session) => {
            const order = await this.orderRepo.findById(id, tenantId, session);
            if (!order) throw new AppError('Order not found', 404);

            for (const fulfillment of items) {
                const orderItem = order.items.find(i => i.variantSku === fulfillment.variantSku);
                if (!orderItem) throw new AppError(`Item ${fulfillment.variantSku} not in order`, 404);

                const remaining = orderItem.quantity - orderItem.fulfilledQuantity;
                if (fulfillment.quantity > remaining) {
                    throw new AppError(`Cannot fulfill more than remaining for ${fulfillment.variantSku}`, 400);
                }

                orderItem.fulfilledQuantity += fulfillment.quantity;
            }

            const allFulfilled = order.items.every(item => item.fulfilledQuantity === item.quantity);
            if (allFulfilled) {
                order.status = OrderStatus.FULFILLED;
            }

            order.updatedAt = new Date();
            await order.save({ session });
            emitToTenant(tenantId, 'order_updated', order);
            return order;
        });
    }

    async cancelOrder(id: string, tenantId: string, userId: string) {
        return await withTransaction(async (session) => {
            const order = await this.orderRepo.findById(id, tenantId, session);
            if (!order) {
                throw new AppError('Order not found', 404);
            }

            if (order.status === OrderStatus.CANCELLED) {
                throw new AppError('Order already cancelled', 400);
            }

            for (const item of order.items) {
                const productId = typeof item.productId === 'object' && item.productId !== null && '_id' in item.productId
                    ? (item.productId as any)._id.toString()
                    : String(item.productId);

                // Atomic stock return
                await this.productRepo.updateVariantStock(
                    productId,
                    item.variantSku,
                    item.quantity,
                    tenantId,
                    session
                );

                await this.stockMovementRepo.create({
                    tenantId,
                    productId,
                    variantSku: item.variantSku,
                    type: MovementType.RETURN,
                    quantity: item.quantity,
                    userId,
                    reference: `Order ${order.orderNumber} cancelled`
                } as any, session);
            }

            const updatedOrder = await this.orderRepo.update(id, tenantId, { status: OrderStatus.CANCELLED } as any, session);
            if (updatedOrder) {
                emitToTenant(tenantId, 'order_updated', updatedOrder);
            }
            return updatedOrder;
        });
    }
}
