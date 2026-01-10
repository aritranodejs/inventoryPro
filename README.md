# Multi-Tenant Inventory Management System

A production-ready SaaS platform for managing inventory, suppliers, and orders across multiple businesses with complete data isolation.

## 🚀 Features

- **Multi-Tenant Architecture**: Secure row-level data isolation with tenant-scoped queries
- **Complex Inventory**: Product variants (Size/Color/etc.) with independent stock tracking per SKU
- **Smart Low-Stock Alerts**: Excludes items with pending Purchase Orders from alerts
- **Order Management**: Concurrent order handling with race condition prevention
- **Real-time Updates**: Socket.io integration for live inventory notifications
- **Analytics Dashboard**: Inventory value, top sellers, stock movement charts
- **Role-Based Access**: Owner/Manager/Staff permissions

## 📋 Prerequisites

- **Node.js**: v16 or higher
- **MongoDB**: v5.0+ (local or MongoDB Atlas)
- **Redis**: v6.0+ (for caching and session management)
- **npm**: v7 or higher

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd inventoryPro
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Update MongoDB URI in .env if needed
# Default: mongodb://localhost:27017/inventory-management

# Seed the database with demo data
npm run seed

# Start the backend server
npm run dev
```

**Backend runs on**: http://localhost:5000

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file (optional, defaults to localhost:5000)
copy .env.example .env

# Start the frontend dev server
npm run dev
```

**Frontend runs on**: http://localhost:5173

### 4. Access the Application

Open http://localhost:5173 and log in with any of the test credentials below.

## 🔐 Test Credentials

### Tenant 1: TechBazar Kolkata
| Role | Email | Password |
|------|-------|----------|
| Owner | owner@techbazarkol.com | password@123 |
| Manager | manager@techbazarkol.com | password@123 |
| Staff | staff@techbazarkol.com | password@123 |

**Inventory**: Electronics (Laptops, Mice)

### Tenant 2: FashionHub Kolkata
| Role | Email | Password |
|------|-------|----------|
| Owner | owner@fashionhubkol.com | password@123 |
| Manager | manager@fashionhubkol.com | password@123 |

**Inventory**: Clothing (T-Shirts with 9 variants)

## 🛡️ Role-Based Access Control (RBAC)

| Feature | Owner | Manager | Staff |
|---------|:-----:|:-------:|:-----:|
| **Manage Suppliers** | ✅ | ✅ | ❌ |
| **Create/Edit Products** | ✅ | ✅ | ❌ |
| **Create Purchase Orders** | ✅ | ✅ | ❌ |
| **View Financials** | ✅ | ✅ | ❌ |
| **View Products** | ✅ | ✅ | ✅ |
| **Create Sales Orders** | ✅ | ✅ | ✅ |
| **Fulfill Orders** | ✅ | ✅ | ✅ |

*Note: Data is strictly isolated. Users can only access resources belonging to their specific Tenant. "Tenant Settings" and "Invite Users" features are available via API but not yet exposed in the UI.*

## 📂 Project Structure

```
tech-exactly-assignment/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Mongoose schemas
│   │   ├── repositories/   # Data access layer
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth, error handling
│   │   ├── scripts/        # Seed script
│   │   └── server.ts       # Entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── features/       # Redux slices
│   │   ├── services/       # RTK Query APIs
│   │   └── App.tsx
│   ├── .env.example
│   └── package.json
├── ARCHITECTURE.md         # Technical decisions
└── README.md
```

## 🏗️ Architecture Decisions

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed explanations of:
- Multi-tenancy approach (Row-level isolation with discriminator keys)
- Data modeling for product variants
- Race condition prevention strategies
- Performance optimizations with MongoDB indexing
- Scalability considerations

## 🧪 Testing the Application

### 1. Test Multi-Tenancy
1. Log in as `owner@techbazarkol.com`
2. View inventory - should see only TechBazar products
3. Log out and log in as `owner@fashionhubkol.com`
4. View inventory - should see only FashionHub products
5. **Verify**: Complete data isolation between tenants

### 2. Test Smart Low-Stock Alerts
1. Log in to FashionHub
2. Go to Products → "Classic Cotton T-Shirt" 
3. Variant `TSHIRT-M-GRN` has stock=12, threshold=15 (should be low stock)
4. Go to Purchase Orders → PO-000001 includes this variant
5. Check Dashboard "Low Stock Items"
6. **Verify**: Count should exclude `TSHIRT-M-GRN` (smart alert working)

### 3. Test Product Variants
1. Navigate to Products
2. Click any product to view details
3. **Verify**: Each variant (SKU) has independent stock, price, and attributes

### 4. Test Concurrent Orders
1. Open application in two browsers/incognito windows
2. Log in as the same user in both
3. Both try to order the last unit of a product simultaneously
4. **Verify**: One succeeds, other gets "Insufficient stock" error

## 🚀 Production Build

### Backend
```bash
cd backend
npm run build
node dist/server.js
```

### Frontend
```bash
cd frontend
npm run build
# Serve the dist/ folder with any static server
```

## 🔑 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/inventory-management
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=24h
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 📊 Technology Stack

**Frontend**:
- React 19 + TypeScript
- Redux Toolkit + RTK Query
- React Router v7
- Chart.js (react-chartjs-2)
- TailwindCSS utility classes
- Socket.io-client

**Backend**:
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT authentication
- Socket.io
- Helmet (security)
- CORS

## ⚡ Performance Features

- **Indexed Queries**: All tenant and SKU lookups use compound indexes
- **Aggregation Pipeline**: Dashboard analytics computed server-side
- **Optimistic Updates**: RTK Query cache invalidation strategies
- **Lazy Loading**: Code splitting for faster initial page load

## 📝 API Documentation

Swagger docs available at: http://localhost:5000/api-docs (when backend is running)

## 🐛 Known Limitations

- Dashboard loads <2s with moderate data; Redis caching recommended for 10k+ products
- Real-time Socket.io alerts implemented but not fully integrated in UI notifications
- Limited to 100 pending POs per tenant in smart alert calculation (can be increased)

## 🔮 Future Enhancements

1. **Redis caching** for dashboard stats
2. **Unit & integration tests** (Jest, Supertest, React Testing Library)
3. **CSV export** for orders and inventory reports
4. **Email notifications** for critical alerts
5. **Mobile app** with React Native
6. **Multi-currency support**

## 📄 License

This project is submitted as part of a technical assignment.

## 👤 Author

Created with ❤️ by **Aritra Dutta** for the MERN Stack Developer position

---

For architecture decisions and detailed implementation notes, see [ARCHITECTURE.md](./ARCHITECTURE.md).
