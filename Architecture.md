# 🏗️ Mandi Connect — Recommended Web App Architecture

> **Stack**: Next.js (Frontend) · Node.js API Routes / Hono (Backend) · PostgreSQL on Supabase (DB) · Cost-Efficient · Scalable

---

## 1. Project Summary

**Mandi Connect** is a vegetable, groceries & rice distribution management system with **3 connected apps**:

| App | Users | Purpose |
|-----|-------|---------|
| **Office App** (primary) | Owner, Admin | Full operations management |
| **Receiver Company App** | Buyers/Customers | Submit orders, track status |
| **Driver App** | Drivers | View deliveries, capture proof of delivery |

**Core Modules**: Product & Rate Management · Purchase & Supplier · Inventory · Order Management · Delivery & Driver · Billing & Accounts · Owner Dashboard · Audit Trail

---

## 2. Architecture Overview

\\\
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS (3 Apps)                         │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │  Office App     │  │ Receiver Company │  │  Driver App   │  │
│  │  (Next.js Web)  │  │ App (Next.js)    │  │ (Next.js PWA) │  │
│  └────────┬────────┘  └────────┬─────────┘  └──────┬────────┘  │
└───────────┼────────────────────┼───────────────────┼───────────┘
            └──────────────┬─────┴────────────────────┘
                           │  HTTPS / WebSocket
                 ┌─────────▼──────────┐
                 │   Next.js API      │
                 │   Route Handlers   │  ← Single Backend
                 └─────────┬──────────┘
           ┌───────────────┼───────────────────┐
  ┌────────▼──────┐  ┌─────▼──────┐  ┌────────▼───────┐
  │  PostgreSQL   │  │  Supabase  │  │  Supabase      │
  │  (Supabase)   │  │  Realtime  │  │  Storage       │
  └───────────────┘  └────────────┘  └────────────────┘
\\\

---

## 3. Technology Stack

### Frontend — Next.js 14+ (App Router)

| Concern | Choice | Reason |
|---------|--------|--------|
| Framework | **Next.js 14** (App Router) | SSR for dashboard, CSR for real-time, ISR for reports |
| UI Library | **shadcn/ui** + Tailwind CSS | Free, accessible, production-grade components |
| State Management | **Zustand** + React Query | Lightweight, no boilerplate |
| Charts | **Recharts** / **ApexCharts** | Free, rich dashboard charts |
| Forms | **React Hook Form** + **Zod** | Type-safe validation |
| Auth UI | **Supabase Auth UI** | Pre-built, native integration |
| PWA (Driver) | **next-pwa** | Offline support for driver app |
| Real-time | **Supabase Realtime** client | Live order notifications |

### Backend — Next.js Route Handlers

| Concern | Choice | Reason |
|---------|--------|--------|
| API Layer | **Next.js Route Handlers** | Same repo, zero extra server cost |
| Validation | **Zod** | Schema-first, runtime-safe |
| ORM | **Prisma** | Type-safe queries, migration management |
| Auth / JWT | **Supabase Auth** | Role-based, free tier generous |
| File Uploads | **Supabase Storage** | S3-compatible, pay-as-you-go |
| Background Jobs | **Supabase Edge Functions** + **Vercel Cron** | Low stock alerts |
| Notifications | **Supabase Realtime** | WebSocket push to Office App |

### Database — PostgreSQL on Supabase

| Concern | Choice | Reason |
|---------|--------|--------|
| Primary DB | **Supabase PostgreSQL** | Free 500MB → \/mo Pro (8GB) |
| ORM | **Prisma** | Migrations + type safety |
| Audit Trail | **PostgreSQL triggers** + audit_log table | Native, no extra service |
| Full-text Search | **pg_trgm** extension | Built-in product/supplier search |
| Real-time Sync | **Supabase Realtime** | Order sync between all 3 apps |
| Backups | **Supabase daily backups** | Automatic, point-in-time |

---

## 4. Database Schema (Core Tables)

\\\
users            → roles: owner, admin, driver, receiver
products         → sku, price, unit, tax, status
categories       → vegetables, rice, groceries
customer_prices  → product + customer-specific price
warehouses       → multi-location stock ledger
suppliers        → payables, contacts, tax
stock_ledger     → open, reserved, available, wasted quantities
stock_movements  → purchase, return, waste, transfer records
purchase_orders  → PO status, goods receipt
orders           → source, status, customer, confirmed price
order_items      → ordered_qty, dispatched_qty, remaining_qty
delivery_trips   → driver, vehicle, orders, route
invoices         → GST, totals, balance due
payments         → cash/UPI/bank, advance, allocation
audit_log        → user, action, before_value, after_value, timestamp
drivers          → vehicle, licence, trip history
\\\

---

## 5. Module-to-Route Mapping

| Module | Pages / API Routes |
|--------|-------------------|
| Auth & Roles | \/login\, \/api/auth/*\ |
| Owner Dashboard | \/dashboard\ (SSR + Realtime) |
| Products | \/products\, \/api/products/*\ |
| Categories & Units | \/settings/categories\, \/api/categories/*\ |
| Customer Pricing | \/customers/[id]/pricing\ |
| Suppliers | \/suppliers\, \/api/suppliers/*\ |
| Purchase Orders | \/purchases\, \/api/purchase-orders/*\ |
| Goods Receipt | \/purchases/[id]/receipt\ |
| Inventory / Stock | \/inventory\, \/api/stock/*\ |
| Warehouse Mgmt | \/warehouses\, \/api/warehouses/*\ |
| Orders | \/orders\, \/api/orders/*\ |
| Delivery & Trips | \/delivery\, \/api/delivery-trips/*\ |
| Driver App | \/driver/*\ (PWA, mobile-optimized) |
| Billing / Invoices | \/billing\, \/api/invoices/*\ |
| Payments | \/payments\, \/api/payments/*\ |
| Reports | \/reports/[type]\ (ISR cached) |
| Audit Trail | \/audit-log\ (Admin/Owner only) |

---

## 6. Real-Time Synchronisation

\\\
Receiver App → POST /api/orders
                    ↓
             Supabase DB insert
                    ↓
         Supabase Realtime broadcast
                    ↓
         Office App WebSocket listener
                    ↓
         Admin notified → confirms order
                    ↓
         Status update pushed back to Receiver App
\\\

---

## 7. Role-Based Access Control (RBAC)

| Role | Access |
|------|--------|
| **Owner** | Full access: all modules, reports, settings |
| **Admin** | Operations: orders, purchase, delivery, billing |
| **Driver** | Own delivery trips, POD capture only |
| **Receiver** | Submit orders, track own orders only |

**Implementation**: Supabase Row-Level Security (RLS) + Next.js Edge Middleware.

\\\sql
-- Drivers only see their own trips
CREATE POLICY "driver_own_trips" ON delivery_trips
  FOR SELECT USING (driver_id = auth.uid());

-- Receivers only see their own orders
CREATE POLICY "receiver_own_orders" ON orders
  FOR SELECT USING (customer_id = auth.uid());

-- Audit log restricted to owner/admin
CREATE POLICY "admin_audit_log" ON audit_log
  FOR SELECT USING (auth.jwt() ->> 'role' IN ('owner', 'admin'));
\\\

---

## 8. File Storage

| File Type | Supabase Storage Path | Convention |
|-----------|----------------------|------------|
| Product images | \/products/\ | \{product_id}.webp\ |
| Supplier invoices | \/invoices/supplier/\ | \{supplier_id}/{date}.pdf\ |
| Proof of delivery | \/pod/\ | \{order_id}/{timestamp}.jpg\ |
| Payment receipts | \/payments/\ | \{payment_ref}.pdf\ |
| Sales invoices | \/invoices/sales/\ | \{invoice_number}.pdf\ |

---

## 9. Deployment & Cost

\\\
Vercel (FREE / Pro)
 └─ Next.js App (Office + Receiver + Driver PWA)
     ├─ Serverless API Route Handlers
     ├─ Edge Middleware (auth checks)
     ├─ ISR for reports (5 min cache)
     └─ Vercel Cron (scheduled alerts)
              │
Supabase (FREE → \/mo Pro)
 ├─ PostgreSQL DB
 ├─ Auth (JWT)
 ├─ Realtime (WebSocket)
 ├─ Storage (files, PDFs, images)
 └─ Edge Functions (cron + exports)
\\\

| Service | Free Tier | Production |
|---------|-----------|-----------|
| Vercel | Hobby (free) | \/mo |
| Supabase | 500MB DB, 5GB storage | \/mo |
| Domain | — | ~\/yr |
| **Total** | **\/mo** | **~\–55/mo** |

---

## 10. Development Phases

| Phase | Modules | Priority |
|-------|---------|----------|
| **Phase 1** | Product & Rate Mgmt; Supplier & Purchase | Essential |
| **Phase 2** | Inventory; Order Mgmt; Receiver App Integration | Essential |
| **Phase 3** | Delivery; Driver Functions; Billing & Accounts | Essential |
| **Phase 4** | Advanced Dashboard; Profit Analysis; Alerts; Reports | Enhancement |

---

## 11. Monorepo Folder Structure

\\\
mandi-connect/
├── apps/
│   ├── office/          ← Next.js Office App (Owner + Admin)
│   │   └── app/
│   │       ├── dashboard/
│   │       ├── products/
│   │       ├── purchases/
│   │       ├── inventory/
│   │       ├── orders/
│   │       ├── delivery/
│   │       ├── billing/
│   │       ├── reports/
│   │       └── api/
│   ├── receiver/        ← Next.js Receiver Company App
│   └── driver/          ← Next.js PWA Driver App
├── packages/
│   ├── db/              ← Prisma schema + migrations (shared)
│   ├── types/           ← Shared TypeScript interfaces
│   ├── ui/              ← Shared shadcn/ui components
│   └── utils/           ← Business logic (pricing, stock calc)
├── supabase/
│   ├── migrations/      ← SQL migrations + RLS + triggers
│   └── functions/       ← Edge functions (low-stock cron etc.)
├── turbo.json
└── package.json
\\\

---

## 12. Critical Business Rules → Technical Solutions

| Business Rule | Technical Solution |
|---------------|--------------------|
| No double stock deduction | Idempotency key + DB unique constraint on dispatch |
| Full audit trail | PostgreSQL trigger → \udit_log\ on every DML change |
| Customer-specific pricing | \customer_prices\ table; fallback to \products.default_price\ |
| Stock reservation on confirm | DB transaction: \vailable -= qty\, \eserved += qty\ |
| Release on cancel | Reverse transaction enforced in API route |
| Role-restricted actions | Supabase RLS + Next.js middleware role check |
| Partial fulfilment | \order_items\: \ordered_qty\, \dispatched_qty\, \emaining_qty\ |
| Unique order/invoice numbers | DB sequence + prefix (\ORD-2026-00001\, \INV-2026-00001\) |
| Confirmed price lock | Prices stored on \order_items\; rate changes don't affect them |
| Returned goods hold | Returns go to \inspection\ status; approved only adds to stock |
| Driver offline POD | PWA IndexedDB queue; syncs when connectivity restored |
| Low-stock alerts | Edge Function cron → checks min_stock → push notification |

---

## 13. Key API Endpoints Reference

### Orders
\\\
POST   /api/orders                    Create order
GET    /api/orders                    List (filtered by role/status)
GET    /api/orders/[id]               Get detail
PATCH  /api/orders/[id]/status        Update status
PATCH  /api/orders/[id]/approve       Approve (admin/owner only)
POST   /api/orders/[id]/cancel        Cancel + release reservation
\\\

### Stock
\\\
GET    /api/stock                     Current stock levels
POST   /api/stock/movement            Record movement
GET    /api/stock/ledger/[productId]  Full stock ledger
POST   /api/stock/count               Physical count entry
\\\

### Billing
\\\
POST   /api/invoices                  Generate invoice from order
GET    /api/invoices/[id]             Get invoice
POST   /api/payments                  Record payment
GET    /api/customers/[id]/ledger     Customer ledger
GET    /api/suppliers/[id]/payables   Supplier outstanding
\\\

### Reports
\\\
GET    /api/reports/sales             Sales report (date range filter)
GET    /api/reports/profit            Profit report
GET    /api/reports/stock             Stock valuation
GET    /api/reports/collections       Collections by payment method
GET    /api/reports/outstanding       Customer/supplier outstanding
\\\

---

> **Recommended Starting Point**: Design and run Prisma migrations for core tables first
> (products, stock_ledger, orders, invoices, audit_log), then build Phase 1 APIs and UI.
>
> *"Design the database and transaction workflows first, then build the screens.
> Validate the complete order-to-delivery-to-payment journey before adding advanced reporting."*
> — Mandi Connect Instruction.md
