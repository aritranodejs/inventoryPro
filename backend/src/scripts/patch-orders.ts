import '../config/loadEnv';
import { connectDatabase } from '../config/database';
import Order from '../models/Order';
import { OrderStatus } from '../types';
import mongoose from 'mongoose';

const patchOrders = async () => {
    try {
        await connectDatabase();
        console.log('Connected to database. Patching orders...');

        const result = await Order.updateMany(
            { status: OrderStatus.CONFIRMED },
            { $set: { 'items.$[].fulfilledQuantity': 0 } }
        );

        console.log(`Updated ${result.modifiedCount} orders.`);
        process.exit(0);
    } catch (error) {
        console.error('Error patching orders:', error);
        process.exit(1);
    }
};

patchOrders();
