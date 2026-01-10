import { ProductRepository } from '../repositories/product.repository';
import { OrderRepository } from '../repositories/order.repository';
import { StockMovementRepository } from '../repositories/stockMovement.repository';
import { PurchaseOrderRepository } from '../repositories/purchaseOrder.repository';

export class DashboardService {
    private productRepo: ProductRepository;
    private orderRepo: OrderRepository;
    private stockMovementRepo: StockMovementRepository;
    private poRepo: PurchaseOrderRepository;

    constructor() {
        this.productRepo = new ProductRepository();
        this.orderRepo = new OrderRepository();
        this.stockMovementRepo = new StockMovementRepository();
        this.poRepo = new PurchaseOrderRepository();
    }

    async getDashboardStats(tenantId: string) {
        const products = await this.productRepo.findAllByTenant(tenantId);

        const pendingPOs = await this.poRepo.findPending(tenantId);

        const replenishingSkus = new Set<string>();
        pendingPOs.forEach((po) => {
            po.items.forEach((item) => {
                replenishingSkus.add(item.variantSku);
            });
        });

        let totalInventoryValue = 0;
        let lowStockCount = 0;

        products.forEach(product => {
            product.variants.forEach(variant => {
                totalInventoryValue += variant.stock * variant.price;
                if (variant.stock < product.lowStockThreshold && !replenishingSkus.has(variant.sku)) {
                    lowStockCount++;
                }
            });
        });

        const pendingPOCount = pendingPOs.length;

        return {
            inventoryValue: Math.round(totalInventoryValue * 100) / 100,
            lowStockCount,
            totalProducts: products.length,
            pendingPOCount
        };
    }

    async getTopSellers(tenantId: string, days: number = 30, limit: number = 5) {
        return await this.orderRepo.getTopSellers(tenantId, days, limit);
    }

    async getStockMovementData(tenantId: string, days: number = 7) {
        return await this.stockMovementRepo.getStockMovementData(tenantId, days);
    }
}
