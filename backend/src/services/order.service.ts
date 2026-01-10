import { OrderRepository } from '../repositories/order.repository';
import { ProductRepository } from '../repositories/product.repository';
import { StockMovementRepository } from '../repositories/stockMovement.repository';
import { OrderStatus, MovementType } from '../types';
import { AppError } from '../middleware/errorHandler';
import { withTransaction } from '../utils/transactionWrapper';
import { emitToTenant } from '../socket';

export class OrderService {
    private orderRepo: OrderRepository;
    private productRepo: ProductRepository;
    private stockMovementRepo: StockMovementRepository;

    constructor() {
        this.orderRepo = new OrderRepository();
        this.productRepo = new ProductRepository();
        this.stockMovementRepo = new StockMovementRepository();
    }

    async createOrder(
        tenantId: string,
        userId: string,
        data: { items: any[]; customerName?: string; customerEmail?: string; notes?: string }
    ) {
        return await withTransaction(async (session) => {
            for (const item of data.items) {
                const product = await this.productRepo.findById(item.productId, tenantId, session);
                if (!product) {
                    throw new AppError(`Product ${item.productId} not found`, 404);
                }

                const variant = product.variants.find(v => v.sku === item.variantSku);
                if (!variant) {
                    throw new AppError(`Variant ${item.variantSku} not found`, 404);
                }

                if (variant.stock < item.quantity) {
                    throw new AppError(
                        `Insufficient stock for ${product.name} - ${item.variantSku}. Available: ${variant.stock}`,
                        400
                    );
                }

                variant.stock -= item.quantity;
                await product.save({ session });

                await this.stockMovementRepo.create({
                    tenantId,
                    productId: product._id,
                    variantSku: item.variantSku,
                    type: MovementType.SALE,
                    quantity: -item.quantity,
                    userId,
                    reference: 'Order'
                } as any, session);

                emitToTenant(tenantId, 'stock_movement', {
                    productId: product._id,
                    productName: product.name,
                    variantSku: item.variantSku,
                    quantity: -item.quantity,
                    type: MovementType.SALE,
                    timestamp: new Date()
                });

                if (variant.stock < product.lowStockThreshold) {
                    emitToTenant(tenantId, 'low_stock', {
                        productId: product._id,
                        productName: product.name,
                        variantSku: item.variantSku,
                        currentStock: variant.stock,
                        threshold: product.lowStockThreshold
                    });
                }
            }

            const orderCount = await this.orderRepo.countByTenant(tenantId);
            const orderNumber = `ORD-${String(orderCount + 1).padStart(6, '0')}`;

            const totalAmount = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            return await this.orderRepo.create({
                tenantId,
                orderNumber,
                status: OrderStatus.CONFIRMED,
                items: data.items.map(item => ({
                    ...item,
                    fulfilledQuantity: item.quantity
                })),
                totalAmount,
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                notes: data.notes,
                createdBy: userId
            } as any, session);
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

        return await this.orderRepo.update(id, tenantId, { status: OrderStatus.FULFILLED } as any);
    }

    async cancelOrder(id: string, tenantId: string, userId: string) {
        return await withTransaction(async (session) => {
            const order = await this.orderRepo.findById(id, tenantId);
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

                const product = await this.productRepo.findById(productId, tenantId, session);
                if (product) {
                    const variant = product.variants.find(v => v.sku === item.variantSku);
                    if (variant) {
                        variant.stock += item.fulfilledQuantity;
                        await product.save({ session });

                        await this.stockMovementRepo.create({
                            tenantId,
                            productId: product._id,
                            variantSku: item.variantSku,
                            type: MovementType.RETURN,
                            quantity: item.fulfilledQuantity,
                            userId,
                            reference: `Order ${order.orderNumber} cancelled`
                        } as any, session);
                    }
                }
            }

            return await this.orderRepo.update(id, tenantId, { status: OrderStatus.CANCELLED } as any, session);
        });
    }
}
