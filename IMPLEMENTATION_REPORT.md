# Full Stack Developer Internship — Implementation Report
**Role-Based E-Commerce Platform**
**Author / Intern:** Full Stack Engineering Intern
**Evaluation Target:** 1-Day Role-Based E-Commerce Project Benchmark

---

## 1. Executive Summary

This report documents the architectural design, implementation details, security safeguards, challenges, and verification results of the **Role-Based E-Commerce Platform (NexStore)**. The application is built using a modern decoupled stack: **React (Vite) + Tailwind CSS** on the frontend, and **Node.js + Express + MongoDB (Mongoose)** on the backend, integrated with **Cloudinary** for image storage and **Razorpay** for test payment processing.

---

## 2. Completed Features & Implementation Details

### 2.1 Authentication & Password Security (Task 3)
- **Implementation:**
  - Password hashing via `bcryptjs` with auto-generated salts during Mongoose `pre('save')` lifecycle hook.
  - Plaintext passwords are never persisted to disk or emitted in queries (`select: false` on Mongoose schema).
  - JWT tokens issued upon registration and login with configurable expiration (`JWT_EXPIRE=7d`).
  - Auth middleware (`protect`) validates bearer tokens on protected endpoints and injects `req.user`.

### 2.2 Server-Side Role-Based Access Control (RBAC) (Tasks 2, 3, 4, 8)
- **Role Hierarchy & Separation:**
  1. **Admin:**
     - Universal authority across all resources.
     - Can view, edit, or delete products belonging to any seller.
     - Can view all platform transactions and alter order fulfillment status (`placed` → `processing` → `shipped` → `delivered` → `cancelled`).
     - Can access Super Admin telemetry (`/api/admin/stats`), view all registered users, update roles (`admin`, `sales`, `user`), and delete accounts with self-demotion guards.
  2. **Sales Person (Seller):**
     - Can create new products in the catalog.
     - Strict ownership validation (`authorizeProductOwnerOrAdmin`): sales persons can **only** update or delete products where `product.seller === req.user._id`. Attempts to alter another seller's product result in an immediate `403 Forbidden` response.
     - Dedicated Seller Dashboard calculating total products listed, units sold, and net seller revenue.
     - Access to customer orders containing their products (`/api/orders/seller-orders`).
  3. **User (Customer):**
     - Browse, search, filter, and sort catalog products.
     - Manage personal Wishlist and persistent Shopping Cart.
     - Execute verified Razorpay test transactions.
     - View personalized order history and tracking information.

### 2.3 Product Catalog & Cloudinary Media Integration (Task 4 & 5)
- **Implementation:**
  - RESTful CRUD routes with search query, category filtering, min/max price boundaries, sorting, and pagination.
  - In-memory file buffer processing via `multer.memoryStorage()`.
  - Direct pipeline streaming to Cloudinary via `streamifier` and `cloudinary.uploader.upload_stream`.
  - Image files are never written to server disk or filesystem. The database only retains the secure Cloudinary HTTPS URL.
  - Flexible fallback support for direct image URLs if testing in environments without active Cloudinary API keys.

### 2.4 Shopping Cart & Wishlist (Task 6)
- **Implementation:**
  - Dedicated MongoDB models for `Cart` and `Wishlist` linked to the authenticated user ID.
  - Real-time stock availability verification: prevents adding quantities exceeding inventory.
  - Persistent cart badge in navigation bar showing dynamic item counts.
  - Wishlist toggle feature with instant visual heart feedback and database persistence.

### 2.5 Razorpay Test Payment Gateway (Task 7)
- **End-to-End Signature Verification Flow:**
  1. Frontend submits order amount to `/api/payment/create-order`.
  2. Backend generates official Razorpay order with currency INR and receipt ID.
  3. Frontend triggers Razorpay modal or testing simulator.
  4. Upon payment completion, frontend sends `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` to `/api/payment/verify-payment`.
  5. **Cryptographic Verification:** Backend computes `HMAC-SHA256(order_id + "|" + payment_id, key_secret)` using Node.js `crypto`.
  6. Only if computed hash matches received signature does the backend instantiate the `Order` record, deduct product stock quantities, and wipe the user's active cart.
  7. Fake callbacks and altered payment payloads are rejected with HTTP 400.

### 2.6 Order History & Role Dashboards (Task 8)
- **User Dashboard:** Itemized list of previous orders with date, shipping address, status badges, and transaction IDs.
- **Sales Person Dashboard:** Interactive cards showing units sold, revenue breakdown, inventory list, and customer orders containing their items.
- **Admin Dashboard:** Platform revenue telemetry, order status management dropdown, user role modification table, and platform-wide catalog control.

---

## 3. Test Credentials

The database can be seeded with one command: `npm run seed` (inside `backend`).

| Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `Admin@123` | Full control, user role management, status transitions, platform sales analytics |
| **Sales Person** | `sales@example.com` | `Sales@123` | Product management for own listings, seller orders, revenue tracker |
| **Customer** | `user@example.com` | `User@123` | Catalog browsing, wishlist, shopping cart, test checkout, order history |

*(The login UI also provides 1-click test credential pre-fill buttons for rapid review).*

---

## 4. Challenges Faced & Solutions

| Challenge | Cause / Context | Implemented Solution |
| :--- | :--- | :--- |
| **Enforcing strict RBAC without code duplication** | Checking product ownership across multiple controller methods (PUT, DELETE) can lead to repetitive queries. | Created a dedicated Express middleware `authorizeProductOwnerOrAdmin` that intercepts requests, fetches the product once, validates if `req.user.role === 'admin'` or `product.seller.equals(req.user._id)`, and attaches `req.product` to the request object. |
| **Preventing forged payment callbacks** | E-commerce apps often fall victim to client-side callback forgery if the server assumes a 200 frontend status means genuine payment. | Implemented strict server-side HMAC-SHA256 signature verification matching Razorpay's cryptographic specification. An order is only written to the database if the signature matches the secret hash. |
| **Cloudinary File Buffers in Serverless / Container Environments** | Writing temporary image files to local server disk causes disk bloat and fails in stateless cloud containers (e.g. Render, AWS Lambda). | Configured `multer` to use in-memory storage (`multer.memoryStorage()`) and piped the buffer directly into `cloudinary.uploader.upload_stream` using `streamifier`. Raw images never touch local disk. |
| **Seamless Offline / Mock Evaluation** | Reviewers might test the application without active Razorpay or Cloudinary API keys entered in `.env`. | Added smart fallback handlers: If default keys are detected, the system safely simulates the Razorpay HMAC flow and provides high-res imagery, enabling 100% end-to-end functionality even without third-party credentials. |

---

## 5. Known Assumptions & Limitations

1. **Test Mode Razorpay:** Payment processing is configured for Razorpay Test Mode (`rzp_test_...`) using official test simulation cards and credentials. Real monetary transactions are not enabled.
2. **Single Currency:** Transactions and prices are calculated and displayed in Indian Rupees (INR / ₹) as per Razorpay India defaults.
3. **Single Seller Attribution per Product:** Products currently belong to a single primary seller/owner. Multi-vendor revenue splitting across orders calculates sub-totals for each individual seller accurately.

---

## 6. Verification Checklist

- [x] JWT Authentication & bcrypt password hashing
- [x] RBAC enforced on backend routes (403 Forbidden on non-authorized actions)
- [x] Product CRUD with search, category filters, and price ranges
- [x] Cloudinary direct image upload integration
- [x] Wishlist toggle & backend persistence
- [x] Cart quantity controls, stock checks, and live navbar badges
- [x] Razorpay order creation and HMAC-SHA256 signature verification
- [x] User Order History, Sales Dashboard, and Super Admin Console
- [x] Clean Git commit history and merged feature branch
- [x] Deployment configurations for Render (`render.yaml`) and Vercel (`vercel.json`)

