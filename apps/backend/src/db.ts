// In-memory relational state engine for Mandi Connect Backend API
// Implements business rules, stock reservation, and audit trails

export interface DBState {
  products: any[]
  customerPrices: any[]
  stockLedger: any[]
  customers: any[]
  suppliers: any[]
  purchaseOrders: any[]
  goodsReceipts: any[]
  orders: any[]
  deliveryTrips: any[]
  invoices: any[]
  payments: any[]
  auditLogs: any[]
  spoilageLogs: any[]
}

export function getInitialDbState(): DBState {
  return {
    products: [
      { id: 1, sku: "VEG-TOM-01", name: "Tomato Hybrid", category: "Vegetables", unit: "kg", purchasePrice: 28, sellingPrice: 35, minStockLevel: 200, status: "ACTIVE" },
      { id: 2, sku: "VEG-ONI-02", name: "Nashik Red Onion", category: "Vegetables", unit: "kg", purchasePrice: 38, sellingPrice: 46, minStockLevel: 500, status: "ACTIVE" },
      { id: 3, sku: "VEG-POT-03", name: "Agra Potato (Special)", category: "Vegetables", unit: "kg", purchasePrice: 22, sellingPrice: 28, minStockLevel: 400, status: "ACTIVE" },
      { id: 4, sku: "VEG-CHI-04", name: "Green Chilli G4", category: "Vegetables", unit: "kg", purchasePrice: 82, sellingPrice: 95, minStockLevel: 30, status: "ACTIVE" },
      { id: 5, sku: "VEG-CAR-05", name: "Ooty Carrot (Washed)", category: "Vegetables", unit: "kg", purchasePrice: 50, sellingPrice: 62, minStockLevel: 100, status: "ACTIVE" },
      { id: 6, sku: "VEG-BEA-06", name: "French Beans", category: "Vegetables", unit: "kg", purchasePrice: 44, sellingPrice: 55, minStockLevel: 80, status: "ACTIVE" },
      { id: 7, sku: "RICE-PON-25", name: "Ponni Boiled Rice (25kg)", category: "Rice", unit: "bag", standardWeightKg: 25, purchasePrice: 1220, sellingPrice: 1350, minStockLevel: 50, brand: "Tanjore Gold", status: "ACTIVE" },
      { id: 8, sku: "RICE-SONA-25", name: "Sona Masoori Rice (25kg)", category: "Rice", unit: "bag", standardWeightKg: 25, purchasePrice: 1380, sellingPrice: 1520, minStockLevel: 40, brand: "Kurnool Royal", status: "ACTIVE" },
      { id: 9, sku: "GROC-DAL-01", name: "Kadalai Paruppu (Chana Dal)", category: "Groceries", unit: "kg", purchasePrice: 78, sellingPrice: 92, minStockLevel: 150, status: "ACTIVE" },
    ],

    customerPrices: [
      { customerId: "cust-1", productId: 1, price: 32 },
      { customerId: "cust-1", productId: 2, price: 44 },
      { customerId: "cust-1", productId: 7, price: 1310 },
      { customerId: "cust-2", productId: 8, price: 1490 },
      { customerId: "cust-2", productId: 2, price: 45 },
      { customerId: "cust-3", productId: 4, price: 88 },
      { customerId: "cust-3", productId: 5, price: 56 },
    ],

    stockLedger: [
      { productId: 1, productName: "Tomato Hybrid", warehouse: "Central Cold Storage Yard A", physicalQty: 850, reservedQty: 320, availableQty: 530, wastedQty: 15, reorderThreshold: 200, avgCost: 28 },
      { productId: 2, productName: "Nashik Red Onion", warehouse: "Central Cold Storage Yard A", physicalQty: 2400, reservedQty: 950, availableQty: 1450, wastedQty: 40, reorderThreshold: 500, avgCost: 38 },
      { productId: 3, productName: "Agra Potato (Special)", warehouse: "Central Cold Storage Yard A", physicalQty: 1600, reservedQty: 400, availableQty: 1200, wastedQty: 10, reorderThreshold: 400, avgCost: 22 },
      { productId: 4, productName: "Green Chilli G4", warehouse: "Central Cold Storage Yard A", physicalQty: 45, reservedQty: 35, availableQty: 10, wastedQty: 2, reorderThreshold: 30, avgCost: 82 },
      { productId: 5, productName: "Ooty Carrot (Washed)", warehouse: "Central Cold Storage Yard A", physicalQty: 380, reservedQty: 120, availableQty: 260, wastedQty: 8, reorderThreshold: 100, avgCost: 50 },
      { productId: 6, productName: "French Beans", warehouse: "Central Cold Storage Yard A", physicalQty: 290, reservedQty: 90, availableQty: 200, wastedQty: 5, reorderThreshold: 80, avgCost: 44 },
      { productId: 7, productName: "Ponni Boiled Rice (25kg)", warehouse: "Rice Godown B (Hebbal)", physicalQty: 140, reservedQty: 60, availableQty: 80, wastedQty: 1, reorderThreshold: 50, avgCost: 1220 },
      { productId: 8, productName: "Sona Masoori Rice (25kg)", warehouse: "Rice Godown B (Hebbal)", physicalQty: 110, reservedQty: 40, availableQty: 70, wastedQty: 0, reorderThreshold: 40, avgCost: 1380 },
      { productId: 9, productName: "Kadalai Paruppu", warehouse: "Groceries Depot C", physicalQty: 600, reservedQty: 180, availableQty: 420, wastedQty: 0, reorderThreshold: 150, avgCost: 78 },
    ],

    customers: [
      { id: "cust-1", name: "Hotel Annapoorna", phone: "+91 98450 12345", creditLimit: 150000, currentBalance: 42000, terms: "Credit 7 Days" },
      { id: "cust-2", name: "Saravana Bhavan Grand", phone: "+91 98860 67890", creditLimit: 250000, currentBalance: 85000, terms: "UPI Instant" },
      { id: "cust-3", name: "Green Leaf Mess", phone: "+91 94480 34567", creditLimit: 50000, currentBalance: 14400, terms: "Credit 3 Days" },
      { id: "cust-4", name: "Sri Lakshmi Supermarket", phone: "+91 98451 98765", creditLimit: 100000, currentBalance: 28000, terms: "Credit 14 Days" },
    ],

    suppliers: [
      { id: 1, name: "APMC Commission Agent 42", category: "Vegetables", phone: "+91 94481 11223", outstanding: 85000 },
      { id: 2, name: "Nashik Farmers Onion Syndicate", category: "Vegetables", phone: "+91 98220 54321", outstanding: 120000 },
      { id: 3, name: "Tanjore Delta Modern Rice Mills", category: "Rice", phone: "+91 94432 98765", outstanding: 95000 },
      { id: 4, name: "Karnataka Agro Pulses Traders", category: "Groceries", phone: "+91 98450 77889", outstanding: 12000 },
    ],

    purchaseOrders: [
      {
        id: "po-1",
        poNumber: "PO-2026-00412",
        supplier: "APMC Commission Agent 42",
        supplierId: 1,
        date: "2026-10-29",
        status: "Approved",
        totalAmount: 42000,
        items: [
          { productId: 1, productName: "Tomato Hybrid", orderedQty: 1000, receivedQty: 1000, purchaseRate: 28 },
          { productId: 4, productName: "Green Chilli G4", orderedQty: 200, receivedQty: 180, purchaseRate: 82 },
        ],
      },
    ],

    goodsReceipts: [
      {
        id: "gr-1",
        grNumber: "GR-2026-00388",
        poNumber: "PO-2026-00412",
        supplier: "APMC Commission Agent 42",
        receiptDate: "2026-10-29 06:30 AM",
        orderedQty: 200,
        receivedWeight: 195,
        acceptedQty: 180,
        damagedQty: 15,
        rejectedQty: 5,
        discrepancyNote: "5 kg transport loss; 15 kg damaged in transit logged to spoilage.",
        productName: "Green Chilli G4",
        warehouse: "Central Cold Storage Yard A",
      },
    ],

    orders: [
      {
        id: "MC-8921",
        customer: "Hotel Annapoorna",
        customerId: "cust-1",
        source: "Receiver App",
        time: "Today, 08:45 AM",
        totalAmount: 34250,
        paymentStatus: "Unpaid",
        status: "pending",
        statusLabel: "Pending Approval",
        items: [
          { productId: 1, productName: "Tomato Hybrid", qty: 50, unitPrice: 32, lineTotal: 1600 },
          { productId: 2, productName: "Nashik Red Onion", qty: 30, unitPrice: 44, lineTotal: 1320 },
          { productId: 7, productName: "Ponni Boiled Rice (25kg)", qty: 2, unitPrice: 1310, lineTotal: 2620 },
          { productId: 4, productName: "Green Chilli G4", qty: 15, unitPrice: 90, lineTotal: 1350 },
        ],
      },
      {
        id: "MC-8920",
        customer: "Saravana Bhavan Grand",
        customerId: "cust-2",
        source: "WhatsApp",
        time: "Today, 08:15 AM",
        totalAmount: 36680,
        paymentStatus: "Paid",
        status: "confirmed",
        statusLabel: "Confirmed & Reserved",
        items: [
          { productId: 8, productName: "Sona Masoori Rice (25kg)", qty: 20, unitPrice: 1490, lineTotal: 29800 },
          { productId: 2, productName: "Nashik Red Onion", qty: 100, unitPrice: 45, lineTotal: 4500 },
          { productId: 3, productName: "Agra Potato (Special)", qty: 80, unitPrice: 26, lineTotal: 2080 },
        ],
      },
    ],

    deliveryTrips: [
      {
        id: "trip-104",
        tripNo: "TRIP-2026-00104",
        driver: "Ramesh Kumar",
        vehicleNo: "KA-01-AB-1234",
        vehicleCapacityKg: 1500,
        totalLoadKg: 780,
        status: "In Transit",
        orders: [
          {
            orderId: "MC-8918",
            customer: "Sri Lakshmi Supermarket",
            address: "Malleshwaram, Bangalore",
            amount: 18100,
            weightKg: 300,
            status: "Pending",
          },
        ],
        collectedCash: 0,
        collectedUpi: 0,
      },
    ],

    invoices: [
      {
        id: "inv-1",
        invoiceNo: "INV-2026-00381",
        orderId: "MC-8920",
        customer: "Saravana Bhavan Grand",
        date: "2026-10-30",
        totalAmount: 36680,
        amountPaid: 36680,
        balanceDue: 0,
        paymentStatus: "Paid",
      },
    ],

    payments: [
      { id: 1, invoiceNo: "INV-2026-00381", customer: "Saravana Bhavan Grand", amount: 36680, method: "UPI", date: "2026-10-30" },
    ],

    auditLogs: [
      { id: 1, timestamp: "Today, 08:45 AM", user: "System", action: "CREATE", entity: "ORDER", entityId: "MC-8921", notes: "Hotel Annapoorna placed order" },
    ],

    spoilageLogs: [
      { id: 1, date: "2026-10-29", productName: "Green Chilli G4", warehouse: "Central Cold Storage Yard A", qty: 15, unit: "kg", estimatedLoss: 1230, reason: "Transit damage", approvedBy: "Owner" },
    ],
  }
}

export const db: DBState = getInitialDbState()

export function resetDb(): void {
  const fresh = getInitialDbState()
  Object.keys(fresh).forEach((key) => {
    ;(db as any)[key] = (fresh as any)[key]
  })
}

export function logAudit(action: string, entity: string, entityId: string, notes: string, user = "Rajesh Kumar (Owner)") {
  db.auditLogs.unshift({
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    user,
    action,
    entity,
    entityId,
    notes,
  })
}
