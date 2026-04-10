<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white" />
</p>

# 🌿 E&J Bloomtech Ltd — E-Commerce Platform

A complete, production-grade full-stack e-commerce application purpose-built for **E&J Bloomtech Ltd**, a greenery and gardening business based in **Kigali, Rwanda**. The platform enables customers to browse and purchase flowers, trees, and gardening tools, with a localized **MTN Mobile Money** payment simulation and real-time order tracking.

---

## 📋 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Frontend Architecture](#-frontend-architecture)
- [Core Features](#-core-features-explained)
- [Admin Dashboard](#-the-admin-dashboard)
- [Security Model](#-security-model)
- [Design System](#-design-system--aesthetic)
- [Roadmap](#-roadmap--future-improvements)

---

## 🏗️ Architecture Overview

The application follows a **decoupled monorepo architecture** with two independently runnable applications inside a single repository:

```
┌─────────────────────────────────────────────────────────┐
│                    MONOREPO ROOT                        │
│                                                         │
│  ┌───────────────────┐      ┌────────────────────────┐  │
│  │   client/         │      │   server/              │  │
│  │   React + Vite    │─────▶│   Express.js REST API  │  │
│  │   Port 5173       │ /api │   Port 5001            │  │
│  │   (Vite Proxy)    │      │                        │  │
│  └───────────────────┘      └────────┬───────────────┘  │
│                                      │                  │
│                              ┌───────▼───────────┐      │
│                              │   PostgreSQL       │      │
│                              │   Port 5432        │      │
│                              │   Database:        │      │
│                              │   "bloomtech"      │      │
│                              └───────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

**How they communicate:**

1. The **Vite dev server** runs at `http://localhost:5173` and serves the React frontend.
2. All API calls from the frontend use a centralized **Axios instance** (`api.js`) with `baseURL: '/api'`.
3. The Vite dev server is configured with a **reverse proxy** that forwards any `/api/*` request to `http://localhost:5001` — the Express backend.
4. This means **zero CORS issues** in development and **no hardcoded URLs** anywhere in the frontend code.
5. The Express backend connects to a local **PostgreSQL** database using the `pg` connection pool.

---

## ⚙️ Technology Stack

### Backend (REST API)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | v18+ | JavaScript runtime |
| **Express.js** | v5.2 | Web framework for REST API routing |
| **PostgreSQL** | v16 | Relational database (raw SQL via `pg` driver) |
| **JSON Web Tokens** | v9.0 | Stateless authentication & authorization |
| **bcrypt** | v6.0 | Secure password hashing (12 salt rounds) |
| **cors** | v2.8 | Cross-Origin Resource Sharing middleware |
| **dotenv** | v17.3 | Environment variable management |
| i18next | v24.2 | Internationalization framework (EN/RW support) |

### Frontend (Client Interface)

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | v19.2 | Component-based UI library |
| **Vite** | v8.0 | Build tool with instant HMR and optimized bundling |
| **TailwindCSS** | v4.2 | Utility-first CSS framework with custom design tokens |
| **React Router DOM** | v7.13 | Client-side routing with nested and protected routes |
| **Axios** | v1.14 | HTTP client with interceptor-based JWT injection |
| **Framer Motion** | v12.38 | Animation library for page transitions and micro-interactions |
| **Lucide React** | v1.7 | Modern, tree-shakable SVG icon library |
| **React Toastify** | v11.0 | Toast notification system for user feedback |

---

## 📂 Project Structure

```
EandJ_Bloomtech_Ltd/
│
├── README.md                         # This documentation file
│
├── server/                           # ══════ BACKEND ══════
│   ├── .env                          # Environment config (ports, DB, JWT secret)
│   ├── package.json                  # Backend dependencies & scripts
│   ├── index.js                      # Express entry point — mounts routes, CORS, JSON parsing
│   ├── db.js                         # PostgreSQL connection pool configuration
│   ├── init_db.js                    # Database schema: creates all 7 tables
│   ├── seed_admin.js                 # Seeds the default administrator account
│   │
│   ├── middleware/
│   │   └── auth.js                   # JWT verification (authenticateToken) & role guard (isAdmin)
│   │
│   ├── routes/
│   │   ├── authRoutes.js             # /api/auth/*      — Register, Login, Get Current User
│   │   ├── productRoutes.js          # /api/products/*   — CRUD operations for inventory
│   │   ├── orderRoutes.js            # /api/orders/*     — Create, fetch, and manage orders
│   │   ├── paymentRoutes.js          # /api/payments/*   — MoMo payment & order tracking
│   │   ├── reviewRoutes.js           # /api/reviews/*    — Product reviews & ratings
│   │   └── wishlistRoutes.js         # /api/wishlist/*   — User wishlist management
│   │
│   └── controllers/
│       ├── authController.js         # bcrypt hashing, JWT signing, user registration
│       ├── productController.js      # Paginated queries, search, category filtering
│       ├── orderController.js        # SQL transactions for atomic order creation
│       ├── paymentController.js      # Mock MoMo (80% success), tracking number generation
│       ├── reviewController.js       # Review creation with avg_rating recalculation
│       └── wishlistController.js     # Add/remove/fetch products from personal wishlist
│
├── client/                           # ══════ FRONTEND ══════
│   ├── package.json                  # React dependencies & build scripts
│   ├── vite.config.js                # Vite config: React plugin, TailwindCSS, API proxy
│   ├── index.html                    # HTML template entry point
│   │
│   └── src/
│       ├── main.jsx                  # React root — wraps App in AuthProvider & CartProvider
│       ├── App.jsx                   # Router: page transitions, route definitions, layout
│       ├── api.js                    # Centralized Axios instance with JWT interceptor
│       ├── index.css                 # Global styles, Tailwind imports, design tokens
│       │
│       ├── context/
│       │   ├── AuthContext.jsx       # Global auth state: login, logout, JWT persistence
│       │   └── CartContext.jsx       # Shopping cart state: items, quantities, localStorage sync
│       │
│       ├── components/
│       │   ├── Navbar.jsx            # Top navigation bar with cart counter & auth state
│       │   ├── Footer.jsx            # Site-wide footer with links and branding
│       │   ├── CartDrawer.jsx        # Slide-out cart panel with item management
│       │   ├── WhatsAppButton.jsx    # Floating customer support button
│       │   ├── PrivateRoute.jsx      # Route guard: redirects unauthenticated users
│       │   ├── AdminRoute.jsx        # Route guard: requires admin role
│       │   └── AdminLayout.jsx       # Admin sidebar layout wrapper for /admin/* routes
│       │
│       └── pages/
│           ├── Home.jsx              # Landing page: hero, featured products, categories
│           ├── Shop.jsx              # Product grid with debounced search & category filters
│           ├── ProductDetails.jsx    # Single product view with reviews, ratings, add-to-cart
│           ├── Cart.jsx              # Full cart management page with quantity controls
│           ├── Checkout.jsx          # 3-step checkout: Review → MoMo Payment → Confirmation
│           ├── TrackOrder.jsx        # Public order tracking with animated progress bar
│           ├── Login.jsx             # Authentication form with JWT token storage
│           ├── Register.jsx          # New user registration form
│           │
│           └── admin/                # ── Admin-Only Protected Routes ──
│               ├── Dashboard.jsx     # Aggregate stats: revenue, orders, products, conversion
│               ├── ManageProducts.jsx # CRUD interface: create, edit, delete products
│               └── ManageOrders.jsx  # Order management: view all orders, update statuses
```

---

## 🗄️ Database Schema

The PostgreSQL database (`bloomtech`) consists of **7 relational tables** linked by UUID foreign keys with `ON DELETE CASCADE` referential integrity:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    users      │     │   products   │     │  wishlists   │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)      │──┐  │ id (PK)      │──┐  │ id (PK)      │
│ name         │  │  │ name         │  │  │ user_id (FK) │
│ email (UQ)   │  │  │ description  │  │  │ product_id   │
│ password_hash│  │  │ category     │  │  │   (FK)       │
│ role         │  │  │ price        │  │  │ created_at   │
│ phone        │  │  │ stock_qty    │  │  └──────────────┘
│ address      │  │  │ image_url    │  │
│ created_at   │  │  │ avg_rating   │  │
└──────────────┘  │  │ created_at   │  │
                  │  └──────────────┘  │
                  │                    │
       ┌──────────┴─────┐    ┌────────┴──────┐
       │    orders       │    │   reviews     │
       ├────────────────┤    ├──────────────┤
       │ id (PK)        │    │ id (PK)      │
       │ user_id (FK)   │    │ user_id (FK) │
       │ total_amount   │    │ product_id   │
       │ status         │    │   (FK)       │
       │ tracking_number│    │ rating (1-5) │
       │ created_at     │    │ comment      │
       └───────┬────────┘    │ created_at   │
               │             └──────────────┘
    ┌──────────┴─────────┐
    │   order_items       │         ┌──────────────┐
    ├───────────────────┤         │  payments     │
    │ id (PK)           │         ├──────────────┤
    │ order_id (FK)     │         │ id (PK)      │
    │ product_id (FK)   │         │ order_id (FK)│
    │ quantity          │         │ provider     │
    │ price_at_purchase │         │ phone_number │
    └───────────────────┘         │ txn_id       │
                                  │ status       │
                                  │ amount       │
                                  │ created_at   │
                                  └──────────────┘
```

### Table Details

| Table | Records | Key Constraints |
|-------|---------|-----------------|
| `users` | Customers & admins | `email` is UNIQUE; `role` CHECK IN (`user`, `admin`) |
| `products` | Inventory catalog | `category` CHECK IN (`flowers`, `trees`, `tools`) |
| `orders` | Purchase transactions | `status` CHECK IN (`pending`, `paid`, `shipped`, `delivered`, `cancelled`) |
| `order_items` | Line items per order | Cascades on order/product delete |
| `payments` | MoMo payment records | `status` CHECK IN (`pending`, `success`, `failed`) |
| `reviews` | Product reviews | `rating` CHECK between 1 and 5 |
| `wishlists` | Saved products | UNIQUE constraint on (`user_id`, `product_id`) |

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Authentication is handled via JWT Bearer tokens in the `Authorization` header.

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register a new user account |
| `POST` | `/api/auth/login` | ❌ | Authenticate and receive JWT token |
| POST | /api/payments/webhook/momo | ❌ Public | Webhook: Simulated external payment confirmation |
| `GET` | `/api/auth/me` | 🔒 User | Get the currently authenticated user's profile |


**Login Request:**

```json
{
  "email": "admin@bloomtech.com",
  "password": "Admin@123"
}
```

**Login Response:**

```json
{
  "message": "Logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "a468ed9f-6930-430f-82ed-e7a80b7a192b",
    "name": "Default Admin",
    "email": "admin@bloomtech.com",
    "role": "admin"
  }
}
```

---

### Products — `/api/products`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/products` | ❌ | List all products (supports `?limit`, `?search`, `?category`) |
| `GET` | `/api/products/:id` | ❌ | Get a single product by ID |
| `POST` | `/api/products` | 🔒 Admin | Create a new product |
| `PUT` | `/api/products/:id` | 🔒 Admin | Update an existing product |
| `DELETE` | `/api/products/:id` | 🔒 Admin | Delete a product |

**Query Parameters for `GET /api/products`:**

| Parameter | Type | Default | Example |
|-----------|------|---------|---------|
| `limit` | number | 10 | `?limit=50` |
| `search` | string | — | `?search=rose` |
| `category` | string | — | `?category=flowers` |

---

### Orders — `/api/orders`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/orders` | 🔒 User | Create a new order from cart items |
| `GET` | `/api/orders/me` | 🔒 User | Get the logged-in user's orders |
| `GET` | `/api/orders` | 🔒 Admin | Get all orders (admin dashboard) |
| `PUT` | `/api/orders/:id/status` | 🔒 Admin | Update order status (e.g., `shipped`, `delivered`) |

**Create Order Request:**

```json
{
  "items": [
    { "product_id": "uuid-here", "quantity": 2 },
    { "product_id": "uuid-here", "quantity": 1 }
  ]
}
```

---

### Payments — `/api/payments`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/payments/pay` | 🔒 User | Process a mock MTN MoMo payment |
| `GET` | `/api/payments/order/:order_id` | 🔒 User | Get payment status for an order |
| `GET` | `/api/payments/track/:tracking_number` | ❌ | Public order tracking by TRK code |

**Payment Request:**

```json
{
  "order_id": "uuid-here",
  "phone_number": "0781234567"
}
```

---

### Reviews — `/api/reviews`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/reviews/product/:product_id` | 🔒 User | Submit a product review (1–5 stars) |
| `GET` | `/api/reviews/product/:product_id` | ❌ | Get all reviews for a product |
| `DELETE` | `/api/reviews/:id` | 🔒 User | Delete your own review |

---

### Wishlist — `/api/wishlist`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/wishlist` | 🔒 User | Add a product to your wishlist |
| `GET` | `/api/wishlist` | 🔒 User | Get all items in your wishlist |
| `DELETE` | `/api/wishlist/:product_id` | 🔒 User | Remove a product from your wishlist |

---

### Utility

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | ❌ | Health check — returns server status |

---

## 🚀 Getting Started

### Prerequisites

Before running this project, ensure you have:

1. **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **PostgreSQL** (v14 or higher) running locally on port 5432 — [Download](https://www.postgresql.org/download/)

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/EandJ_Bloomtech_Ltd.git
cd EandJ_Bloomtech_Ltd
```

### Step 2 — Create the Database

Open your terminal and create the PostgreSQL database:

```bash
createdb bloomtech
```

> **Note:** If you use a custom PostgreSQL username or password, update the `server/.env` file accordingly (see [Environment Variables](#-environment-variables)).

### Step 3 — Set Up the Backend

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Initialize the database schema (creates all 7 tables)
node init_db.js

# Seed the default admin account
node seed_admin.js

# Start the backend server
npm run dev          # With auto-reload (nodemon)
# OR
npm start            # Without auto-reload
```

The backend will start at **`http://localhost:5001`**.

You should see:

```
Initializing database schema...
Database schema created successfully.
Server is running on port 5001
```

### Step 4 — Set Up the Frontend

Open a **new terminal window**:

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend will start at **`http://localhost:5173`** — open this URL in your browser.

### Step 5 — Test the Application

1. Visit `http://localhost:5173` — the landing page should load
2. Navigate to **Sign In** and log in with the default admin credentials:
   - **Email:** `admin@bloomtech.com`
   - **Password:** `Admin@123`
3. You'll be redirected to the **Admin Dashboard** at `/admin`
4. Go to **Products → Add Product** to populate the store catalog

---

## 🔐 Environment Variables

### `server/.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5001` | Port the Express server listens on |
| `DB_USER` | `mutaz haroun` | PostgreSQL username |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_DATABASE` | `bloomtech` | PostgreSQL database name |
| `DB_PASSWORD` | *(empty)* | PostgreSQL password (empty for local dev) |
| `DB_PORT` | `5432` | PostgreSQL port |
| `JWT_SECRET` | `super_secret_jwt_bloomtech` | Secret key for signing JWT tokens |

> **⚠️ Important:** The backend runs on port `5001` instead of `5000` because **macOS AirPlay Receiver** occupies port 5000 by default. If you're on Linux or have AirPlay disabled, you can change this back to `5000`, but you must also update the Vite proxy target in `client/vite.config.js`.

### How the Frontend Connects to the Backend

The frontend **never hardcodes** the backend URL. Instead:

1. **`client/src/api.js`** creates a centralized Axios instance with `baseURL: '/api'`
2. An **interceptor** automatically attaches the JWT token from `localStorage` to every request
3. **`client/vite.config.js`** defines a proxy rule: `/api` → `http://localhost:5001`

```javascript
// client/src/api.js — The centralized API layer
import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;
```

```javascript
// client/vite.config.js — Proxy configuration
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
```

This architecture ensures that switching between development and production environments requires **zero code changes** — only the proxy/server configuration needs to be updated.

---

## 🎨 Frontend Architecture

### State Management

The app uses React's **Context API** with two global providers:

| Context | File | Responsibility |
|---------|------|----------------|
| **AuthContext** | `context/AuthContext.jsx` | Manages JWT storage in `localStorage`, exposes `user`, `login()`, and `logout()` globally. On mount, calls `GET /api/auth/me` to restore the session. |
| **CartContext** | `context/CartContext.jsx` | Manages the shopping cart in-memory and syncs with `localStorage`. Exposes `cart`, `cartTotal`, `addToCart()`, `removeFromCart()`, `updateQuantity()`, `clearCart()`. Survives page refreshes. |

## 🌍 Internationalization (i18n)
The platform is fully localized to support the diverse market in Rwanda:
- **English (EN):** Default professional interface.
- **Kinyarwanda (RW):** Native language support for improved local accessibility.
- **Implementation:** Powered by `i18next`, utilizing dynamic JSON resource files. All system messages, order statuses, and UI elements (Login, Register, Profile, Tracking) are fully translated without page reloads.

### Routing & Page Layout

The app uses React Router v7 with a two-layout architecture:

| Layout | Routes | Wrapper |
|--------|--------|---------|
| **Public Layout** | `/`, `/shop`, `/product/:id`, `/cart`, `/track`, `/login`, `/register` | `Navbar` + `Footer` + `WhatsAppButton` |
| **Admin Layout** | `/admin`, `/admin/products`, `/admin/orders` | `AdminLayout` (sidebar + content area) |

**Route protection** is handled by two wrapper components:

- **`PrivateRoute`** — Redirects to `/login` if no JWT exists → protects `/checkout`
- **`AdminRoute`** — Redirects to `/` if user's role is not `admin` → protects all `/admin/*`

### Page Transitions

Every route change is animated using **Framer Motion's** `AnimatePresence` with a fade & slide transition (300ms), giving the app a smooth, premium feel.

---

## ✨ Core Features Explained

### 🛒 The Shopping Experience

- **Smart Debounced Search** — The Shop page search input uses a `300ms` `setTimeout/clearTimeout` debounce pattern. As the user types, it waits for them to stop typing before firing the API call, preventing unnecessary requests.
- **Category Filtering** — Products can be filtered by `flowers`, `trees`, or `tools` via selectable buttons that append `?category=` to the API query.
- **Persistent Cart** — The `CartContext` stores items in both React state and `localStorage`. Cart data (items, quantities, totals) survives browser refreshes without requiring server-side sessions.
- **Dynamic Reviews & Ratings** — Authenticated users can submit 1–5 star reviews on product pages. The backend automatically recalculates the product's `average_rating` column via a `UPDATE ... SET average_rating = (SELECT AVG(rating) ...)` SQL query.

### 💳 Simulated MTN MoMo Payment

The checkout flow simulates Rwanda's **MTN Mobile Money** for a localized experience:

1. Customer reviews their cart items and clicks **Continue to Payment**
2. They enter their MoMo phone number (format: `+250 78X XXX XXX`)
3. The frontend sends `POST /api/payments/pay` with `{ order_id, phone_number }`
4. The backend:
   - Validates the request and creates a payment record
   - Simulates a **2-second network delay** (mimicking telecom processing)
   - Generates a random outcome with an **80% success rate**
5. **On success (80%):**
   - Order status updates from `pending` → `paid`
   - Inventory is decremented using an **SQL transaction** (`BEGIN`/`COMMIT`)
   - A tracking number is minted: `TRK-BLOOM-XXXXXX`
   - The customer sees a success screen with their tracking code
6. **On failure (20%):**
   - Order remains `pending`
   - Inventory is not touched
   - Customer can retry the payment

### 📦 Public Order Tracking

Anyone can track an order (no login required) at `/track`:

1. Enter the `TRK-BLOOM-XXXXX` tracking number
2. The frontend calls `GET /api/payments/track/:tracking_number`
3. The response includes the order's current `status` (`pending`, `paid`, `shipped`, `delivered`)
4. An **animated progress bar** visually reflects how far along the order is in the fulfillment pipeline

---

💳 Advanced Payment System: Integrated with a Webhook architecture. Orders transition to paid status only after a simulated server-to-server confirmation, ensuring high reliability.

📦 Dynamic Order Tracking: Fetches real-time product data (Images, Names, and Quantities) directly from the database for each specific order ID, providing full transparency to the customer.


## 🛠️ The Admin Dashboard

Admin routes are protected by both **frontend guards** (`AdminRoute.jsx`) and **backend middleware** (`isAdmin`). Only users with `role = 'admin'` in the database can access these features.

### Accessing the Admin Panel

1. Log in with admin credentials:
   - **Email:** `admin@bloomtech.com`
   - **Password:** `Admin@123`
2. You'll be automatically redirected to `/admin`

### Dashboard (`/admin`)

Fetches aggregate data from multiple endpoints using `Promise.all`:

| Metric | Data Source | Calculation |
|--------|-------------|-------------|
| **Total Revenue** | `GET /api/orders` | Sum of `total_amount` for paid/shipped/delivered orders |
| **Total Orders** | `GET /api/orders` | Count of all orders |
| **Products** | `GET /api/products` | Count of all products in catalog |
| **Conversion Rate** | Computed | `(paid orders / total orders) × 100%` |

Also displays a **Recent Orders** table showing the latest 5 orders.

### Manage Products (`/admin/products`)

Full CRUD interface for the product catalog:

- **Create** — Click "Add Product" to open a modal form with fields for name, category, price, stock quantity, and image URL
- **Edit** — Click the edit icon on any product row to modify its details
- **Delete** — Click the trash icon with a confirmation dialog
- **Search** — Filter the product list by name or category in real-time

### Manage Orders (`/admin/orders`)

Order fulfillment control panel:

- **Quick Stats** — Four colored cards showing counts of Pending, Paid, Shipped, and Delivered orders
- **Search** — Filter by tracking number, customer name, or email
- **Status Updates** — Each order row has a dropdown to change its status (e.g., `paid` → `shipped` → `delivered`). Changes persist immediately to the database and are reflected on the customer's tracking page.

---

## 🔒 Security Model

### Authentication Flow

```
Registration:
  1. Client sends { name, email, password } to POST /api/auth/register
  2. Server hashes password with bcrypt (12 salt rounds)
  3. User record is inserted into the database
  4. Server returns success

Login:
  1. Client sends { email, password } to POST /api/auth/login
  2. Server fetches user by email and compares password with bcrypt
  3. If valid, server signs a JWT containing { id, email, role }
  4. JWT is returned to the client and stored in localStorage
  5. All subsequent requests include the JWT via the Axios interceptor

Session Restoration:
  1. On page load, AuthContext checks localStorage for a JWT
  2. If found, calls GET /api/auth/me to validate the token
  3. If valid, the user object is restored to global state
  4. If expired/invalid, the token is cleared and user is logged out
```

### Authorization Layers

| Layer | File | What It Protects |
|-------|------|-----------------|
| **Frontend Route Guard** | `PrivateRoute.jsx` | Prevents unauthenticated users from reaching `/checkout` |
| **Frontend Admin Guard** | `AdminRoute.jsx` | Prevents non-admin users from reaching `/admin/*` |
| **Backend Token Middleware** | `middleware/auth.js` → `authenticateToken` | Rejects requests without a valid JWT on protected endpoints |
| **Backend Role Middleware** | `middleware/auth.js` → `isAdmin` | Rejects requests from non-admin users on admin-only endpoints |

> **Both layers are enforced independently.** Even if someone bypasses the frontend route guards, the backend middleware will reject their API requests. This is a defense-in-depth strategy.

---

## 🎨 Design System & Aesthetic

The frontend follows a **"Botanical Luxury"** design philosophy with a custom TailwindCSS v4 color palette:

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-forest` | `#2D6A4F` | Primary actions, buttons, links |
| `--color-forest-dark` | `#1B4332` | Hover states for primary elements |
| `--color-sage` | `#B7E4C7` | Light accent backgrounds, badges |
| `--color-cream` | `#F5F1EB` | Card backgrounds, input backgrounds |
| `--color-charcoal` | `#2C2C2C` | Primary text color |
| `--color-terra` | `#C17C4E` | Accent highlights, section labels |
| `--color-muted` | `#8B8B8B` | Secondary/helper text |
| `--color-slate` | `#4A5568` | Body text, descriptions |

### Design Highlights

- **Glassmorphism** — Navbar with `backdrop-blur` for a frosted glass effect
- **Micro-animations** — Hover scale effects, staggered list animations, skeleton loaders
- **Responsive Design** — Fully responsive from mobile (375px) to desktop (1440px+)
- **Typography** — Uses system font stack enhanced by Tailwind's `font-extrabold` and tracking utilities
- **Component-level motion** — Product cards, admin stat cards, and reviews all animate in with staggered `framer-motion` transitions

---

## 🚧 Roadmap & Future Improvements

While the fundamental e-commerce pipeline (**Browse → Cart → Pay → Track**) is fully operational, the following features are planned for future development:

### High Priority

- [ ] **Product Image Upload** — Replace URL-based image references with a file upload system using `multer` + cloud storage (AWS S3 or Cloudinary)
- [ ] **Database Seeding** — Add a comprehensive `seed_products.js` script to populate the store with sample flowers, trees, and tools

### Medium Priority

- [ ] **User Profile Management** — Admin interface to view all users, suspend accounts, and upgrade roles
- [ ] **Review Editing** — Allow users to update their existing reviews (currently only create/delete is supported)
- [ ] **Order History** — Customer-facing "My Orders" page showing their past purchases and tracking numbers
- [ ] **Data Visualization** — Integrate `Recharts` or `Chart.js` into the admin dashboard for sales trends, category breakdowns, and 30-day revenue graphs

### Low Priority / Nice-to-Have

- [ ] **SMS Notifications** — Replace toast-based payment confirmation with real SMS via Africa's Talking API or Twilio
- [ ] **Email Receipts** — Send order confirmation emails using SendGrid or Nodemailer
- [ ] **Product Pagination** — Add infinite scroll or traditional pagination to the Shop page for large catalogs
- [ ] **Docker Compose** — Containerize both the client and server for one-command deployment
- [ ] **CI/CD Pipeline** — GitHub Actions workflow for automated testing and deployment to Google Cloud Run

---

[x] Multi-language Support: Full EN/RW localization.

[x] Webhook Integration: Server-to-server payment confirmation.

[x] Order History: Customer-facing purchase records in My Account.

## 📄 License

This project is built for **E&J Bloomtech Ltd** for educational and commercial purposes. All rights reserved.

---

<p align="center">
  Built with 💚 in Kigali, Rwanda
</p>

