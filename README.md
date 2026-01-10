# 📦 Multi-Tenant Inventory Management System (InventoryPro)

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://inventory-pro-rho.vercel.app)
[![API Status](https://img.shields.io/badge/API-Status-blue)](https://inventorypro-h4pv.onrender.com/health)

A production-ready SaaS platform for managing inventory, suppliers, and orders across multiple businesses with complete data isolation, real-time synchronization, and high-performance caching.

### 📚 Quick Links
- [**System Overview & Guide**](./SYSTEM_GUIDE.md) — Start here to understand the business logic and user flows.
- [**Architecture Documentation**](./ARCHITECTURE.md) — Technical deep-dive into multi-tenancy and data modeling.
- [**API Documentation**](https://inventorypro-h4pv.onrender.com/api-docs) — Full Swagger documentation.


## 🚀 Features

- **Multi-Tenant Architecture**: Secure row-level data isolation with tenant-scoped queries
- **Complex Inventory**: Product variants (Size/Color/etc.) with independent stock tracking per SKU
- **Smart Low-Stock Alerts**: Excludes items with pending Purchase Orders from alerts
- **Order Management**: Concurrent order handling with MongoDB Transactions
- **Real-time Sync**: Socket.io integration for live dual-way updates across all browsers
- **Analytics Dashboard**: Inventory value, top sellers, and live stock movement charts
- **Role-Based Access**: Granular Owner/Manager/Staff permissions
- **Performance Caching**: Redis integration for lightning-fast dashboard and listings

## 📋 Prerequisites

- **Node.js**: v16 or higher
- **MongoDB**: v5.0+ (local or MongoDB Atlas)
- **Redis**: v6.0+ (for caching and session management)
- **npm**: v7 or higher

## 🛠️ Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

### 2. Frontend Setup
```bash
cd ../frontend
npm install
copy .env.example .env
npm run dev
```

## 🛡️ Role-Based Access Control (RBAC)

The system enforces strict permission levels for data security and operational integrity:

| Feature | Owner | Manager | Staff |
|---------|:-----:|:-------:|:-----:|
| **Manage Suppliers** | ✅ | ✅ | ❌ |
| **Create/Edit Products** | ✅ | ✅ | ❌ |
| **Delete Products/Suppliers** | ✅ | ❌ | ❌ |
| **Manage Purchase Orders** | ✅ | ✅ | ❌ |
| **View Financials/Stock** | ✅ | ✅ | ❌ |
| **View Products** | ✅ | ✅ | ✅ |
| **Create Sales Orders** | ✅ | ✅ | ✅ |
| **Fulfill/Cancel Orders** | ✅ | ✅ | ❌ |

## 🔐 Test Credentials

### Tenant 1: TechBazar Kolkata
| Role | Email | Password |
|------|-------|----------|
| Owner | owner@techbazarkol.com | password@123 |
| Manager | manager@techbazarkol.com | password@123 |
| Staff | staff@techbazarkol.com | password@123 |

### Tenant 2: FashionHub Kolkata
| Role | Email | Password |
|------|-------|----------|
| Owner | owner@fashionhubkol.com | password@123 |
| Manager | manager@fashionhubkol.com | password@123 |

## 📊 Technology Stack

- **Frontend**: React 19, TypeScript, RTK Query, TailwindCSS, Socket.io-client
- **Backend**: Node.js, Express, TypeScript, MongoDB, Mongoose, Redis, Socket.io

## 🌐 Live Deployment

- **Frontend**: [https://inventory-pro-rho.vercel.app](https://inventory-pro-rho.vercel.app)
- **Backend API**: [https://inventorypro-h4pv.onrender.com](https://inventorypro-h4pv.onrender.com)
- **Database**: [MongoDB Atlas](https://www.mongodb.com)
- **Cache**: [Redis.io](https://redis.io)

## 📝 API Documentation

Swagger docs available at: https://inventorypro-h4pv.onrender.com/api-docs

## 🛡️ License

This project is submitted as part of a technical assignment.

## 👤 Author

Created with ❤️ by **Aritra Dutta**

---

For technical deep-dives and business logic, see [ARCHITECTURE.md](./ARCHITECTURE.md) and [SYSTEM_GUIDE.md](./SYSTEM_GUIDE.md).
