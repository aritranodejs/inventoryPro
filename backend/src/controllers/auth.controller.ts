import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../types';
import { ResponseHelper } from '../utils/response';
import redisClient from '../config/redis';


export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    private parseDuration(duration: string): number {
        if (!duration) return 86400; // default 24h

        const unit = duration.slice(-1);
        const value = parseInt(duration.slice(0, -1));

        if (isNaN(value)) return 86400;

        switch (unit) {
            case 'd': return value * 24 * 60 * 60;
            case 'h': return value * 60 * 60;
            case 'm': return value * 60;
            case 's': return value;
            default: return 86400;
        }
    }


    register = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const result = await this.authService.register(req.body);
            return ResponseHelper.created(res, result, 'Registration successful');
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };

    login = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const { email, password } = req.body;
            const result = await this.authService.login(email, password);
            return ResponseHelper.success(res, result, 'Login successful');
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };

    logout = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (token) {
                if (token) {
                    const expiry = this.parseDuration(process.env.JWT_EXPIRE || '24h');
                    await redisClient.setex(`blacklist:${token}`, expiry, 'true');
                }
            }
            return ResponseHelper.success(res, null, 'Logged out successfully');
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };


    inviteUser = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const tenantId = req.user!.tenantId;
            const result = await this.authService.inviteUser(tenantId, req.body);
            return ResponseHelper.created(res, { user: result }, 'User invited successfully');
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };

    getCurrentUser = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const userId = req.user!.userId;
            const result = await this.authService.getCurrentUser(userId);
            return ResponseHelper.success(res, { user: result });
        } catch (error: any) {
            return ResponseHelper.error(res, error.message, error.statusCode || 500);
        }
    };
}
