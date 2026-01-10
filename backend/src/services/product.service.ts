import { ProductRepository } from '../repositories/product.repository';
import { PurchaseOrderRepository } from '../repositories/purchaseOrder.repository';
import { AppError } from '../middleware/errorHandler';

export class ProductService {
    private productRepo: ProductRepository;
    private poRepo: PurchaseOrderRepository;

    constructor() {
        this.productRepo = new ProductRepository();
        this.poRepo = new PurchaseOrderRepository();
    }

    async createProduct(tenantId: string, data: any) {
        return await this.productRepo.create({
            tenantId,
            ...data,
            lowStockThreshold: data.lowStockThreshold || 10
        } as any);
    }

    async getProducts(
        tenantId: string,
        filters: { search?: string; category?: string },
        pagination: { page: number; limit: number }
    ) {
        return await this.productRepo.findAll(tenantId, filters, pagination);
    }

    async getProductById(id: string, tenantId: string) {
        const product = await this.productRepo.findById(id, tenantId);
        if (!product) {
            throw new AppError('Product not found', 404);
        }
        return product;
    }

    async updateProduct(id: string, tenantId: string, data: any) {
        const product = await this.productRepo.update(id, tenantId, data);
        if (!product) {
            throw new AppError('Product not found', 404);
        }
        return product;
    }

    async deleteProduct(id: string, tenantId: string) {
        const product = await this.productRepo.delete(id, tenantId);
        if (!product) {
            throw new AppError('Product not found', 404);
        }
        return product;
    }

    async getLowStockProducts(tenantId: string) {
        const products = await this.productRepo.findAllByTenant(tenantId);
        const pendingPOs = await this.poRepo.findPending(tenantId);

        const poQuantities = new Map<string, number>();
        pendingPOs.forEach(po => {
            po.items.forEach(item => {
                const key = `${item.productId}_${item.variantSku}`;
                const pending = item.orderedQuantity - item.receivedQuantity;
                poQuantities.set(key, (poQuantities.get(key) || 0) + pending);
            });
        });

        const lowStockItems: any[] = [];

        products.forEach(product => {
            product.variants.forEach(variant => {
                const key = `${product._id}_${variant.sku}`;
                const pendingQuantity = poQuantities.get(key) || 0;
                const effectiveStock = variant.stock + pendingQuantity;

                if (variant.stock < product.lowStockThreshold && effectiveStock < product.lowStockThreshold) {
                    lowStockItems.push({
                        productId: product._id,
                        productName: product.name,
                        sku: variant.sku,
                        attributes: variant.attributes,
                        currentStock: variant.stock,
                        pendingPO: pendingQuantity,
                        effectiveStock,
                        threshold: product.lowStockThreshold
                    });
                }
            });
        });

        return lowStockItems;
    }
}
