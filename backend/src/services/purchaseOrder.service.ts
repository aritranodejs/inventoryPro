import { PurchaseOrderRepository } from '../repositories/purchaseOrder.repository';
import { ProductRepository } from '../repositories/product.repository';
import { StockMovementRepository } from '../repositories/stockMovement.repository';
import { POStatus, MovementType } from '../types';
import { AppError } from '../middleware/errorHandler';
import { withTransaction } from '../utils/transactionWrapper';
import { emitToTenant } from '../socket';

export class PurchaseOrderService {
    private poRepo: PurchaseOrderRepository;
    private productRepo: ProductRepository;
    private stockMovementRepo: StockMovementRepository;

    constructor() {
        this.poRepo = new PurchaseOrderRepository();
        this.productRepo = new ProductRepository();
        this.stockMovementRepo = new StockMovementRepository();
    }

    async createPurchaseOrder(
        tenantId: string,
        userId: string,
        data: { supplierId: string; items: any[]; expectedDeliveryDate?: Date; notes?: string }
    ) {
        const poCount = await this.poRepo.countByTenant(tenantId);
        const poNumber = `PO-${String(poCount + 1).padStart(6, '0')}`;

        const totalAmount = data.items.reduce(
            (sum, item) => sum + (item.price * item.orderedQuantity), 0
        );

        return await this.poRepo.create({
            tenantId,
            supplierId: data.supplierId,
            poNumber,
            status: POStatus.DRAFT,
            items: data.items.map(item => ({
                productId: item.productId,
                variantSku: item.variantSku,
                orderedQuantity: item.orderedQuantity,
                receivedQuantity: 0,
                price: item.price
            })),
            expectedDeliveryDate: data.expectedDeliveryDate,
            totalAmount,
            notes: data.notes,
            createdBy: userId
        } as any);
    }

    async getPurchaseOrders(
        tenantId: string,
        filters: { status?: string },
        pagination: { page: number; limit: number }
    ) {
        return await this.poRepo.findAll(tenantId, filters, pagination);
    }

    async updatePOStatus(id: string, tenantId: string, status: POStatus) {
        const po = await this.poRepo.update(id, tenantId, { status } as any);
        if (!po) {
            throw new AppError('Purchase order not found', 404);
        }
        return po;
    }

    async receiveItems(
        id: string,
        tenantId: string,
        userId: string,
        receivedItems: Array<{ productId: string; variantSku: string; quantity: number }>
    ) {
        return await withTransaction(async (session) => {
            const po = await this.poRepo.findById(id, tenantId, session);
            if (!po) {
                throw new AppError('Purchase order not found', 404);
            }

            for (const receivedItem of receivedItems) {
                const poItem = po.items.find(
                    item => {
                        const dbProductId = (item.productId as any)._id
                            ? (item.productId as any)._id.toString()
                            : item.productId.toString();

                        const pidMatch = dbProductId === receivedItem.productId;
                        const skuMatch = item.variantSku === receivedItem.variantSku;

                        return pidMatch && skuMatch;
                    }
                );

                if (!poItem) {
                    throw new AppError('Item not found in PO', 404);
                }

                const remainingToReceive = poItem.orderedQuantity - poItem.receivedQuantity;
                if (receivedItem.quantity > remainingToReceive) {
                    throw new AppError('Cannot receive more than ordered quantity', 400);
                }

                poItem.receivedQuantity += receivedItem.quantity;

                const product = await this.productRepo.findById(receivedItem.productId, tenantId, session);
                if (!product) {
                    throw new AppError('Product not found', 404);
                }

                const variant = product.variants.find(v => v.sku === receivedItem.variantSku);
                if (!variant) {
                    throw new AppError('Variant not found', 404);
                }

                variant.stock += receivedItem.quantity;
                await product.save({ session });

                await this.stockMovementRepo.create({
                    tenantId,
                    productId: product._id,
                    variantSku: receivedItem.variantSku,
                    type: MovementType.PURCHASE,
                    quantity: receivedItem.quantity,
                    userId,
                    reference: `PO ${po.poNumber}`
                } as any, session);

                emitToTenant(tenantId, 'stock_movement', {
                    productId: product._id,
                    productName: product.name,
                    variantSku: receivedItem.variantSku,
                    quantity: receivedItem.quantity,
                    type: MovementType.PURCHASE,
                    timestamp: new Date()
                });
            }

            const allReceived = po.items.every(item => item.receivedQuantity === item.orderedQuantity);
            if (allReceived) {
                po.status = POStatus.RECEIVED;
                po.actualDeliveryDate = new Date();
            }

            po.updatedAt = new Date();
            await po.save({ session });

            return po;
        });
    }
}
