# 📦 System Overview & User Guide

Welcome to the **Multi-Tenant Inventory Management System**. This guide explains the purpose of the application, how the business logic flows, and how the different components work together to provide a seamless real-time experience.

---

## 1. Purpose of the System
The system is designed for **SaaS (Software as a Service)**, allowing multiple independent businesses (tenants) to manage their inventory, suppliers, and orders in total isolation. It handles the complexity of product variants, real-time stock tracking, and smart replenishment alerts.

---

## 2. Core Entities
- **Tenant**: A business entity. Each tenant has isolated data (products, orders, users).
- **Users**: Individuals within a tenant, assigned specific **Roles** (Owner, Manager, Staff).
- **Products & Variants**: Items for sale, supporting multiple variations (e.g., Size, Color) each with its own tracking SKU.
- **Suppliers**: External vendors from whom inventory is purchased.
- **Purchase Orders (PO)**: Documenting inventory requests from suppliers.
- **Sales Orders**: Customer orders representing inventory leaving the system.
- **Stock Movements**: A detailed audit trail of every single unit that moves in or out of the system.

---

## 3. Key Navigation Features
To handle large datasets efficiently, the system includes:
- **Global Search**: Instantly find products by name/SKU, or orders by reference number and supplier.
- **Efficient Pagination**: Large lists are broken down into pages (10 items per page) to ensure fast loading and easy navigation.
- **Responsive Design**: The entire interface is optimized for mobile, tablet, and desktop viewports. On small screens, table filters and action buttons automatically adapt for touch-friendly use.

---

## 3. Roles and Permissions
The system enforces strict **Role-Based Access Control (RBAC)**:
- 👑 **Owner**: Full control. Can manage all resources, delete products, and view financial stats.
- 🛠️ **Manager**: Operational leader. Can create products, manage suppliers, fulfill orders, and receive POs.
- 📋 **Staff**: Focused on sales. Can create new sales orders and view products, but cannot perform deletions or manage suppliers/POs.

---

## 4. Operational Workflows

### 🏎️ Onboarding Flow
1. **Registration**: A new business registers, creating a unique `Tenant ID`.
2. **Initial Setup**: The owner creates the first set of products and invites team members.

### 📦 Inventory Flow
- **Product Creation**: Products are created with multiple variants. Each variant is assigned an SKU and a price.
- **Low Stock Threshold**: Each product has an "Alert Level." When stock falls below this level, the system triggers a real-time notification.

### 🚚 Supply Chain Flow (Incoming Stock)
1. **Draft PO**: A manager creates a PO for a supplier.
2. **Confirmation**: Once sent to the supplier, the PO is marked as "Sent."
3. **Receipt**: When items arrive, they are "Received" in the system.
   - **Partial Receipts**: Items can be received in batches if the supplier sends multiple shipments.
   - **Auto-Sync**: Upon receipt, the variant stock increases automatically, and a "Stock Movement" is recorded.

### 💰 Sales Flow (Outgoing Stock)
1. **New Order**: Staff or Managers create a new sales order with specific items.
2. **Fulfillment**: Once the items are packed/shipped, they are "Fulfilled."
   - **Inventory Check**: The system prevents fulfilling more than you have in stock.
   - **Partial Fulfillment**: Supports shipping only part of an order if needed.
   - **Auto-Sync**: Variant stock decreases immediately upon fulfillment.

---

## 5. Real-Time & Caching Engine
Behind the scenes, the system uses advanced technologies to stay fast and responsive:
- **Socket.io**: When a Manager fulfills an order on one computer, the Staff's dashboard on another computer updates **instantly** without refreshing.
- **RTK Query**: Ensures that the data you see in the browser is always synchronized with the server's state via intelligent caching and auto-fetching.
- **Search & Filter Debouncing**: Search queries wait 500ms for the user to finish typing before hitting the server. This prevents hundreds of unnecessary requests and keeps the application fluid.
- **Redis**: Caches high-traffic data (like product lists) to ensure the application remains lightning-fast even as the inventory grows to thousands of items. Wildcard invalidation ensures that when data changes, all relevant cached pages are cleared instantly.

---

## 6. Data Integrity
- **Transactions**: Every order or stock receipt uses **MongoDB Transactions**. If any part of the process fails (e.g., a server crash mid-update), the entire action rolls back to prevent "ghost" data or incorrect stock counts.
- **Concurrency**: The system handles multiple users updating the same item simultaneously without data corruption.

---
