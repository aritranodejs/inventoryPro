# Architecture Documentation

## Multi-Tenancy Approach: Discriminator Key (Row-Level Isolation)

For this assignment, I chose the **Discriminator Key (Row-Level Isolation)** approach using a `tenantId` field in every collection.

### Rationale
- **Efficiency**: Managing a single database is more efficient for a small to medium number of tenants in a SaaS context compared to separate databases.
- **Complexity**: It is simpler to implement and maintain than schema-based isolation (which MongoDB doesn't natively support like Postgres) or database-per-tenant (which introduces overhead in connection pooling).
- **Security**: Data isolation is enforced at the repository/middleware layer. Every query includes a mandatory `tenantId` filter derived from the authenticated user's JWT.
- **Scalability**: Allows for easy horizontal scaling of the backend services since data distribution is uniform.

### Tenant Onboarding
- **Registration**: Creates a new `Tenant` document and an `Owner` user.
- **Invitation**: Owners/Managers can invite users, automatically linking them to their `tenantId`.


## Data Modeling

### Complex Inventory & Variants
Variants are modeled as an **Embedded Array** within the `Product` document.
- **Pros**: Atomic updates to a product and all its variants are easy with MongoDB. No need for complex joins.
- **Race Condition Prevention**: When an order is placed, we use **MongoDB Transactions** and **Atomic Operators** (`$inc` with `$gte` check) to ensure stock never goes negative even with concurrent requests.

### Real-time Integration
- **Socket.io**: Used for real-time inventory alerts. When stock falls below the `lowStockThreshold` during an order or adjustment, the backend emits a `low-stock` event to the specific tenant's room.

### Performance Strategies
- **Indexing**: Compound indexes are placed on `{ tenantId: 1, name: 1 }` and `variants.sku` to ensure fast lookups.
- **Aggregation**: Complex analytics (Top Sellers, Inventory Value) use the MongoDB Aggregation Pipeline for efficient server-side computation.
- **Caching (Redis)**:
  - **Product Listing**: Frequently accessed product lists are cached in Redis with a 5-minute TTL.
  - **Cache Invalidation**: Creating, updating, or deleting a product automatically invalidates the specific tenant's cache, ensuring data consistency.
  - **Session Management**: JWT blacklisting for secure logout is handled via Redis with auto-expiry.

### API Security
- **Rate Limiting**: Implemented using `express-rate-limit` to restrict IPs to 100 requests per 15 minutes, mitigating DoS/brute-force attacks.
- **Helmet**: Adds secure HTTP headers.
- **CORS**: Configured for whitelist-only access.

## Security Architecture

### Authentication & Authorization
- **JWT (JSON Web Tokens)**: Stateless authentication. Tokens contain `userId`, `tenantId`, and `role`.
- **RBAC (Centralized Permissions)**:
  - **`usePermissions` Hook**: A centralized React hook that handles all frontend permission logic, preventing inconsistent role checks across different pages.
  - **Sidebar Filtering**: The navigation menu is dynamically filtered based on the user's role to prevent access to unauthorized modules.
  - **Owner**: Full access including destructive operations (DELETE) and financial overviews.
  - **Manager**: Complete management of inventory, orders, and suppliers. Can fulfill/cancel sales orders.
  - **Staff**: Operational access focused on sales. Can view products and create new sales orders, but cannot fulfill or cancel them. Restricted from accessing Supplier and Purchase Order modules.

### Data Protection
- **Input Validation**: `express-validator` sanitizes all incoming requests.
- **Rate Limiting**: Implemented for API endpoints to restrict excessive requests (100/15min).
- **CORS & Helmet**: Configured for secure cross-origin requests and HTTP header security.

## Scalability Considerations
- **Horizontal Scaling**: The Statless JWT authentication and discriminator-based isolation allow the application to be scaled horizontally across multiple instances easily.
- **Database Scaling**: As the data grows, MongoDB Sharding can be implemented using `tenantId` as part of the shard key to distribute data across clusters.
