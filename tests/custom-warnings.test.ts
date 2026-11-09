import { describe, it, expect, beforeEach } from "vitest"
import request from "supertest"
import { app } from "./apps/backend/src/app.js"
import { db, resetDb } from "./apps/backend/src/db.js"
import {
  createStockOverAllocationError,
  createCreditLimitWarning,
  createDoubleDispatchWarning,
  createRoleUnauthorizedError,
  createTenantIsolationError,
  createInvalidInputError,
  createInvalidStatusTransitionError,
  createVehicleOverloadWarning,
  createGoodsReceiptDiscrepancyWarning,
} from "./packages/utils/src/index.js"

describe("Customized Warning & Logic-Bound Error Messages", () => {
  beforeEach(() => {
    resetDb()
  })

  describe("1. Stock Over-Allocation Error (Rule 6.1 & Test 7)", () => {
    it("returns customized message, business rule reference, and logic explanation when stock is over-allocated", async () => {
      // Create order for 100kg of Chilli (available is only 10kg)
      const createRes = await request(app)
        .post("/api/orders")
        .set("x-user-role", "RECEIVER")
        .set("x-customer-id", "cust-3")
        .send({
          customer: "Green Leaf Mess",
          customerId: "cust-3",
          items: [{ productId: 4, qty: 100 }],
        })
      const orderId = createRes.body.data.id

      const approveRes = await request(app)
        .patch(`/api/orders/${orderId}/approve`)
        .set("x-user-role", "ADMIN")
        .send({})

      expect(approveRes.status).toBe(400)
      expect(approveRes.body.customMessage).toBeDefined()
      expect(approveRes.body.customMessage.code).toBe("ERR_STOCK_OVERALLOCATION")
      expect(approveRes.body.customMessage.severity).toBe("ERROR")
      expect(approveRes.body.customMessage.ruleReference).toContain("Section 6.1")
      expect(approveRes.body.customMessage.logicExplanation).toContain("physicalQty - reservedQty")
      expect(approveRes.body.customMessage.actionableStep).toMatch(/Goods Receipt|replenish|partial/i)
      expect(approveRes.body.shortage).toBe(90)
    })
  })

  describe("2. Customer Credit Limit Breach Warning (Rule 9.2 & Test 14)", () => {
    it("returns structured warning with financial logic explanation when credit limit is breached", async () => {
      // cust-3 credit limit is 50,000, current balance 14,400. Place order for 65,500
      const res = await request(app)
        .post("/api/orders")
        .set("x-user-role", "RECEIVER")
        .set("x-customer-id", "cust-3")
        .send({
          customer: "Green Leaf Mess",
          customerId: "cust-3",
          items: [{ productId: 7, qty: 50 }],
        })

      expect(res.status).toBe(201)
      expect(res.body.warning).toBeDefined()
      expect(res.body.warning.code).toBe("WARN_CREDIT_LIMIT_EXCEEDED")
      expect(res.body.warning.severity).toBe("WARNING")
      expect(res.body.warning.ruleReference).toContain("Section 9.2")
      expect(res.body.warning.logicExplanation).toContain("accounts receivable to exceed agreed credit limits")
      expect(res.body.warning.actionableStep).toContain("Owner/Admin authorization")
      expect(res.body.warning.details.projectedBalance).toBe(81900)
    })
  })

  describe("3. Idempotent Double Dispatch Warning (Rule 29 & Rule 38)", () => {
    it("returns customized warning explaining single-deduction invariant upon duplicate dispatch", async () => {
      // Create and confirm order
      const ord = await request(app)
        .post("/api/orders")
        .set("x-user-role", "OWNER")
        .send({
          customer: "Hotel Annapoorna",
          customerId: "cust-1",
          items: [{ productId: 1, qty: 10 }],
        })
      const orderId = ord.body.data.id

      await request(app)
        .patch(`/api/orders/${orderId}/approve`)
        .set("x-user-role", "OWNER")
        .send({})

      // 1st dispatch
      await request(app)
        .post(`/api/orders/${orderId}/dispatch`)
        .set("x-user-role", "ADMIN")
        .send({ vehicleNo: "KA-01-AB-1234" })

      // 2nd duplicate dispatch
      const res = await request(app)
        .post(`/api/orders/${orderId}/dispatch`)
        .set("x-user-role", "ADMIN")
        .send({ vehicleNo: "KA-01-AB-1234" })

      expect(res.status).toBe(200)
      expect(res.body.warning).toBeDefined()
      expect(res.body.warning.code).toBe("WARN_IDEMPOTENT_DISPATCH")
      expect(res.body.warning.ruleReference).toContain("Rule 29")
      expect(res.body.warning.logicExplanation).toContain("stock must be deducted exactly once per dispatch")
      expect(res.body.warning.actionableStep).toMatch(/manifest|trip sheet/i)
    })
  })

  describe("4. Role-Based Access Control Error (Rule 33 & Section 2)", () => {
    it("returns customized unauthorized message with role boundary logic", async () => {
      const res = await request(app)
        .get("/api/dashboard/stats")
        .set("x-user-role", "DRIVER")

      expect(res.status).toBe(403)
      expect(res.body.customMessage).toBeDefined()
      expect(res.body.customMessage.code).toBe("ERR_ROLE_UNAUTHORIZED")
      expect(res.body.customMessage.ruleReference).toContain("Rule 33")
      expect(res.body.customMessage.logicExplanation).toContain("operational compartmentalization")
      expect(res.body.customMessage.actionableStep).toContain("Owner or Admin")
    })
  })

  describe("5. Tenant Isolation / BOLA Access Error (Rule 33 & OWASP API1)", () => {
    it("returns customized cross-tenant data access violation with commercial confidentiality logic", async () => {
      const res = await request(app)
        .get("/api/orders?customerId=cust-2")
        .set("x-user-role", "RECEIVER")
        .set("x-customer-id", "cust-1")

      expect(res.status).toBe(403)
      expect(res.body.customMessage).toBeDefined()
      expect(res.body.customMessage.code).toBe("ERR_TENANT_ISOLATION_VIOLATION")
      expect(res.body.customMessage.logicExplanation).toContain("Commercial confidentiality")
    })
  })

  describe("6. Input Validation Error (Rule 34)", () => {
    it("returns customized numeric input error with ledger protection logic", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("x-user-role", "OWNER")
        .send({
          name: "Invalid Carrot",
          sellingPrice: -40,
        })

      expect(res.status).toBe(400)
      expect(res.body.customMessage).toBeDefined()
      expect(res.body.customMessage.code).toBe("ERR_INVALID_NUMERIC_INPUT")
      expect(res.body.customMessage.ruleReference).toContain("Rule 34")
      expect(res.body.customMessage.logicExplanation).toContain("corrupt the relational ledger")
    })
  })

  describe("7. Helper Builders Unit Tests", () => {
    it("constructs vehicle overload warning with load safety logic", () => {
      const warn = createVehicleOverloadWarning("KA-01-AB-1234", 1500, 1800)
      expect(warn.code).toBe("WARN_VEHICLE_OVERLOAD")
      expect(warn.severity).toBe("WARNING")
      expect(warn.ruleReference).toContain("Section 8.2")
      expect(warn.logicExplanation).toContain("crushing damage")
      expect(warn.details?.excessKg).toBe(300)
      expect(warn.details?.loadPercentage).toBe(120)
    })

    it("constructs goods receipt discrepancy warning with spoilage separation logic", () => {
      const warn = createGoodsReceiptDiscrepancyWarning("Tomato Hybrid", 1000, 950, 900, 50)
      expect(warn.code).toBe("WARN_GOODS_RECEIPT_DISCREPANCY")
      expect(warn.ruleReference).toContain("Section 5.3")
      expect(warn.logicExplanation).toContain("only accepted goods increase available inventory")
      expect(warn.details?.shortage).toBe(50)
    })

    it("constructs invalid status transition error with lifecycle sequential logic", () => {
      const err = createInvalidStatusTransitionError("RECEIVED", "DELIVERED", ["PENDING_APPROVAL", "REJECTED", "CANCELLED"])
      expect(err.code).toBe("ERR_INVALID_STATUS_TRANSITION")
      expect(err.ruleReference).toContain("Section 7.3")
      expect(err.logicExplanation).toContain("Skipping stages compromises warehouse tracking")
      expect(err.details?.allowedTransitions).toContain("PENDING_APPROVAL")
    })
  })
})
