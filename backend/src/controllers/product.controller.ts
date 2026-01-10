import { Response } from 'express';
import { ProductService } from '../services/product.service';
import { AuthRequest } from '../types';
import { ResponseHelper } from '../utils/response';
import redisClient from '../config/redis';


export class ProductController {
    private productService: ProductService;

    constructor() {
        this.productService = new ProductService();
    }

    createProduct = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const tenantId = req.user!.tenantId;
            const product = await this.productService.createProduct(tenantId, req.body);
            const keys = await redisClient.keys(`products:${tenantId}:*`);
            if (keys.length > 0) await redisClient.del(keys);
            return ResponseHelper.created(res, product, 'Product created successfully');
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };

    getProducts = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const tenantId = req.user!.tenantId;
            const { page = 1, limit = 10, search, category } = req.query;

            const filters = {
                search: search as string,
                category: category as string
            };

            const pagination = {
                page: Number(page),
                limit: Number(limit)
            };

            const cacheKey = `products:${tenantId}:${JSON.stringify(filters)}:${JSON.stringify(pagination)}`;
            const cachedData = await redisClient.get(cacheKey);

            if (cachedData) {
                const parsedData = JSON.parse(cachedData);
                return ResponseHelper.success(res, parsedData.products, {
                    page: pagination.page,
                    limit: pagination.limit,
                    total: parsedData.total
                });
            }

            const { products, total } = await this.productService.getProducts(tenantId, filters, pagination);

            // Cache for 5 minutes
            await redisClient.setex(cacheKey, 300, JSON.stringify({ products, total }));

            return ResponseHelper.success(
                res,
                products,
                { page: pagination.page, limit: pagination.limit, total }
            );
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };

    getProductById = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const tenantId = req.user!.tenantId;
            const product = await this.productService.getProductById(id, tenantId);
            return ResponseHelper.success(res, product);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };

    updateProduct = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const tenantId = req.user!.tenantId;
            const product = await this.productService.updateProduct(id, tenantId, req.body);
            const keys = await redisClient.keys(`products:${tenantId}:*`);
            if (keys.length > 0) await redisClient.del(keys);

            return ResponseHelper.success(res, product, 'Product updated successfully');
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };

    deleteProduct = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const tenantId = req.user!.tenantId;
            await this.productService.deleteProduct(id, tenantId);
            const keys = await redisClient.keys(`products:${tenantId}:*`);
            if (keys.length > 0) await redisClient.del(keys);

            return ResponseHelper.success(res, null, 'Product deleted successfully');
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };

    getLowStockProducts = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const tenantId = req.user!.tenantId;
            const lowStockItems = await this.productService.getLowStockProducts(tenantId);
            return ResponseHelper.success(res, lowStockItems);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };
}
