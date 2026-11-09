import { Router, Request, Response } from "express"
import { db, logAudit } from "../db.js"
import { requireRole, enforceTenantIsolation } from "../middleware/auth.js"
import {
  createStockOverAllocationError,
  createCreditLimitWarning,
  createDoubleDispatchWarning,
  createInvalidInputError,
} from "../utils/custom-messages.js"

export const router = Router()

// Health check
router.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Mandi Connect Backend API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  })
})

// ─────────────────────────────────────────────────────────────
// 1. OWNER DASHBOARD STATS (Protected: Rule 33)
// ─────────────────────────────────────────────────────────────
router.get("/dashboard/stats", requireRole(["OWNER", "ADMIN"]), (req: Request, res: Response) => {
  const totalSalesToday = db.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  const totalPurchasesToday = 142800
  const totalReceivables = db.invoices.reduce((sum, i) => sum + (i.balanceDue || 0), 0) + 485000
  const totalPayables = db.suppliers.reduce((sum, s) => sum + (s.outstanding || 0), 0)
  const stockValuation = db.stockLedger.reduce((sum, item) => sum + item.physicalQty * item.avgCost, 0)
  const lowStockAlerts = db.stockLedger.filter((item) => item.availableQty <= item.reorderThreshold).length
  const totalSpoilageLoss = db.spoilageLogs.reduce((sum, l) => sum + l.estimatedLoss, 0)

  res.json({
    totalSalesToday,
    totalPurchasesToday,
    totalReceivables,
    totalPayables,
    netSurplus: totalReceivables - totalPayables,
    stockValuation,
    lowStockAlerts,
    totalSpoilageLoss,
    ordersCount: db.orders.length,
    activeWarehouses: 3,
  })
})

// ─────────────────────────────────────────────────────────────
// 2. PRODUCTS & RATES
// ─────────────────────────────────────────────────────────────
router.get("/products", (req: Request, res: Response) => {
  res.json({ data: db.products })
})

router.post("/products", requireRole(["OWNER", "ADMIN"]), (req: Request, res: Response) => {
  const { name, category, unit, purchasePrice, sellingPrice, minStockLevel, sku } = req.body

  // Robust Input Validation (Rule 34)
  if (!name || typeof name !== "string") {
    const msg = createInvalidInputError("name", name, "Product name is required and must be non-empty")
    return res.status(400).json({ error: msg.message, customMessage: msg, logicExplanation: msg.logicExplanation, ruleReference: msg.ruleReference })
  }
  const numSelling = Number(sellingPrice)
  if (isNaN(numSelling) || numSelling <= 0) {
    const msg = createInvalidInputError("sellingPrice", sellingPrice, "sellingPrice must be a positive number")
    return res.status(400).json({ error: msg.message, customMessage: msg, logicExplanation: msg.logicExplanation, ruleReference: msg.ruleReference })
  }
  const numPurchase = Number(purchasePrice)
  if (isNaN(numPurchase) || numPurchase < 0) {
    const msg = createInvalidInputError("purchasePrice", purchasePrice, "purchasePrice must be a valid non-negative number")
    return res.status(400).json({ error: msg.message, customMessage: msg, logicExplanation: msg.logicExplanation, ruleReference: msg.ruleReference })
  }

  const newProduct = {
    id: db.products.length + 1,
    sku: sku || `SKU-${Date.now().toString().slice(-4)}`,
    name,
    category: category || "Vegetables",
    unit: unit || "kg",
    purchasePrice: numPurchase,
    sellingPrice: numSelling,
    minStockLevel: Number(minStockLevel) || 50,
    status: "ACTIVE",
  }
  db.products.push(newProduct)

  // Initialize stock ledger entry
  db.stockLedger.push({
    productId: newProduct.id,
    productName: newProduct.name,
    warehouse: "Central Cold Storage Yard A",
    physicalQty: 0,
    reservedQty: 0,
    availableQty: 0,
    wastedQty: 0,
    reorderThreshold: newProduct.minStockLevel,
    avgCost: newProduct.purchasePrice,
  })

  logAudit("CREATE", "PRODUCT", newProduct.sku, `Created product ${newProduct.name} at ₹${newProduct.sellingPrice}/${newProduct.unit}`)
  res.status(201).json({ success: true, data: newProduct })
})

router.get("/rates", (req: Request, res: Response) => {
  const ratesWithCustomerPrices = db.products.map((p) => {
    const cust1 = db.customerPrices.find((cp) => cp.customerId === "cust-1" && cp.productId === p.id)?.price || p.sellingPrice
    const cust2 = db.customerPrices.find((cp) => cp.customerId === "cust-2" && cp.productId === p.id)?.price || p.sellingPrice
    const cust3 = db.customerPrices.find((cp) => cp.customerId === "cust-3" && cp.productId === p.id)?.price || p.sellingPrice

    return {
      id: p.id,
      name: p.name,
      code: p.sku,
      unit: p.unit,
      standardRate: p.sellingPrice,
      hotelAnnapoorna: cust1,
      saravanaBhavan: cust2,
      greenLeafMess: cust3,
      status: p.status,
    }
  })

  res.json({ data: ratesWithCustomerPrices })
})

router.patch("/rates/:id", requireRole(["OWNER", "ADMIN"]), (req: Request, res: Response) => {
  const productId = Number(req.params.id)
  const { newStandardRate, reason } = req.body

  const numRate = Number(newStandardRate)
  if (isNaN(numRate) || numRate <= 0) {
    const msg = createInvalidInputError("newStandardRate", newStandardRate, "Standard rate must be a positive number")
    return res.status(400).json({ error: msg.message, customMessage: msg, logicExplanation: msg.logicExplanation, ruleReference: msg.ruleReference })
  }

  const product = db.products.find((p) => p.id === productId)
  if (!product) {
    return res.status(404).json({ error: "Product not found" })
  }

  const oldRate = product.sellingPrice
  product.sellingPrice = numRate

  logAudit(
    "UPDATE",
    "DAILY_RATE",
    product.sku,
    `Standard rate changed from ₹${oldRate} to ₹${newStandardRate}. Reason: ${reason || "Market trend"}`
  )

  res.json({ success: true, data: product })
})

// ─────────────────────────────────────────────────────────────
// 3. ORDERS MANAGEMENT
// ─────────────────────────────────────────────────────────────
router.get("/orders", enforceTenantIsolation, (req: Request, res: Response) => {
  const { status, customerId } = req.query
  let list = db.orders

  if (status && status !== "all") {
    list = list.filter((o) => o.status === status)
  }
  if (customerId) {
    list = list.filter((o) => o.customerId === customerId)
  }

  res.json({ data: list })
})

router.post("/orders", (req: Request, res: Response) => {
  const { customer, customerId, source, items, slot } = req.body
  const custId = customerId || "cust-1"

  // Input Validation (Rule 34)
  if (!items || !Array.isArray(items) || items.length === 0) {
    const msg = createInvalidInputError("items", items, "Order must contain at least one item")
    return res.status(400).json({ error: msg.message, customMessage: msg, logicExplanation: msg.logicExplanation, ruleReference: msg.ruleReference })
  }

  for (const item of items) {
    const numQty = Number(item.qty)
    if (isNaN(numQty) || numQty <= 0) {
      const msg = createInvalidInputError("quantity", item.qty, "Item quantity must be a positive number")
      return res.status(400).json({ error: msg.message, customMessage: msg, logicExplanation: msg.logicExplanation, ruleReference: msg.ruleReference })
    }
  }

  const orderId = `MC-${Math.floor(8930 + Math.random() * 500)}`

  // Calculate total and itemsSummary
  let totalAmount = 0
  const processedItems = items.map((item: any) => {
    const prod = db.products.find((p) => p.id === item.productId)
    // Resolve customer price fallback (Rule 4.3)
    const customPrice = db.customerPrices.find((cp) => cp.customerId === custId && cp.productId === item.productId)?.price
    const unitPrice = customPrice || prod?.sellingPrice || 35
    const lineTotal = unitPrice * Number(item.qty)
    totalAmount += lineTotal
    return {
      productId: item.productId,
      productName: prod?.name || "Commodity",
      qty: Number(item.qty),
      unitPrice,
      lineTotal,
    }
  })

  // Credit Limit Check (Acceptance Test 14 & Rule 9.2)
  const customerRecord = db.customers.find((c) => c.id === custId)
  let creditWarningObj: any
  let creditWarning: string | undefined
  let creditLimitNote = "Within Limit"

  if (customerRecord && customerRecord.creditLimit > 0) {
    const projectedBalance = customerRecord.currentBalance + totalAmount
    if (projectedBalance > customerRecord.creditLimit) {
      creditLimitNote = "Credit Limit Exceeded"
      creditWarningObj = createCreditLimitWarning(
        customerRecord.name,
        customerRecord.currentBalance,
        customerRecord.creditLimit,
        totalAmount
      )
      creditWarning = creditWarningObj.message
    }
  }

  const newOrder = {
    id: orderId,
    customer: customer || customerRecord?.name || "Hotel Annapoorna",
    customerId: custId,
    source: source || "Receiver App",
    time: "Just Now",
    totalAmount,
    paymentStatus: "Unpaid",
    status: "pending",
    statusLabel: "Pending Approval",
    slot: slot || "Morning 06:00 - 08:00 AM",
    items: processedItems,
    creditLimitNote,
  }

  db.orders.unshift(newOrder)

  logAudit(
    "CREATE",
    "ORDER",
    orderId,
    `New order created for ${newOrder.customer} via ${newOrder.source}. Amount: ₹${totalAmount}. Note: ${creditLimitNote}`
  )

  res.status(201).json({
    success: true,
    data: newOrder,
    creditWarning,
    warning: creditWarningObj,
    logicExplanation: creditWarningObj?.logicExplanation,
    ruleReference: creditWarningObj?.ruleReference,
  })
})

router.patch("/orders/:id/approve", requireRole(["OWNER", "ADMIN"]), (req: Request, res: Response) => {
  const orderId = req.params.id as string
  const order = db.orders.find((o) => o.id === orderId)

  if (!order) {
    return res.status(404).json({ error: "Order not found" })
  }

  // Stock Over-Allocation Check (Rule 6.1 & Acceptance Test 7)
  for (const item of order.items) {
    const stock = db.stockLedger.find((s) => s.productId === item.productId)
    const available = stock ? stock.availableQty : 0
    if (available < item.qty) {
      const stockErr = createStockOverAllocationError(
        item.productName || "Product",
        item.qty,
        available,
        "kg"
      )
      return res.status(400).json({
        error: stockErr.message,
        customMessage: stockErr,
        logicExplanation: stockErr.logicExplanation,
        ruleReference: stockErr.ruleReference,
        shortage: stockErr.details?.shortage,
      })
    }
  }

  // Reserve stock in ledger (Rule 6.1)
  order.items.forEach((item: any) => {
    const stock = db.stockLedger.find((s) => s.productId === item.productId)
    if (stock) {
      stock.reservedQty += item.qty
      stock.availableQty = Math.max(0, stock.physicalQty - stock.reservedQty)
    }
  })

  order.status = "confirmed"
  order.statusLabel = "Confirmed & Stock Reserved"

  logAudit(
    "APPROVE",
    "ORDER",
    orderId,
    `Order ${orderId} confirmed for ${order.customer}. Stock reserved across all ${order.items.length} items.`
  )

  res.json({ success: true, data: order })
})

// Acceptance Test 15: Modify confirmed order with authorized audit trail
router.patch("/orders/:id/modify", requireRole(["OWNER", "ADMIN"]), (req: Request, res: Response) => {
  const orderId = req.params.id as string
  const { items, notes } = req.body
  const order = db.orders.find((o) => o.id === orderId)

  if (!order) {
    return res.status(404).json({ error: "Order not found" })
  }

  const oldTotal = order.totalAmount
  if (items && Array.isArray(items)) {
    order.items = items
    order.totalAmount = items.reduce((sum: number, it: any) => sum + (it.lineTotal || (it.qty * it.unitPrice)), 0)
  }

  logAudit(
    "UPDATE",
    "ORDER",
    orderId,
    `Order ${orderId} modified. Notes: ${notes || "Quantity revised"}. Total changed from ₹${oldTotal} to ₹${order.totalAmount}`
  )

  res.json({ success: true, data: order })
})

router.patch("/orders/:id/status", requireRole(["OWNER", "ADMIN"]), (req: Request, res: Response) => {
  const orderId = req.params.id as string
  const { status, statusLabel, notes, vehicleNo } = req.body
  const order = db.orders.find((o) => o.id === orderId)

  if (!order) {
    return res.status(404).json({ error: "Order not found" })
  }

  // If already dispatched, do NOT deduct inventory again (Rule 29 & Rule 38)
  const isAlreadyDispatched = ["dispatched", "out_for_delivery", "delivered", "completed"].includes(order.status)

  order.status = status
  order.statusLabel = statusLabel || status

  if ((status === "dispatched" || status === "out_for_delivery") && !isAlreadyDispatched) {
    const targetVehicle = vehicleNo || "KA-01-AB-1234"
    let trip = db.deliveryTrips.find((t) => t.vehicleNo === targetVehicle) || db.deliveryTrips[0]
    if (trip) {
      const alreadyInTrip = trip.orders.some((o: any) => o.orderId === orderId)
      if (!alreadyInTrip) {
        const estWeight = (order.items || []).reduce((sum: number, it: any) => sum + (it.qty || 25), 0) || 120
        trip.orders.push({
          orderId: order.id,
          customer: order.customer,
          address: order.customer === "Hotel Annapoorna" 
            ? "7th Main Road, Malleshwaram 4th Block, Bangalore"
            : order.customer === "Saravana Bhavan Grand"
            ? "12th Cross, Indiranagar 100ft Road, Bangalore"
            : "Commercial Market Road, Central District, Bangalore",
          amount: order.totalAmount,
          weightKg: estWeight,
          sequence: trip.orders.length + 1,
          status: "Pending",
        })
        trip.totalLoadKg = (trip.totalLoadKg || 0) + estWeight
      }
    }

    // Deduct physical inventory upon dispatch exactly once (Rules 6.1 & 8.2)
    order.items?.forEach((item: any) => {
      const stock = db.stockLedger.find((s) => s.productId === item.productId)
      if (stock) {
        stock.physicalQty = Math.max(0, stock.physicalQty - item.qty)
        stock.reservedQty = Math.max(0, stock.reservedQty - item.qty)
      }
    })
  }

  logAudit("UPDATE", "ORDER", orderId, `Status updated to ${status}. ${notes || ""}`)
  res.json({ success: true, data: order })
})

// Explicit Order Dispatch Route (Idempotent single stock deduction - Rule 29 & Acceptance Test 9)
router.post("/orders/:id/dispatch", requireRole(["OWNER", "ADMIN"]), (req: Request, res: Response) => {
  const orderId = req.params.id as string
  const { vehicleNo, driver, notes } = req.body
  const order = db.orders.find((o) => o.id === orderId)

  if (!order) {
    return res.status(404).json({ error: "Order not found" })
  }

  // Idempotency check: If already dispatched, do NOT deduct inventory again!
  if (["dispatched", "out_for_delivery", "delivered", "completed"].includes(order.status)) {
    const dispatchWarn = createDoubleDispatchWarning(orderId, order.status)
    return res.status(200).json({
      success: true,
      message: dispatchWarn.message,
      warning: dispatchWarn,
      logicExplanation: dispatchWarn.logicExplanation,
      ruleReference: dispatchWarn.ruleReference,
      data: { order },
    })
  }

  order.status = "dispatched"
  order.statusLabel = "Dispatched"

  const targetVehicle = vehicleNo || "KA-01-AB-1234"
  let trip = db.deliveryTrips.find((t) => t.vehicleNo === targetVehicle) || db.deliveryTrips[0]
  if (trip) {
    const alreadyInTrip = trip.orders.some((o: any) => o.orderId === orderId)
    if (!alreadyInTrip) {
      const estWeight = (order.items || []).reduce((sum: number, it: any) => sum + (it.qty || 25), 0) || 120
      trip.orders.push({
        orderId: order.id,
        customer: order.customer,
        address: order.customer === "Hotel Annapoorna" 
          ? "7th Main Road, Malleshwaram 4th Block, Bangalore"
          : order.customer === "Saravana Bhavan Grand"
          ? "12th Cross, Indiranagar 100ft Road, Bangalore"
          : "Commercial Market Road, Central District, Bangalore",
        amount: order.totalAmount,
        weightKg: estWeight,
        sequence: trip.orders.length + 1,
        status: "Pending",
      })
      trip.totalLoadKg = (trip.totalLoadKg || 0) + estWeight
    }
  }

  // Deduct physical inventory exactly once upon dispatch
  order.items?.forEach((item: any) => {
    const stock = db.stockLedger.find((s) => s.productId === item.productId)
    if (stock) {
      stock.physicalQty = Math.max(0, stock.physicalQty - item.qty)
      stock.reservedQty = Math.max(0, stock.reservedQty - item.qty)
    }
  })

  logAudit("DISPATCH", "ORDER", orderId, `Dispatched to vehicle ${targetVehicle} (Driver: ${driver || "Ramesh Kumar"}). ${notes || ""}`)
  res.json({ success: true, data: { order, trip } })
})

// Driver Manifest Route
router.get("/driver/manifest", (req: Request, res: Response) => {
  const { vehicle } = req.query
  const targetVehicle = (vehicle as string) || "KA-01-AB-1234"
  const trip = db.deliveryTrips.find((t) => t.vehicleNo === targetVehicle) || db.deliveryTrips[0]
  res.json({ data: trip })
})

router.post("/orders/:id/cancel", requireRole(["OWNER", "ADMIN"]), (req: Request, res: Response) => {
  const orderId = req.params.id as string
  const { reason } = req.body
  const order = db.orders.find((o) => o.id === orderId)

  if (!order) {
    return res.status(404).json({ error: "Order not found" })
  }

  // Release reserved stock ONLY if it was in a reserved state (Rule 12.30 & Rule 36)
  if (["confirmed", "reserved", "picking", "packed"].includes(order.status)) {
    order.items.forEach((item: any) => {
      const stock = db.stockLedger.find((s) => s.productId === item.productId)
      if (stock) {
        stock.reservedQty = Math.max(0, stock.reservedQty - item.qty)
        stock.availableQty = stock.physicalQty - stock.reservedQty
      }
    })
  }

  order.status = "cancelled"
  order.statusLabel = "Cancelled"

  logAudit(
    "CANCEL",
    "ORDER",
    orderId,
    `Order cancelled: ${reason || "User requested"}. Released stock reservations.`
  )

  res.json({ success: true, data: order })
})

// ─────────────────────────────────────────────────────────────
// 4. STOCK & INVENTORY
// ─────────────────────────────────────────────────────────────
router.get("/stock", (req: Request, res: Response) => {
  res.json({ data: db.stockLedger })
})

router.post("/stock/adjust", requireRole(["OWNER", "ADMIN"]), (req: Request, res: Response) => {
  const { productId, productName, warehouse, qty, reason, reference } = req.body
  const numQty = Number(qty)

  if (isNaN(numQty) || numQty <= 0) {
    const msg = createInvalidInputError("qty", qty, "Stock adjustment quantity must be a positive number")
    return res.status(400).json({ error: msg.message, customMessage: msg, logicExplanation: msg.logicExplanation, ruleReference: msg.ruleReference })
  }

  // Find stock ledger entry by productId or productName
  let stock = db.stockLedger.find((s) => s.productId === Number(productId))
  if (!stock && productName) {
    stock = db.stockLedger.find((s) => s.productName.toLowerCase() === String(productName).toLowerCase())
  }

  if (!stock) {
    return res.status(404).json({ error: "Stock ledger entry for commodity not found" })
  }

  stock.physicalQty += numQty
  stock.availableQty += numQty

  logAudit(
    "ADJUSTMENT",
    "STOCK_LEDGER",
    stock.productName,
    `Stock increased by ${numQty} units. Warehouse: ${warehouse || stock.warehouse}. Reason: ${reason || "Manual Adjustment / Surplus Inward"}. Ref: ${reference || "Direct"}`
  )

  res.status(200).json({
    success: true,
    message: `Successfully increased stock for ${stock.productName} by ${numQty} units.`,
    data: stock,
  })
})

router.post("/stock/spoilage", requireRole(["OWNER", "ADMIN"]), (req: Request, res: Response) => {
  const { productName, warehouse, qty, unit, estimatedLoss, reason } = req.body

  const numQty = Number(qty)
  if (isNaN(numQty) || numQty <= 0) {
    const msg = createInvalidInputError("qty", qty, "Spoilage quantity must be a positive number")
    return res.status(400).json({ error: msg.message, customMessage: msg, logicExplanation: msg.logicExplanation, ruleReference: msg.ruleReference })
  }

  const newLog = {
    id: Date.now(),
    date: new Date().toISOString().split("T")[0],
    productName,
    warehouse: warehouse || "Central Cold Storage Yard A",
    qty: numQty,
    unit: unit || "kg",
    estimatedLoss: Number(estimatedLoss) || 0,
    reason: reason || "Transit damage/crushed",
    approvedBy: "Rajesh Kumar (Owner)",
  }

  db.spoilageLogs.unshift(newLog)

  // Deduct from physical stock
  const prod = db.products.find((p) => p.name === productName)
  if (prod) {
    const stock = db.stockLedger.find((s) => s.productId === prod.id)
    if (stock) {
      stock.physicalQty = Math.max(0, stock.physicalQty - newLog.qty)
      stock.availableQty = Math.max(0, stock.physicalQty - stock.reservedQty)
      stock.wastedQty += newLog.qty
    }
  }

  logAudit(
    "ADJUSTMENT",
    "SPOILAGE",
    productName,
    `Logged ${qty} ${unit} spoilage. Est Loss: ₹${estimatedLoss}. Reason: ${reason}`
  )

  res.status(201).json({ success: true, data: newLog })
})

// ─────────────────────────────────────────────────────────────
// 5. PURCHASES & GOODS RECEIPT (Protected: Rule 33)
// ─────────────────────────────────────────────────────────────
router.get("/suppliers", requireRole(["OWNER", "ADMIN"]), (req: Request, res: Response) => {
  res.json({ data: db.suppliers })
})

router.get("/purchases", requireRole(["OWNER", "ADMIN"]), (req: Request, res: Response) => {
  res.json({ data: db.purchaseOrders })
})

router.post("/purchases", requireRole(["OWNER", "ADMIN"]), (req: Request, res: Response) => {
  const { supplier, supplierId, items, totalAmount } = req.body
  const poNum = `PO-2026-${String(Math.floor(415 + Math.random() * 50)).padStart(5, "0")}`

  const newPO = {
    id: `po-${Date.now()}`,
    poNumber: poNum,
    supplier: supplier || "APMC Supplier",
    supplierId: supplierId || 1,
    date: new Date().toISOString().split("T")[0],
    status: "Ordered",
    totalAmount: Number(totalAmount) || 35000,
    items: items || [],
  }

  db.purchaseOrders.unshift(newPO)
  logAudit("CREATE", "PURCHASE_ORDER", poNum, `Created PO for ${newPO.supplier}`)
  res.status(201).json({ success: true, data: newPO })
})

router.post("/goods-receipt", requireRole(["OWNER", "ADMIN"]), (req: Request, res: Response) => {
  const {
    poNumber,
    supplier,
    orderedQty,
    receivedWeight,
    acceptedQty,
    damagedQty,
    rejectedQty,
    discrepancyNote,
    productName,
    warehouse,
  } = req.body

  const grNumber = `GR-2026-${String(Math.floor(390 + Math.random() * 50)).padStart(5, "0")}`
  const newGR = {
    id: `gr-${Date.now()}`,
    grNumber,
    poNumber: poNumber || "PO-2026-00412",
    supplier: supplier || "APMC Supplier",
    receiptDate: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    orderedQty: Number(orderedQty),
    receivedWeight: Number(receivedWeight),
    acceptedQty: Number(acceptedQty),
    damagedQty: Number(damagedQty) || 0,
    rejectedQty: Number(rejectedQty) || 0,
    discrepancyNote: discrepancyNote || "Weighbridge verification complete.",
    productName: productName || "Tomato Hybrid",
    warehouse: warehouse || "Central Cold Storage Yard A",
  }

  db.goodsReceipts.unshift(newGR)

  // ONLY ACCEPTED QTY INCREASES PHYSICAL & AVAILABLE STOCK (Rule 5.3 & 6.1)
  const prod = db.products.find((p) => p.name === newGR.productName)
  if (prod) {
    const stock = db.stockLedger.find((s) => s.productId === prod.id)
    if (stock) {
      stock.physicalQty += newGR.acceptedQty
      stock.availableQty += newGR.acceptedQty
      stock.wastedQty += newGR.damagedQty
    }
  }

  logAudit(
    "CREATE",
    "GOODS_RECEIPT",
    grNumber,
    `Goods Receipt logged for ${newGR.productName}. Ordered: ${newGR.orderedQty}, Accepted: ${newGR.acceptedQty}. Inventory increased by ${newGR.acceptedQty}.`
  )

  res.status(201).json({ success: true, data: newGR })
})

// ─────────────────────────────────────────────────────────────
// 6. DELIVERY & PROOF OF DELIVERY (POD)
// ─────────────────────────────────────────────────────────────
router.get("/delivery/trips", requireRole(["OWNER", "ADMIN", "DRIVER"]), (req: Request, res: Response) => {
  res.json({ data: db.deliveryTrips })
})

router.post("/delivery/trips/:id/dispatch", requireRole(["OWNER", "ADMIN"]), (req: Request, res: Response) => {
  const tripId = req.params.id as string
  const trip = db.deliveryTrips.find((t) => t.id === tripId)

  if (!trip) {
    return res.status(404).json({ error: "Trip not found" })
  }

  trip.status = "In Transit"

  // Deduct physical stock exactly once upon dispatch (Rule 6.1 & 8.2)
  trip.orders.forEach((o: any) => {
    const order = db.orders.find((ord) => ord.id === o.orderId)
    if (order && !["dispatched", "out_for_delivery", "delivered"].includes(order.status)) {
      order.status = "dispatched"
      order.statusLabel = "Dispatched"
      order.items?.forEach((item: any) => {
        const stock = db.stockLedger.find((s) => s.productId === item.productId)
        if (stock) {
          stock.physicalQty = Math.max(0, stock.physicalQty - item.qty)
          stock.reservedQty = Math.max(0, stock.reservedQty - item.qty)
        }
      })
    }
  })

  logAudit("DISPATCH", "DELIVERY_TRIP", tripId, `Trip ${trip.tripNo} dispatched. Stock deducted from physical inventory.`)
  res.json({ success: true, data: trip })
})

router.post("/delivery/pod", requireRole(["OWNER", "ADMIN", "DRIVER"]), (req: Request, res: Response) => {
  const { tripId, orderId, receiverName, signature, shortageNote, collectedAmount, method } = req.body
  const trip = db.deliveryTrips.find((t) => t.id === tripId)

  if (trip) {
    const orderItem = trip.orders.find((o: any) => o.orderId === orderId)
    if (orderItem) {
      orderItem.status = shortageNote ? "Shortage" : "Delivered"
      orderItem.receiverName = receiverName
      orderItem.podSignature = signature
      orderItem.shortageNote = shortageNote
      orderItem.collectedAmount = Number(collectedAmount) || 0

      if (method === "CASH") trip.collectedCash += Number(collectedAmount) || 0
      if (method === "UPI") trip.collectedUpi += Number(collectedAmount) || 0
    }
  }

  const order = db.orders.find((o) => o.id === orderId)
  if (order) {
    order.status = "delivered"
    order.statusLabel = "Delivered (POD Captured)"
    if (Number(collectedAmount) >= order.totalAmount) {
      order.paymentStatus = "Paid"
    } else if (Number(collectedAmount) > 0) {
      order.paymentStatus = "Partial"
    }
  }

  logAudit(
    "UPDATE",
    "POD",
    orderId,
    `Delivery confirmed by ${receiverName}. Collected ₹${collectedAmount} via ${method || "Cash"}.`
  )

  res.json({ success: true, message: "POD recorded successfully" })
})

// ─────────────────────────────────────────────────────────────
// 7. BILLING, INVOICES & PAYMENTS
// ─────────────────────────────────────────────────────────────
router.get("/invoices", enforceTenantIsolation, (req: Request, res: Response) => {
  const { customerId } = req.query
  let list = db.invoices

  if (customerId) {
    // Look up customer name or id
    const cust = db.customers.find((c) => c.id === customerId)
    if (cust) {
      list = list.filter((i) => i.customer === cust.name)
    }
  }

  res.json({ data: list })
})

router.post("/payments", requireRole(["OWNER", "ADMIN"]), (req: Request, res: Response) => {
  const { invoiceNo, amount, method, customer } = req.body
  const numAmount = Number(amount)

  if (isNaN(numAmount) || numAmount <= 0) {
    const msg = createInvalidInputError("amount", amount, "Payment amount must be a positive number")
    return res.status(400).json({ error: msg.message, customMessage: msg, logicExplanation: msg.logicExplanation, ruleReference: msg.ruleReference })
  }

  const inv = db.invoices.find((i) => i.invoiceNo === invoiceNo)
  if (inv) {
    inv.amountPaid += numAmount
    inv.balanceDue = Math.max(0, inv.totalAmount - inv.amountPaid)
    inv.paymentStatus = inv.balanceDue === 0 ? "Paid" : "Partial"
  }

  db.payments.unshift({
    id: Date.now(),
    invoiceNo,
    customer: customer || inv?.customer || "Customer",
    amount: numAmount,
    method: method || "UPI",
    date: new Date().toISOString().split("T")[0],
  })

  logAudit("PAYMENT", "INVOICE", invoiceNo, `Payment of ₹${numAmount} recorded via ${method}`)
  res.status(201).json({ success: true, data: inv })
})

// ─────────────────────────────────────────────────────────────
// 8. AUDIT LOGS (Protected: Rule 32 & 33)
// ─────────────────────────────────────────────────────────────
router.get("/audit-logs", requireRole(["OWNER", "ADMIN"]), (req: Request, res: Response) => {
  res.json({ data: db.auditLogs })
})
