import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Tenant from '../models/Tenant';
import User from '../models/User';
import Product from '../models/Product';
import Supplier from '../models/Supplier';
import PurchaseOrder from '../models/PurchaseOrder';
import Order from '../models/Order';
import StockMovement from '../models/StockMovement';
import { UserRole, POStatus, OrderStatus, MovementType } from '../types';
import mongoose from 'mongoose';

dotenv.config();

const seedDatabase = async () => {
    try {
        await connectDatabase();

        console.log('Clearing existing data...');
        await Promise.all([
            Tenant.deleteMany({}),
            User.deleteMany({}),
            Product.deleteMany({}),
            Supplier.deleteMany({}),
            PurchaseOrder.deleteMany({}),
            Order.deleteMany({}),
            StockMovement.deleteMany({})
        ]);

        console.log('Creating Tenant 1: TechBazar Kolkata...');
        const tenant1 = await Tenant.create({
            companyName: 'TechBazar Kolkata',
            email: 'contact@techbazarkol.com',
            phone: '+919876543210',
            address: '15 Park Street, Kolkata, West Bengal 700016'
        });

        console.log('Creating Tenant 2: FashionHub Kolkata...');
        const tenant2 = await Tenant.create({
            companyName: 'FashionHub Kolkata',
            email: 'info@fashionhubkol.com',
            phone: '+918765432109',
            address: '22/A Gariahat Road, Kolkata, West Bengal 700029'
        });

        console.log('Creating users for TechBazar...');
        const techOwner = await User.create({
            tenantId: tenant1._id,
            name: 'Amit Roy',
            email: 'owner@techbazarkol.com',
            password: 'password123',
            role: UserRole.OWNER
        });

        const techManager = await User.create({
            tenantId: tenant1._id,
            name: 'Rahul Sen',
            email: 'manager@techbazarkol.com',
            password: 'password123',
            role: UserRole.MANAGER
        });

        const techStaff = await User.create({
            tenantId: tenant1._id,
            name: 'Priya Das',
            email: 'staff@techbazarkol.com',
            password: 'password123',
            role: UserRole.STAFF
        });

        console.log('Creating users for FashionHub...');
        const fashionOwner = await User.create({
            tenantId: tenant2._id,
            name: 'Suma Gupta',
            email: 'owner@fashionhubkol.com',
            password: 'password123',
            role: UserRole.OWNER
        });

        const fashionManager = await User.create({
            tenantId: tenant2._id,
            name: 'Vikram Singh',
            email: 'manager@fashionhubkol.com',
            password: 'password123',
            role: UserRole.MANAGER
        });

        console.log('Creating products for TechBazar...');
        const laptop = await Product.create({
            tenantId: tenant1._id,
            name: 'HP Pavilion Laptop',
            description: 'High-performance laptop for students and professionals',
            category: 'Electronics',
            variants: [
                { sku: 'HP-I5-8GB', attributes: { Processor: 'i5', RAM: '8GB' }, price: 55000, stock: 15 },
                { sku: 'HP-I7-16GB', attributes: { Processor: 'i7', RAM: '16GB' }, price: 75000, stock: 8 },
                { sku: 'HP-RYZEN-16GB', attributes: { Processor: 'Ryzen 7', RAM: '16GB' }, price: 72000, stock: 3 }
            ],
            lowStockThreshold: 5
        });

        const mouse = await Product.create({
            tenantId: tenant1._id,
            name: 'Logitech Wireless Mouse',
            description: 'Ergonomic wireless mouse',
            category: 'Accessories',
            variants: [
                { sku: 'LOGI-M220-BLK', attributes: { Color: 'Black' }, price: 899, stock: 50 },
                { sku: 'LOGI-M220-RED', attributes: { Color: 'Red' }, price: 899, stock: 45 }
            ],
            lowStockThreshold: 20
        });

        console.log('Creating products for FashionHub...');
        const tshirt = await Product.create({
            tenantId: tenant2._id,
            name: 'Classic Cotton T-Shirt',
            description: 'Premium quality cotton t-shirt for daily wear',
            category: 'Clothing',
            variants: [
                // Small
                { sku: 'TSHIRT-S-RED', attributes: { Size: 'S', Color: 'Red' }, price: 499, stock: 20 },
                { sku: 'TSHIRT-S-BLUE', attributes: { Size: 'S', Color: 'Blue' }, price: 499, stock: 15 },
                { sku: 'TSHIRT-S-GRN', attributes: { Size: 'S', Color: 'Green' }, price: 499, stock: 10 },
                // Medium
                { sku: 'TSHIRT-M-RED', attributes: { Size: 'M', Color: 'Red' }, price: 499, stock: 25 },
                { sku: 'TSHIRT-M-BLUE', attributes: { Size: 'M', Color: 'Blue' }, price: 499, stock: 30 },
                { sku: 'TSHIRT-M-GRN', attributes: { Size: 'M', Color: 'Green' }, price: 499, stock: 12 },
                // Large
                { sku: 'TSHIRT-L-RED', attributes: { Size: 'L', Color: 'Red' }, price: 549, stock: 18 },
                { sku: 'TSHIRT-L-BLUE', attributes: { Size: 'L', Color: 'Blue' }, price: 549, stock: 22 },
                { sku: 'TSHIRT-L-GRN', attributes: { Size: 'L', Color: 'Green' }, price: 549, stock: 8 }
            ],
            lowStockThreshold: 15
        });

        console.log('Creating suppliers for TechBazar...');
        const techSupplier = await Supplier.create({
            tenantId: tenant1._id,
            name: 'Chandni Market Electronics',
            email: 'sales@chandnielec.com',
            phone: '+913322114455',
            address: 'Chandni Chowk, Kolkata',
            paymentTerms: 'Net 30',
            rating: 4.5
        });

        console.log('Creating suppliers for FashionHub...');
        const fabricSupplier = await Supplier.create({
            tenantId: tenant2._id,
            name: 'Kolkata Textiles Ltd',
            email: 'orders@kolkatatex.com',
            phone: '+913366778899',
            address: 'New Market, Kolkata',
            paymentTerms: 'Net 15',
            rating: 4.8
        });

        console.log('Creating purchase orders...');
        const po1 = await PurchaseOrder.create({
            tenantId: tenant2._id,
            supplierId: fabricSupplier._id,
            poNumber: 'PO-000001',
            status: POStatus.CONFIRMED,
            items: [
                {
                    productId: tshirt._id,
                    variantSku: 'TSHIRT-M-GRN',
                    orderedQuantity: 20,
                    receivedQuantity: 0,
                    price: 400
                },
                {
                    productId: tshirt._id,
                    variantSku: 'TSHIRT-L-BLUE',
                    orderedQuantity: 15,
                    receivedQuantity: 0,
                    price: 450
                }
            ],
            expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            totalAmount: 14750,
            createdBy: fashionOwner._id
        });

        console.log('Creating sample orders for TechBazar...');
        const order1 = await Order.create({
            tenantId: tenant1._id,
            orderNumber: 'ORD-000001',
            status: OrderStatus.FULFILLED,
            items: [
                {
                    productId: laptop._id,
                    variantSku: 'HP-I7-16GB',
                    quantity: 2,
                    price: 75000,
                    fulfilledQuantity: 2
                }
            ],
            totalAmount: 150000,
            customerName: 'Anjali Sharma',
            customerEmail: 'anjali@example.com',
            createdBy: techManager._id,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        });

        const order2 = await Order.create({
            tenantId: tenant1._id,
            orderNumber: 'ORD-000002',
            status: OrderStatus.FULFILLED,
            items: [
                {
                    productId: mouse._id,
                    variantSku: 'LOGI-M220-BLK',
                    quantity: 10,
                    price: 899,
                    fulfilledQuantity: 10
                }
            ],
            totalAmount: 8990,
            customerName: 'Rohit Verma',
            customerEmail: 'rohit@example.com',
            createdBy: techStaff._id,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        });

        console.log('Creating stock movements...');
        await StockMovement.create([
            {
                tenantId: tenant1._id,
                productId: laptop._id,
                variantSku: 'HP-I7-16GB',
                type: MovementType.SALE,
                quantity: -2,
                userId: techManager._id,
                reference: 'ORD-000001',
                createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
            },
            {
                tenantId: tenant1._id,
                productId: mouse._id,
                variantSku: 'LOGI-M220-BLK',
                type: MovementType.SALE,
                quantity: -10,
                userId: techStaff._id,
                reference: 'ORD-000002',
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
            },
            {
                tenantId: tenant1._id,
                productId: laptop._id,
                variantSku: 'HP-RYZEN-16GB',
                type: MovementType.PURCHASE,
                quantity: 5,
                userId: techOwner._id,
                reference: 'Initial Stock',
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            }
        ]);

        console.log('\n=== SEED DATA COMPLETED ===\n');
        console.log('Test Credentials:\n');
        console.log('TENANT 1: TechBazar Kolkata');
        console.log('  Owner:   owner@techbazarkol.com / password@123');
        console.log('  Manager: manager@techbazarkol.com / password@123');
        console.log('  Staff:   staff@techbazarkol.com / password@123\n');
        console.log('TENANT 2: FashionHub Kolkata');
        console.log('  Owner:   owner@fashionhubkol.com / password@123');
        console.log('  Manager: manager@fashionhubkol.com / password@123\n');
        console.log('Data Summary:');
        console.log(`- ${await Tenant.countDocuments()} Tenants`);
        console.log(`- ${await User.countDocuments()} Users`);
        console.log(`- ${await Product.countDocuments()} Products`);
        console.log(`- ${await Supplier.countDocuments()} Suppliers`);
        console.log(`- ${await PurchaseOrder.countDocuments()} Purchase Orders`);
        console.log(`- ${await Order.countDocuments()} Orders`);
        console.log(`- ${await StockMovement.countDocuments()} Stock Movements\n`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
