import { Server as SocketServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

let ioInstance: SocketServer | null = null;

export const initializeSocket = (httpServer: HTTPServer) => {
    const io = new SocketServer(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            credentials: true
        }
    });

    io.use((socket: any, next: (err?: Error) => void) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            socket.data.userId = decoded.userId;
            socket.data.tenantId = decoded.tenantId;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
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
