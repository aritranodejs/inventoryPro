import { StockMovementRepository } from '../repositories/stockMovement.repository';
import { IStockMovement } from '../models/StockMovement';

export class StockMovementService {
    private stockMovementRepo: StockMovementRepository;

    constructor() {
        this.stockMovementRepo = new StockMovementRepository();
    }

    async getStockMovements(
        tenantId: string,
        pagination: { page: number; limit: number },
        type?: string
    ) {
        return await this.stockMovementRepo.findByTenant(tenantId, pagination, type);
    }

    async getProductMovements(productId: string, tenantId: string) {
        return await this.stockMovementRepo.findByProduct(productId, tenantId);
    }

    async getMovementStats(tenantId: string, days: number = 7) {
        return await this.stockMovementRepo.getStockMovementData(tenantId, days);
    }
}
