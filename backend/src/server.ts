import './config/loadEnv';
import express, { Application } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { initializeSocket } from './socket';
import { swaggerSpec } from './config/swagger';

import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import supplierRoutes from './routes/supplier.routes';
import purchaseOrderRoutes from './routes/purchaseOrder.routes';
import dashboardRoutes from './routes/dashboard.routes';
import stockMovementRoutes from './routes/stockMovement.routes';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(helmet());
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:3000',
        'https://inventory-pro-rho.vercel.app'
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Inventory API Documentation'
}));

app.use('/api/auth', limiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stock-movements', stockMovementRoutes);

app.use(errorHandler);

export const io = initializeSocket(httpServer);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDatabase();

        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
