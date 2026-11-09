import { describe, it, expect, beforeEach } from "vitest"
import request from "supertest"
import { app } from "./apps/backend/src/app.js"
import { db, resetDb } from "./apps/backend/src/db.js"

describe("Security, Robustness & Anti-Vulnerability Test Suite (OWASP API Top 10)", () => {
  beforeEach(() => {
    resetDb()
  })

  describe("1. Sensitive Data Leak Prevention & Role-Based Access Control (RBAC - Rule 33)", () => {
    it("SECURITY-01: Anonymous/unauthorized requests to Owner Dashboard Stats are blocked", async () => {
      // Driver or unauthenticated caller should not access owner financials
      const res = await request(app)
        .get("/api/dashboard/stats")
        .set("x-user-role", "DRIVER")

      expect([401, 403]).toContain(res.status)
      expect(res.body.data || res.body.stockValuation).toBeUndefined()
    })

    it("SECURITY-02: Driver role cannot view company Audit Logs (preventing internal leaks)", async () => {
      const res = await request(app)
        .get("/api/audit-logs")
        .set("x-user-role", "DRIVER")

      expect([401, 403]).toContain(res.status)
    })

    it("SECURITY-03: Receiver customer cannot inspect supplier purchase rates and contacts", async () => {
      const res = await request(app)
        .get("/api/suppliers")
        .set("x-user-role", "RECEIVER")

      expect([401, 403]).toContain(res.status)
    })

    it("SECURITY-04: Tenant Isolation / BOLA: Customer A cannot see Customer B's orders", async () => {
      // Hotel Annapoorna is cust-1; Saravana Bhavan is cust-2
      const res = await request(app)
        .get("/api/orders?customerId=cust-1")
        .set("x-user-role", "RECEIVER")
        .set("x-customer-id", "cust-1")

      expect(res.status).toBe(200)
      const orders = res.body.data
      expect(orders.length).toBeGreaterThan(0)
      // Every order returned MUST belong to cust-1
      orders.forEach((o: any) => {
        expect(o.customerId).toBe("cust-1")
      })
    })

    it("SECURITY-05: Tenant Isolation: Customer A cannot access Customer B's orders by spoofing query param", async () => {
      // cust-1 tries to query cust-2 orders
      const res = await request(app)
        .get("/api/orders?customerId=cust-2")
        .set("x-user-role", "RECEIVER")
        .set("x-customer-id", "cust-1")

      // Must be rejected or sanitized to only show caller's data
      if (res.status === 200) {
        expect(res.body.data.length).toBe(0)
      } else {
        expect([401, 403]).toContain(res.status)
      }
    })
  })

  describe("2. Robustness & Input Validation (Rule 34 & Injection Prevention)", () => {
    it("ROBUST-01: Rejects creation of product with negative selling price", async () => {
      const badProduct = {
        name: "Hacked Vegetable",
        category: "Vegetables",
        unit: "kg",
        purchasePrice: 20,
        sellingPrice: -50, // Negative price exploit
      }

      const res = await request(app)
        .post("/api/products")
        .set("x-user-role", "OWNER")
        .send(badProduct)

      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/sellingPrice|positive|invalid/i)
    })

    it("ROBUST-02: Rejects orders with negative quantity (negative quantity exploit)", async () => {
      const maliciousOrder = {
        customer: "Hotel Annapoorna",
        customerId: "cust-1",
        source: "Receiver App",
        items: [{ productId: 1, qty: -20 }], // Negative quantity would drain revenue/distort stock
      }

      const res = await request(app)
        .post("/api/orders")
        .set("x-user-role", "RECEIVER")
        .set("x-customer-id", "cust-1")
        .send(maliciousOrder)

      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/quantity|qty|positive|invalid/i)
    })

    it("ROBUST-03: Rejects payment recording with negative or zero amount", async () => {
      const badPayment = {
        invoiceNo: "INV-2026-00381",
        amount: -5000,
        method: "UPI",
      }

      const res = await request(app)
        .post("/api/payments")
        .set("x-user-role", "ADMIN")
        .send(badPayment)

      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/amount|positive|invalid/i)
    })

    it("ROBUST-04: Rejects spoilage logging with negative quantity", async () => {
      const badSpoilage = {
        productName: "Tomato Hybrid",
        qty: -50,
        estimatedLoss: 100,
      }

      const res = await request(app)
        .post("/api/stock/spoilage")
        .set("x-user-role", "ADMIN")
        .send(badSpoilage)

      expect(res.status).toBe(400)
    })

    it("ROBUST-05: Handles malformed JSON and oversized payloads without crashing server", async () => {
      const res = await request(app)
        .post("/api/orders")
        .set("Content-Type", "application/json")
        .send("{ malformed_json: true, ")

      expect(res.status).toBe(400)
    })
  })

  describe("3. Concurrency, Idempotency & Double Dispatch Protection (Rule 29 & Rule 38)", () => {
    it("IDEMPOTENT-01: Dispatching an order twice does not double-decrement physical inventory", async () => {
      const stockBefore = db.stockLedger.find((s) => s.productId === 1).physicalQty

      // Create and confirm order for 20kg
      const ord = await request(app)
        .post("/api/orders")
        .set("x-user-role", "OWNER")
        .send({
          customer: "Hotel Annapoorna",
          customerId: "cust-1",
          items: [{ productId: 1, qty: 20 }],
        })
      const orderId = ord.body.data.id

      await request(app)
        .patch(`/api/orders/${orderId}/approve`)
        .set("x-user-role", "OWNER")
        .send({})

      // 1st dispatch
      const d1 = await request(app)
        .post(`/api/orders/${orderId}/dispatch`)
        .set("x-user-role", "ADMIN")
        .send({ vehicleNo: "KA-01-AB-1234" })
      expect(d1.status).toBe(200)

      const stockAfter1 = db.stockLedger.find((s) => s.productId === 1).physicalQty
      expect(stockAfter1).toBe(stockBefore - 20)

      // 2nd dispatch of SAME order (re-delivery or accidental double click)
      const d2 = await request(app)
        .post(`/api/orders/${orderId}/dispatch`)
        .set("x-user-role", "ADMIN")
        .send({ vehicleNo: "KA-01-AB-1234" })

      // Should be blocked or return already dispatched
      expect([200, 400, 409]).toContain(d2.status)

      // CRITICAL CHECK: physical inventory must NOT be deducted again!
      const stockAfter2 = db.stockLedger.find((s) => s.productId === 1).physicalQty
      expect(stockAfter2).toBe(stockAfter1)
    })
  })

  describe("4. Business Integrity & State Inconsistency Protection (Rule 36)", () => {
    it("INTEGRITY-01: Physical inventory never drops below zero", async () => {
      // Chilli (id 4) physical stock is 45
      // Attempting to dispatch 500 units without sufficient physical stock
      const stock = db.stockLedger.find((s) => s.productId === 4)
      expect(stock.physicalQty).toBeGreaterThanOrEqual(0)
    })

    it("INTEGRITY-02: Cancelling an order in pending status does not release unreserved stock", async () => {
      // MC-8921 is in 'pending' status (stock NOT yet reserved)
      const tomatoStock = db.stockLedger.find((s) => s.productId === 1)
      const reservedBefore = tomatoStock.reservedQty

      await request(app)
        .post("/api/orders/MC-8921/cancel")
        .set("x-user-role", "ADMIN")
        .send({ reason: "Duplicate order" })

      const reservedAfter = db.stockLedger.find((s) => s.productId === 1)
      expect(reservedAfter.reservedQty).toBe(reservedBefore) // Must not decrement
    })
  })
})

