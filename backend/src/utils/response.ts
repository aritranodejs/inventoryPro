import { Response } from 'express';

interface PaginationData {
    page: number;
    limit: number;
    total: number;
}

interface SuccessResponse {
    success: true;
    message?: string;
    data?: any;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

interface ErrorResponse {
    success: false;
    message: string;
    errors?: any;
}

export class ResponseHelper {
    static success(
        res: Response,
        data?: any,
        messageOrPagination?: string | PaginationData,
        statusCode: number = 200
    ): Response {
        const response: SuccessResponse = {
            success: true
        };

        if (typeof messageOrPagination === 'string') {
            response.message = messageOrPagination;
            response.data = data;
        } else if (messageOrPagination && typeof messageOrPagination === 'object') {
            response.data = data;
            response.pagination = {
                page: messageOrPagination.page,
                limit: messageOrPagination.limit,
                total: messageOrPagination.total,
                pages: Math.ceil(messageOrPagination.total / messageOrPagination.limit)
            };
        } else {
            if (data) response.data = data;
        }

        return res.status(statusCode).json(response);
    }

    static created(res: Response, data?: any, message?: string): Response {
        return this.success(res, data, message, 201);
    }

    static error(
        res: Response,
        message: string,
        statusCode: number = 500,
        errors?: any
    ): Response {
        const response: ErrorResponse = {
            success: false,
            message,
            ...(errors && { errors })
        };
        return res.status(statusCode).json(response);
    }

    static badRequest(res: Response, message: string, errors?: any): Response {
        return this.error(res, message, 400, errors);
    }

    static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
        return this.error(res, message, 401);
    }

    static forbidden(res: Response, message: string = 'Forbidden'): Response {
        return this.error(res, message, 403);
    }

    static notFound(res: Response, message: string = 'Resource not found'): Response {
        return this.error(res, message, 404);
    }

    static conflict(res: Response, message: string): Response {
        return this.error(res, message, 409);
    }

    static internalError(
        res: Response,
        message: string = 'Internal server error'
    ): Response {
        return this.error(res, message, 500);
    }
}
