import { describe, it, expect, beforeEach } from "vitest"
import request from "supertest"
import { app } from "./apps/backend/src/app.js"
import { db, resetDb } from "./apps/backend/src/db.js"

describe("Instruction.md - Section 12: Development Acceptance Tests", () => {
  beforeEach(() => {
    resetDb()
  })

  // Test Case 1
  it("Test 1: Create a vegetable product -> Product appears in the catalogue", async () => {
    const newVeg = {
      name: "Capsicum Green (Shimla Mirch)",
      category: "Vegetables",
      unit: "kg",
      purchasePrice: 45,
      sellingPrice: 58,
      minStockLevel: 60,
      sku: "VEG-CAP-07",
    }

    const res = await request(app)
      .post("/api/products")
      .set("x-user-role", "ADMIN")
      .send(newVeg)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.name).toBe("Capsicum Green (Shimla Mirch)")

    // Verify it appears in catalogue
    const listRes = await request(app).get("/api/products")
    expect(listRes.status).toBe(200)
    const found = listRes.body.data.find((p: any) => p.sku === "VEG-CAP-07")
    expect(found).toBeDefined()
    expect(found.sellingPrice).toBe(58)
  })

  // Test Case 2
  it("Test 2: Update daily vegetable rate -> New rate applies according to configured pricing rules", async () => {
    // Tomato Hybrid is id 1, currently sellingPrice = 35
    const res = await request(app)
      .patch("/api/rates/1")
      .set("x-user-role", "OWNER")
      .send({
        newStandardRate: 40,
        reason: "APMC market auction price surge +5/kg",
      })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.sellingPrice).toBe(40)

    // Verify rates endpoint returns updated rate
    const ratesRes = await request(app).get("/api/rates")
    const tomatoRate = ratesRes.body.data.find((r: any) => r.id === 1)
    expect(tomatoRate.standardRate).toBe(40)

    // Verify audit log recorded the rate update
    const auditRes = await request(app)
      .get("/api/audit-logs")
      .set("x-user-role", "OWNER")

    const log = auditRes.body.data.find(
      (l: any) => l.entity === "DAILY_RATE" && l.entityId === "VEG-TOM-01"
    )
    expect(log).toBeDefined()
    expect(log.notes).toContain("changed from ₹35 to ₹40")
  })

  // Test Case 3
  it("Test 3: Create supplier purchase order -> Order is saved and traceable", async () => {
    const poPayload = {
      supplier: "APMC Commission Agent 42",
      supplierId: 1,
      totalAmount: 50000,
      items: [
        { productId: 1, productName: "Tomato Hybrid", orderedQty: 1000, purchaseRate: 28 },
        { productId: 2, productName: "Nashik Red Onion", orderedQty: 500, purchaseRate: 38 },
      ],
    }

    const res = await request(app)
      .post("/api/purchases")
      .set("x-user-role", "ADMIN")
      .send(poPayload)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    const createdPo = res.body.data
    expect(createdPo.poNumber).toMatch(/^PO-2026-\d{5}$/)

    // Traceable in purchase order list
    const poListRes = await request(app)
      .get("/api/purchases")
      .set("x-user-role", "ADMIN")

    const foundPo = poListRes.body.data.find((p: any) => p.poNumber === createdPo.poNumber)
    expect(foundPo).toBeDefined()
    expect(foundPo.totalAmount).toBe(50000)
  })

  // Test Case 4 & 5
  it("Test 4 & 5: Receive less than ordered -> Discrepancy is recorded & Only accepted goods increase inventory", async () => {
    // Initial stock for Green Chilli (productId 4)
    const initStock = db.stockLedger.find((s) => s.productId === 4)
    const initialPhys = initStock.physicalQty
    const initialAvail = initStock.availableQty
    const initialWasted = initStock.wastedQty

    // Ordered 200kg, Received 190kg, Accepted 175kg, Damaged 10kg, Rejected 5kg (Shortage = 10kg)
    const grPayload = {
      poNumber: "PO-2026-00412",
      supplier: "APMC Commission Agent 42",
      productName: "Green Chilli G4",
      orderedQty: 200,
      receivedWeight: 190,
      acceptedQty: 175,
      damagedQty: 10,
      rejectedQty: 5,
      discrepancyNote: "10 kg transit weight loss, 10 kg damaged, 5 kg rotten/rejected",
    }

    const res = await request(app)
      .post("/api/goods-receipt")
      .set("x-user-role", "ADMIN")
      .send(grPayload)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.grNumber).toBeDefined()
    expect(res.body.data.discrepancyNote).toContain("10 kg transit weight loss")

    // Check stock: Only accepted goods (175) must increase physical and available inventory
    const updatedStock = db.stockLedger.find((s) => s.productId === 4)
    expect(updatedStock.physicalQty).toBe(initialPhys + 175)
    expect(updatedStock.availableQty).toBe(initialAvail + 175)
    expect(updatedStock.wastedQty).toBe(initialWasted + 10)
  })

  // Test Case 6
  it("Test 6: Receive receiver-company order -> Order appears in Office App with customer and price details", async () => {
    const orderPayload = {
      customer: "Hotel Annapoorna",
      customerId: "cust-1",
      source: "Receiver App",
      slot: "Morning 06:00 - 08:00 AM",
      items: [
        // cust-1 special price for Tomato is 32 (standard is 35)
        { productId: 1, qty: 50 },
      ],
    }

    const res = await request(app)
      .post("/api/orders")
      .set("x-user-role", "RECEIVER")
      .set("x-customer-id", "cust-1")
      .send(orderPayload)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    const order = res.body.data
    expect(order.customer).toBe("Hotel Annapoorna")
    expect(order.items[0].unitPrice).toBe(32) // customer-specific price applied!
    expect(order.totalAmount).toBe(50 * 32)
    expect(order.status).toBe("pending")

    // Verify it appears in order list
    const orderListRes = await request(app)
      .get("/api/orders")
      .set("x-user-role", "OWNER")

    const found = orderListRes.body.data.find((o: any) => o.id === order.id)
    expect(found).toBeDefined()
  })

  // Test Case 7
  it("Test 7: Order exceeds available stock -> System blocks over-allocation or flags shortage", async () => {
    // Chilli (id: 4) availableQty is 10 in initial mock data
    // Create an order requesting 100kg of Chilli
    const orderPayload = {
      customer: "Green Leaf Mess",
      customerId: "cust-3",
      source: "Receiver App",
      items: [{ productId: 4, qty: 100 }],
    }

    const createRes = await request(app)
      .post("/api/orders")
      .set("x-user-role", "RECEIVER")
      .set("x-customer-id", "cust-3")
      .send(orderPayload)

    const orderId = createRes.body.data.id

    // Attempting to approve order when requested (100) > available (10)
    const approveRes = await request(app)
      .patch(`/api/orders/${orderId}/approve`)
      .set("x-user-role", "ADMIN")
      .send({})

    // Under Section 12 Test 7: System MUST block over-allocation or return error/warning
    expect(approveRes.status).toBe(400)
    expect(approveRes.body.error).toMatch(/insufficient|stock|over-allocation|shortage/i)
  })

  // Test Case 8
  it("Test 8: Confirm order -> Eligible stock is reserved", async () => {
    // Potato (id: 3): physicalQty 1600, reservedQty 400, availableQty 1200
    const initialReserved = db.stockLedger.find((s) => s.productId === 3).reservedQty
    const initialAvail = db.stockLedger.find((s) => s.productId === 3).availableQty

    // Create order for 100kg Potato
    const orderRes = await request(app)
      .post("/api/orders")
      .set("x-user-role", "OWNER")
      .send({
        customer: "Hotel Annapoorna",
        customerId: "cust-1",
        source: "WhatsApp",
        items: [{ productId: 3, qty: 100 }],
      })
    const orderId = orderRes.body.data.id

    // Confirm/Approve order
    const approveRes = await request(app)
      .patch(`/api/orders/${orderId}/approve`)
      .set("x-user-role", "ADMIN")
      .send({})

    expect(approveRes.status).toBe(200)
    expect(approveRes.body.data.status).toBe("confirmed")

    // Check reserved stock in ledger
    const updatedStock = db.stockLedger.find((s) => s.productId === 3)
    expect(updatedStock.reservedQty).toBe(initialReserved + 100)
    expect(updatedStock.availableQty).toBe(initialAvail - 100)
  })

  // Test Case 9
  it("Test 9: Dispatch order -> Stock is deducted exactly once (idempotent)", async () => {
    // Tomato (id: 1): physicalQty 850, reservedQty 320
    const stockBefore = db.stockLedger.find((s) => s.productId === 1)
    const physBefore = stockBefore.physicalQty

    // Create and approve order for 50kg Tomato
    const ordRes = await request(app)
      .post("/api/orders")
      .set("x-user-role", "OWNER")
      .send({
        customer: "Hotel Annapoorna",
        customerId: "cust-1",
        source: "Office",
        items: [{ productId: 1, qty: 50 }],
      })
    const orderId = ordRes.body.data.id
    await request(app)
      .patch(`/api/orders/${orderId}/approve`)
      .set("x-user-role", "ADMIN")
      .send({})

    // Dispatch the order first time
    const dispatch1 = await request(app)
      .post(`/api/orders/${orderId}/dispatch`)
      .set("x-user-role", "ADMIN")
      .send({
        vehicleNo: "KA-01-AB-1234",
        driver: "Ramesh Kumar",
      })
    expect(dispatch1.status).toBe(200)

    // Physical stock and reservation should be deducted by 50
    const stockAfter1 = db.stockLedger.find((s) => s.productId === 1)
    expect(stockAfter1.physicalQty).toBe(physBefore - 50)

    // Dispatch AGAIN (Duplicate dispatch request - Rule 29 & Rule 38)
    const dispatch2 = await request(app)
      .post(`/api/orders/${orderId}/dispatch`)
      .set("x-user-role", "ADMIN")
      .send({
        vehicleNo: "KA-01-AB-1234",
      })

    // Stock must NOT be deducted twice!
    const stockAfter2 = db.stockLedger.find((s) => s.productId === 1)
    expect(stockAfter2.physicalQty).toBe(stockAfter1.physicalQty)
  })

  // Test Case 10
  it("Test 10: Deliver part of an order -> Delivered and remaining quantities recorded separately", async () => {
    // Record POD with partial shortage
    const podPayload = {
      tripId: "trip-104",
      orderId: "MC-8918",
      receiverName: "Suresh (Store Manager)",
      signature: "data:image/svg+xml;base64,mockSign",
      shortageNote: "Delivered 250 kg out of 300 kg. 50 kg shortage due to crate shortage.",
      deliveredQty: 250,
      remainingQty: 50,
      collectedAmount: 15000,
      method: "CASH",
    }

    const res = await request(app)
      .post("/api/delivery/pod")
      .set("x-user-role", "DRIVER")
      .send(podPayload)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)

    // Check delivery trip record
    const tripRes = await request(app)
      .get("/api/delivery/trips")
      .set("x-user-role", "OWNER")

    const trip = tripRes.body.data.find((t: any) => t.id === "trip-104")
    const stop = trip.orders.find((o: any) => o.orderId === "MC-8918")
    expect(stop.status).toBe("Shortage")
    expect(stop.shortageNote).toContain("50 kg shortage")
    expect(stop.collectedAmount).toBe(15000)
  })

  // Test Case 11
  it("Test 11: Collect partial payment -> Paid amount and balance due are correct", async () => {
    // Create an invoice with balance due
    db.invoices.push({
      id: "inv-test",
      invoiceNo: "INV-2026-00999",
      orderId: "MC-999",
      customer: "Hotel Annapoorna",
      date: "2026-10-31",
      totalAmount: 20000,
      amountPaid: 0,
      balanceDue: 20000,
      paymentStatus: "Unpaid",
    })

    // Record partial payment of ₹8,000
    const payRes = await request(app)
      .post("/api/payments")
      .set("x-user-role", "ADMIN")
      .send({
        invoiceNo: "INV-2026-00999",
        amount: 8000,
        method: "UPI",
      })

    expect(payRes.status).toBe(201)
    const updatedInv = payRes.body.data
    expect(updatedInv.amountPaid).toBe(8000)
    expect(updatedInv.balanceDue).toBe(12000)
    expect(updatedInv.paymentStatus).toBe("Partial")

    // Record second partial payment of ₹12,000 to fully pay
    const payRes2 = await request(app)
      .post("/api/payments")
      .set("x-user-role", "ADMIN")
      .send({
        invoiceNo: "INV-2026-00999",
        amount: 12000,
        method: "BANK_TRANSFER",
      })
    expect(payRes2.body.data.balanceDue).toBe(0)
    expect(payRes2.body.data.paymentStatus).toBe("Paid")
  })

  // Test Case 12
  it("Test 12: Cancel a reserved order -> Eligible reservation is released", async () => {
    // Order MC-8920 is confirmed with 20 bags Sona Masoori (id 8) and 100kg Onion (id 2)
    const onionStock = db.stockLedger.find((s) => s.productId === 2)
    const reservedBefore = onionStock.reservedQty

    const res = await request(app)
      .post("/api/orders/MC-8920/cancel")
      .set("x-user-role", "ADMIN")
      .send({
        reason: "Customer requested cancellation before dispatch",
      })

    expect(res.status).toBe(200)
    expect(res.body.data.status).toBe("cancelled")

    // Reserved stock must be released
    const onionStockAfter = db.stockLedger.find((s) => s.productId === 2)
    expect(onionStockAfter.reservedQty).toBe(reservedBefore - 100)
  })

  // Test Case 13
  it("Test 13: Record damaged goods -> Usable stock and wastage reports update", async () => {
    // Tomato Hybrid (id 1): physicalQty 850, availableQty 530, wastedQty 15
    const initStock = db.stockLedger.find((s) => s.productId === 1)
    const physBefore = initStock.physicalQty
    const wastedBefore = initStock.wastedQty

    const spoilagePayload = {
      productName: "Tomato Hybrid",
      warehouse: "Central Cold Storage Yard A",
      qty: 30,
      unit: "kg",
      estimatedLoss: 1050,
      reason: "Cold room temperature fluctuation - soft rot culls",
    }

    const res = await request(app)
      .post("/api/stock/spoilage")
      .set("x-user-role", "ADMIN")
      .send(spoilagePayload)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)

    // Stock ledger verification
    const updatedStock = db.stockLedger.find((s) => s.productId === 1)
    expect(updatedStock.physicalQty).toBe(physBefore - 30)
    expect(updatedStock.wastedQty).toBe(wastedBefore + 30)
  })

  // Test Case 14
  it("Test 14: Exceed credit limit -> Configured warning or approval requirement is triggered", async () => {
    // Green Leaf Mess (cust-3): creditLimit 50,000, currentBalance 14,400. Remaining limit = 35,600
    // Try placing an order for ₹60,000 (exceeds credit limit by 24,400)
    const heavyOrder = {
      customer: "Green Leaf Mess",
      customerId: "cust-3",
      source: "Receiver App",
      items: [
        // Ponni rice bag @ 1310. 50 bags = 65,500
        { productId: 7, qty: 50 },
      ],
    }

    const res = await request(app)
      .post("/api/orders")
      .set("x-user-role", "RECEIVER")
      .set("x-customer-id", "cust-3")
      .send(heavyOrder)

    // Must return credit warning or require owner authorization
    expect([201, 400, 422]).toContain(res.status)
    if (res.status === 201) {
      expect(res.body.creditWarning || res.body.data.creditLimitNote).toMatch(/exceed|breach|limit/i)
    } else {
      expect(res.body.error).toMatch(/credit/i)
    }
  })

  // Test Case 15
  it("Test 15: Change a confirmed order -> Authorised change and audit history are saved", async () => {
    // Modify items or status on confirmed order MC-8920
    const res = await request(app)
      .patch("/api/orders/MC-8920/modify")
      .set("x-user-role", "OWNER")
      .send({
        notes: "Customer revised quantity: Onion reduced to 80kg",
        items: [
          { productId: 8, productName: "Sona Masoori Rice (25kg)", qty: 20, unitPrice: 1490, lineTotal: 29800 },
          { productId: 2, productName: "Nashik Red Onion", qty: 80, unitPrice: 45, lineTotal: 3600 },
        ],
      })

    expect([200, 201]).toContain(res.status)
    const auditRes = await request(app)
      .get("/api/audit-logs")
      .set("x-user-role", "OWNER")

    const log = auditRes.body.data.find((l: any) => l.entityId === "MC-8920" && l.action === "UPDATE")
    expect(log).toBeDefined()
  })

  // Test Case 16
  it("Test 16: Generate monthly report -> Totals reconcile to underlying transactions", async () => {
    const res = await request(app)
      .get("/api/dashboard/stats")
      .set("x-user-role", "OWNER")

    expect(res.status).toBe(200)

    const stats = res.body
    // Expected reconciliations
    const expectedSales = db.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    expect(stats.totalSalesToday).toBe(expectedSales)

    const expectedStockValuation = db.stockLedger.reduce(
      (sum, item) => sum + item.physicalQty * item.avgCost,
      0
    )
    expect(stats.stockValuation).toBe(expectedStockValuation)
    expect(stats.activeWarehouses).toBeGreaterThanOrEqual(1)
  })

  // Feature: Increase Stock Option in Inventory
  it("Feature: Increase stock option in inventory page -> Updates physical and available stock ledger", async () => {
    // Tomato Hybrid (id 1): initial physicalQty 850, availableQty 530
    const stockBefore = db.stockLedger.find((s) => s.productId === 1)
    const physBefore = stockBefore.physicalQty
    const availBefore = stockBefore.availableQty

    const res = await request(app)
      .post("/api/stock/adjust")
      .set("x-user-role", "ADMIN")
      .send({
        productId: 1,
        warehouse: "Central Cold Storage Yard A",
        qty: 150,
        reason: "Direct Farm Gate Purchase Inward",
        reference: "INW-2026-0045",
      })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.physicalQty).toBe(physBefore + 150)
    expect(res.body.data.availableQty).toBe(availBefore + 150)

    // Verify audit log recorded the stock increase
    const auditRes = await request(app)
      .get("/api/audit-logs")
      .set("x-user-role", "ADMIN")

    const log = auditRes.body.data.find(
      (l: any) => l.action === "ADJUSTMENT" && l.notes.includes("Stock increased by 150")
    )
    expect(log).toBeDefined()
  })
})
