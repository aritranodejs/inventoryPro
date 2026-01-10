import { Server as SocketServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

let ioInstance: SocketServer | null = null;

export const initializeSocket = (httpServer: HTTPServer) => {
    const io = new SocketServer(httpServer, {
        cors: {
            origin: (origin, callback) => {
                const allowedOrigins = [
                    process.env.FRONTEND_URL,
                    'http://localhost:5173',
                    'http://localhost:3000',
                    'http://localhost:3001',
                    'https://inventory-pro-rho.vercel.app'
                ];
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    console.warn(`Socket connection rejected from unauthorized origin: ${origin}`);
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true
        }
    });

    io.use((socket: any, next: (err?: Error) => void) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            console.log('Validating socket token...');
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            socket.data.userId = decoded.userId;
            socket.data.tenantId = decoded.tenantId;
            console.log(`Socket authenticated for tenant: ${decoded.tenantId}`);
            next();
        } catch (error) {
            console.error('Socket authentication failed:', error);
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        const tenantId = socket.data.tenantId;
        if (tenantId) {
            socket.join(`tenant:${tenantId}`);
            console.log(`Socket ${socket.id} joined room tenant:${tenantId}`);
        }
    });

    ioInstance = io;
    return io;
};

export const getIO = (): SocketServer => {
    if (!ioInstance) {
        throw new Error('Socket.io not initialized');
    }
    return ioInstance;
};

export const emitToTenant = (tenantId: string, event: string, data: any) => {
    if (ioInstance) {
        ioInstance.to(`tenant:${tenantId}`).emit(event, data);
    }
};
