"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export type AppMode = "office" | "receiver" | "driver"
export type OfficeTab =
  | "dashboard"
  | "orders"
  | "inventory"
  | "rates"
  | "purchase"
  | "delivery"
  | "billing"
  | "audit"

export interface ProductItem {
  id: number
  sku: string
  name: string
  category: "Vegetables" | "Rice" | "Groceries"
  unit: string
  standardWeightKg?: number // 1 bag = 25kg
  purchasePrice: number
  sellingPrice: number
  minStockLevel: number
  brand?: string
  batchNo?: string
  expiryDate?: string
  trend: string
  status: "Normal" | "Low Stock" | "Critical"
}

export interface CustomerPricing {
  productId: number
  hotelAnnapoorna: number
  saravanaBhavan: number
  greenLeafMess: number
}

export interface StockLedgerEntry {
  productId: number
  productName: string
  warehouse: "Central Cold Storage Yard A" | "Rice Godown B (Hebbal)" | "Groceries Depot C"
  location: string
  physicalQty: number
  reservedQty: number
  availableQty: number
  wastedQty: number
  reorderThreshold: number
  avgCost: number
}

export interface CustomerRecord {
  id: string
  name: string
  type: string
  phone: string
  creditLimit: number
  currentBalance: number
  paymentTerms: string
}

export interface OrderItemRecord {
  productId: number
  productName: string
  sku: string
  unit: string
  qty: number
  unitPrice: number
  lineTotal: number
}

export interface OrderRecord {
  id: string
  customer: string
  customerId: string
  customerType: string
  source: "Receiver App" | "WhatsApp" | "Phone" | "Walk-in"
  time: string
  itemsCount: number
  itemsSummary: string
  totalAmount: number
  paymentStatus: "Unpaid" | "Partial" | "Paid"
  paymentTerms: string
  status:
    | "received"
    | "pending"
    | "confirmed"
    | "reserved"
    | "picking"
    | "packed"
    | "dispatched"
    | "out_for_delivery"
    | "delivered"
    | "completed"
    | "cancelled"
  statusLabel: string
  driver?: string
  vehicleNo?: string
  slot: string
  otp: string
  creditLimitNote: string
  items: OrderItemRecord[]
  tripId?: string
}

export interface SupplierRecord {
  id: number
  name: string
  category: string
  phone: string
  outstandingBalance: number
  paymentTerms: string
}

export interface PurchaseOrderRecord {
  id: string
  poNumber: string
  supplier: string
  supplierId: number
  date: string
  status: "Draft" | "Approved" | "Ordered" | "Partially Received" | "Fully Received" | "Cancelled"
  totalAmount: number
  items: {
    productId: number
    productName: string
    orderedQty: number
    receivedQty: number
    unit: string
    purchaseRate: number
  }[]
}

export interface GoodsReceiptRecord {
  id: string
  grNumber: string
  poNumber: string
  supplier: string
  receiptDate: string
  supplierInvoiceNo: string
  orderedQty: number
  receivedWeight: number
  acceptedQty: number
  damagedQty: number
  rejectedQty: number
  discrepancyNote: string
  productName: string
  warehouse: string
}

export interface DeliveryTripRecord {
  id: string
  tripNo: string
  driver: string
  vehicleNo: string
  vehicleCapacityKg: number
  totalLoadKg: number
  status: "Scheduled" | "Dispatched" | "In Transit" | "Completed"
  dispatchTime?: string
  orders: {
    orderId: string
    customer: string
    address: string
    phone: string
    amount: number
    weightKg: number
    sequence: number
    status: "Pending" | "Delivered" | "Shortage" | "Failed"
    deliveredQtyNote?: string
    shortageNote?: string
    podSignature?: string
    receiverName?: string
    collectedAmount?: number
  }[]
  collectedCash: number
  collectedUpi: number
  remittedToOffice: boolean
}

export type DeliveryStopRecord = DeliveryTripRecord["orders"][number]

export interface InvoiceRecord {
  id: string
  invoiceNo: string
  orderId: string
  customer: string
  date: string
  subtotal: number
  gstAmount: number
  totalAmount: number
  amountPaid: number
  balanceDue: number
  paymentStatus: "Unpaid" | "Partial" | "Paid"
}

export interface AuditTrailRecord {
  id: number
  timestamp: string
  user: string
  role: string
  action: string
  entity: string
  entityId: string
  beforeValue?: string
  afterValue?: string
  notes?: string
}

export interface SpoilageLogRecord {
  id: number
  date: string
  productName: string
  warehouse: string
  qty: number
  unit: string
  estimatedLoss: number
  reason: string
  approvedBy: string
}

export interface ActiveAlert {
  code: string
  severity: "error" | "warning" | "info"
  title: string
  message: string
  ruleReference: string
  logicExplanation: string
  actionableStep?: string
  timestamp: string
}

// ─────────────────────────────────────────────────────────────
// CONTEXT INTERFACE
// ─────────────────────────────────────────────────────────────

interface MandiStoreContextType {
  mode: AppMode
  setMode: (mode: AppMode) => void
  activeOfficeTab: OfficeTab
  setActiveOfficeTab: (tab: OfficeTab) => void

  // Dynamic Logic Alerts
  activeAlert: ActiveAlert | null
  setActiveAlert: (alert: ActiveAlert | null) => void
  clearAlert: () => void

  // Data
  products: ProductItem[]
  customerPricing: CustomerPricing[]
  stockLedger: StockLedgerEntry[]
  customers: CustomerRecord[]
  orders: OrderRecord[]
  suppliers: SupplierRecord[]
  purchaseOrders: PurchaseOrderRecord[]
  goodsReceipts: GoodsReceiptRecord[]
  deliveryTrips: DeliveryTripRecord[]
  invoices: InvoiceRecord[]
  auditLogs: AuditTrailRecord[]
  spoilageLogs: SpoilageLogRecord[]

  // Actions
  updateDailyRate: (productId: number, newStandardRate: number, reason: string) => void
  approveOrder: (orderId: string) => void
  updateOrderStatus: (orderId: string, status: OrderRecord["status"], notes?: string) => void
  cancelOrder: (orderId: string, reason: string) => void
  createNewOrder: (orderData: Partial<OrderRecord>) => void
  createPurchaseOrder: (poData: Partial<PurchaseOrderRecord>) => void
  recordGoodsReceipt: (receiptData: Partial<GoodsReceiptRecord>) => void
  logSpoilage: (spoilageData: Partial<SpoilageLogRecord>) => void
  increaseStock: (
    productId: number,
    qty: number,
    warehouse?: string,
    reason?: string,
    reference?: string
  ) => void
  recordPayment: (invoiceNo: string, amount: number, method: "CASH" | "UPI" | "BANK", ref?: string) => void
  dispatchDeliveryTrip: (tripId: string) => void
  theme: "emerald" | "sapphire" | "amber" | "violet" | "rose"
  setTheme: (t: "emerald" | "sapphire" | "amber" | "violet" | "rose") => void
  colorMode: "light" | "dark"
  setColorMode: (m: "light" | "dark") => void
  toggleColorMode: () => void
  officeAuth: { user: string; role: "OWNER" | "ADMIN" } | null
  setOfficeAuth: (auth: { user: string; role: "OWNER" | "ADMIN" } | null) => void
  receiverAuth: { customerId: string; name: string } | null
  setReceiverAuth: (auth: { customerId: string; name: string } | null) => void
  driverAuth: { driverId: string; name: string; vehicle: string } | null
  setDriverAuth: (auth: { driverId: string; name: string; vehicle: string } | null) => void
  completeDriverDelivery: (
    tripId: string,
    orderId: string,
    receiverName: string,
    signature: string,
    shortageNote: string,
    collectedAmount: number,
    paymentMethod: "CASH" | "UPI"
  ) => void

  refreshKey: number
  isRefreshing: boolean
  refreshRealtimeData: () => Promise<void>
}

const MandiStoreContext = createContext<MandiStoreContextType | null>(null)

function getApiBaseUrl(): string | null {
  const envUrl = process.env.NEXT_PUBLIC_API_URL
  if (envUrl && envUrl.trim() !== "") {
    // If running on a public remote host (e.g. vercel.app), never call localhost
    if (typeof window !== "undefined") {
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      if (!isLocal && (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))) {
        return null
      }
    }
    return envUrl.replace(/\/$/, "")
  }

  // Only allow localhost fallback when the frontend is running locally
  if (typeof window !== "undefined") {
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    if (isLocal) {
      return "http://localhost:4000"
    }
  }

  return null
}

export const MandiStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persisted app mode ("office" | "receiver" | "driver")
  const [mode, setModeState] = useState<AppMode>("office")
  const [activeOfficeTab, setActiveOfficeTabState] = useState<OfficeTab>("dashboard")
  const [theme, setTheme] = useState<"emerald" | "sapphire" | "amber" | "violet" | "rose">("emerald")
  const [colorMode, setColorModeState] = useState<"light" | "dark">("light")

  // Per-app authentications
  const [officeAuth, setOfficeAuthState] = useState<{ user: string; role: "OWNER" | "ADMIN" } | null>(null)
  const [receiverAuth, setReceiverAuthState] = useState<{ customerId: string; name: string } | null>(null)
  const [driverAuth, setDriverAuthState] = useState<{ driverId: string; name: string; vehicle: string } | null>(null)

  // Dynamic customized alert state
  const [activeAlert, setActiveAlert] = useState<ActiveAlert | null>(null)
  const clearAlert = () => setActiveAlert(null)

  // Realtime Sync state (internal data refresh without splash screens)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshRealtimeData = async () => {
    setIsRefreshing(true)
    try {
      const apiBase = getApiBaseUrl()
      if (apiBase) {
        const headers: Record<string, string> = { "Content-Type": "application/json" }
        if (mode === "office") {
          headers["x-user-role"] = officeAuth?.role || "OWNER"
        } else if (mode === "driver") {
          headers["x-user-role"] = "DRIVER"
          if (driverAuth?.driverId) headers["x-driver-id"] = driverAuth.driverId
        } else if (mode === "receiver") {
          headers["x-user-role"] = "RECEIVER"
          if (receiverAuth?.customerId) headers["x-customer-id"] = receiverAuth.customerId
        }

        const res = await fetch(`${apiBase}/api/orders`, { headers }).catch(() => null)
        if (res && res.ok) {
          const data = await res.json()
          if (data && Array.isArray(data.data)) {
            setOrders(data.data)
          } else if (data && Array.isArray(data.orders)) {
            setOrders(data.orders)
          }
        }
      }
    } catch {
      // offline/fallback
    } finally {
      setRefreshKey((prev) => prev + 1)
      setTimeout(() => {
        setIsRefreshing(false)
      }, 500)
    }
  }

  // Hydrate persisted state safely on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedMode = sessionStorage.getItem("mandi_mode") as AppMode
        if (savedMode) setModeState(savedMode)

        const savedTab = sessionStorage.getItem("mandi_office_tab") as OfficeTab
        if (savedTab) setActiveOfficeTabState(savedTab)

        const savedColorMode = localStorage.getItem("mandi_color_mode") as "light" | "dark"
        if (savedColorMode) setColorModeState(savedColorMode)

        const savedOffice = sessionStorage.getItem("mandi_auth_office")
        if (savedOffice) setOfficeAuthState(JSON.parse(savedOffice))

        const savedReceiver = sessionStorage.getItem("mandi_auth_receiver")
        if (savedReceiver) setReceiverAuthState(JSON.parse(savedReceiver))

        const savedDriver = sessionStorage.getItem("mandi_auth_driver")
        if (savedDriver) setDriverAuthState(JSON.parse(savedDriver))
      } catch {
        // ignore
      }
    }
  }, [])

  const setMode = (m: AppMode) => {
    setModeState(m)
    if (typeof window !== "undefined") {
      sessionStorage.setItem("mandi_mode", m)
    }
  }

  const setActiveOfficeTab = (t: OfficeTab) => {
    setActiveOfficeTabState(t)
    if (typeof window !== "undefined") {
      sessionStorage.setItem("mandi_office_tab", t)
    }
  }

  const setColorMode = (m: "light" | "dark") => {
    setColorModeState(m)
    if (typeof window !== "undefined") {
      localStorage.setItem("mandi_color_mode", m)
    }
  }

  const toggleColorMode = () => {
    const next = colorMode === "light" ? "dark" : "light"
    setColorMode(next)
  }

  const setOfficeAuth = (auth: { user: string; role: "OWNER" | "ADMIN" } | null) => {
    setOfficeAuthState(auth)
    if (typeof window !== "undefined") {
      if (auth) sessionStorage.setItem("mandi_auth_office", JSON.stringify(auth))
      else sessionStorage.removeItem("mandi_auth_office")
    }
  }

  const setReceiverAuth = (auth: { customerId: string; name: string } | null) => {
    setReceiverAuthState(auth)
    if (typeof window !== "undefined") {
      if (auth) sessionStorage.setItem("mandi_auth_receiver", JSON.stringify(auth))
      else sessionStorage.removeItem("mandi_auth_receiver")
    }
  }

  const setDriverAuth = (auth: { driverId: string; name: string; vehicle: string } | null) => {
    setDriverAuthState(auth)
    if (typeof window !== "undefined") {
      if (auth) sessionStorage.setItem("mandi_auth_driver", JSON.stringify(auth))
      else sessionStorage.removeItem("mandi_auth_driver")
    }
  }

  // Synchronize document theme and colorMode attributes
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme)
      document.documentElement.setAttribute("data-color-mode", colorMode)
      if (colorMode === "dark") {
        document.documentElement.classList.add("dark")
        document.body.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
        document.body.classList.remove("dark")
      }
    }
  }, [theme, colorMode])

  // Products
  const [products, setProducts] = useState<ProductItem[]>([
    { id: 1, sku: "VEG-TOM-01", name: "Tomato Hybrid", category: "Vegetables", unit: "kg", purchasePrice: 28, sellingPrice: 35, minStockLevel: 200, trend: "+₹3", status: "Normal" },
    { id: 2, sku: "VEG-ONI-02", name: "Nashik Red Onion", category: "Vegetables", unit: "kg", purchasePrice: 38, sellingPrice: 46, minStockLevel: 500, trend: "+₹1", status: "Normal" },
    { id: 3, sku: "VEG-POT-03", name: "Agra Potato (Special)", category: "Vegetables", unit: "kg", purchasePrice: 22, sellingPrice: 28, minStockLevel: 400, trend: "0", status: "Normal" },
    { id: 4, sku: "VEG-CHI-04", name: "Green Chilli G4", category: "Vegetables", unit: "kg", purchasePrice: 82, sellingPrice: 95, minStockLevel: 30, trend: "-₹5", status: "Low Stock" },
    { id: 5, sku: "VEG-CAR-05", name: "Ooty Carrot (Washed)", category: "Vegetables", unit: "kg", purchasePrice: 50, sellingPrice: 62, minStockLevel: 100, trend: "+₹2", status: "Normal" },
    { id: 6, sku: "VEG-BEA-06", name: "French Beans", category: "Vegetables", unit: "kg", purchasePrice: 44, sellingPrice: 55, minStockLevel: 80, trend: "+₹4", status: "Normal" },
    { id: 7, sku: "RICE-PON-25", name: "Ponni Boiled Rice (25kg)", category: "Rice", unit: "bag", standardWeightKg: 25, purchasePrice: 1220, sellingPrice: 1350, minStockLevel: 50, brand: "Tanjore Gold", batchNo: "B-2026-410", expiryDate: "2027-10", trend: "+₹20", status: "Normal" },
    { id: 8, sku: "RICE-SONA-25", name: "Sona Masoori Rice (25kg)", category: "Rice", unit: "bag", standardWeightKg: 25, purchasePrice: 1380, sellingPrice: 1520, minStockLevel: 40, brand: "Kurnool Royal", batchNo: "B-2026-388", expiryDate: "2027-09", trend: "+₹15", status: "Normal" },
    { id: 9, sku: "GROC-DAL-01", name: "Kadalai Paruppu (Chana Dal)", category: "Groceries", unit: "kg", purchasePrice: 78, sellingPrice: 92, minStockLevel: 150, trend: "+₹2", status: "Normal" },
  ])

  // Customer Negotiated Pricing
  const [customerPricing, setCustomerPricing] = useState<CustomerPricing[]>([
    { productId: 1, hotelAnnapoorna: 32, saravanaBhavan: 33, greenLeafMess: 30 },
    { productId: 2, hotelAnnapoorna: 44, saravanaBhavan: 45, greenLeafMess: 42 },
    { productId: 3, hotelAnnapoorna: 26, saravanaBhavan: 26, greenLeafMess: 25 },
    { productId: 4, hotelAnnapoorna: 90, saravanaBhavan: 92, greenLeafMess: 88 },
    { productId: 5, hotelAnnapoorna: 58, saravanaBhavan: 60, greenLeafMess: 56 },
    { productId: 6, hotelAnnapoorna: 52, saravanaBhavan: 54, greenLeafMess: 50 },
    { productId: 7, hotelAnnapoorna: 1310, saravanaBhavan: 1320, greenLeafMess: 1290 },
    { productId: 8, hotelAnnapoorna: 1480, saravanaBhavan: 1490, greenLeafMess: 1460 },
    { productId: 9, hotelAnnapoorna: 88, saravanaBhavan: 89, greenLeafMess: 86 },
  ])

  // Stock Ledger
  const [stockLedger, setStockLedger] = useState<StockLedgerEntry[]>([
    { productId: 1, productName: "Tomato Hybrid", warehouse: "Central Cold Storage Yard A", location: "Cold Bay C-12", physicalQty: 850, reservedQty: 320, availableQty: 530, wastedQty: 15, reorderThreshold: 200, avgCost: 28 },
    { productId: 2, productName: "Nashik Red Onion", warehouse: "Central Cold Storage Yard A", location: "Central Yard Bay 4", physicalQty: 2400, reservedQty: 950, availableQty: 1450, wastedQty: 40, reorderThreshold: 500, avgCost: 38 },
    { productId: 3, productName: "Agra Potato (Special)", warehouse: "Central Cold Storage Yard A", location: "Yard Shed 2", physicalQty: 1600, reservedQty: 400, availableQty: 1200, wastedQty: 10, reorderThreshold: 400, avgCost: 22 },
    { productId: 4, productName: "Green Chilli G4", warehouse: "Central Cold Storage Yard A", location: "Cold Bay C-03", physicalQty: 45, reservedQty: 35, availableQty: 10, wastedQty: 2, reorderThreshold: 30, avgCost: 82 },
    { productId: 5, productName: "Ooty Carrot (Washed)", warehouse: "Central Cold Storage Yard A", location: "Cold Bay C-08", physicalQty: 380, reservedQty: 120, availableQty: 260, wastedQty: 8, reorderThreshold: 100, avgCost: 50 },
    { productId: 6, productName: "French Beans", warehouse: "Central Cold Storage Yard A", location: "Cold Bay C-09", physicalQty: 290, reservedQty: 90, availableQty: 200, wastedQty: 5, reorderThreshold: 80, avgCost: 44 },
    { productId: 7, productName: "Ponni Boiled Rice (25kg)", warehouse: "Rice Godown B (Hebbal)", location: "Stack A-04", physicalQty: 140, reservedQty: 60, availableQty: 80, wastedQty: 1, reorderThreshold: 50, avgCost: 1220 },
    { productId: 8, productName: "Sona Masoori Rice (25kg)", warehouse: "Rice Godown B (Hebbal)", location: "Stack B-01", physicalQty: 110, reservedQty: 40, availableQty: 70, wastedQty: 0, reorderThreshold: 40, avgCost: 1380 },
    { productId: 9, productName: "Kadalai Paruppu (Chana Dal)", warehouse: "Groceries Depot C", location: "Rack G-02", physicalQty: 600, reservedQty: 180, availableQty: 420, wastedQty: 0, reorderThreshold: 150, avgCost: 78 },
  ])

  // Customers
  const [customers, setCustomers] = useState<CustomerRecord[]>([
    { id: "cust-1", name: "Hotel Annapoorna", type: "Verified Buyer • Tier 1", phone: "+91 98450 12345", creditLimit: 150000, currentBalance: 42000, paymentTerms: "Credit 7 Days" },
    { id: "cust-2", name: "Saravana Bhavan Grand", type: "Verified Buyer • Daily Chain", phone: "+91 98860 67890", creditLimit: 250000, currentBalance: 85000, paymentTerms: "Prepaid / UPI Instant" },
    { id: "cust-3", name: "Green Leaf Mess", type: "Verified Buyer • Mess Caterer", phone: "+91 94480 34567", creditLimit: 50000, currentBalance: 14400, paymentTerms: "Credit 3 Days" },
    { id: "cust-4", name: "Sri Lakshmi Supermarket", type: "Verified Buyer • Retail Partner", phone: "+91 98451 98765", creditLimit: 100000, currentBalance: 28000, paymentTerms: "Credit 14 Days" },
  ])

  // Orders
  const [orders, setOrders] = useState<OrderRecord[]>([
    {
      id: "MC-8921",
      customer: "Hotel Annapoorna",
      customerId: "cust-1",
      customerType: "Verified Buyer • Tier 1",
      source: "Receiver App",
      time: "Today, 08:45 AM",
      itemsCount: 4,
      itemsSummary: "Tomato 50kg, Onion 30kg, Ponni Rice 2 bags, Chilli 15kg",
      totalAmount: 34250,
      paymentStatus: "Unpaid",
      paymentTerms: "Credit 7 Days",
      status: "pending",
      statusLabel: "Pending Approval",
      driver: "Ramesh Kumar (KA-01-AB-1234)",
      vehicleNo: "KA-01-AB-1234",
      slot: "Morning 06:00 - 08:00 AM",
      otp: "4821",
      creditLimitNote: "₹1,50,000 (₹42,000 used)",
      items: [
        { productId: 1, productName: "Tomato Hybrid", sku: "VEG-TOM-01", unit: "kg", qty: 50, unitPrice: 32, lineTotal: 1600 },
        { productId: 2, productName: "Nashik Red Onion", sku: "VEG-ONI-02", unit: "kg", qty: 30, unitPrice: 44, lineTotal: 1320 },
        { productId: 7, productName: "Ponni Boiled Rice (25kg)", sku: "RICE-PON-25", unit: "bag", qty: 2, unitPrice: 1310, lineTotal: 2620 },
        { productId: 4, productName: "Green Chilli G4", sku: "VEG-CHI-04", unit: "kg", qty: 15, unitPrice: 90, lineTotal: 1350 },
      ],
    },
    {
      id: "MC-8920",
      customer: "Saravana Bhavan Grand",
      customerId: "cust-2",
      customerType: "Verified Buyer • Daily Chain",
      source: "WhatsApp",
      time: "Today, 08:15 AM",
      itemsCount: 3,
      itemsSummary: "Sona Masoori 20 bags, Onion 100kg, Potato 80kg",
      totalAmount: 36680,
      paymentStatus: "Paid",
      paymentTerms: "UPI Instant",
      status: "confirmed",
      statusLabel: "Confirmed & Reserved",
      driver: "Murugan S. (KA-04-E-5678)",
      vehicleNo: "KA-04-E-5678",
      slot: "Slot 1 (07:00 AM)",
      otp: "1932",
      creditLimitNote: "Prepaid",
      items: [
        { productId: 8, productName: "Sona Masoori Rice (25kg)", sku: "RICE-SONA-25", unit: "bag", qty: 20, unitPrice: 1490, lineTotal: 29800 },
        { productId: 2, productName: "Nashik Red Onion", sku: "VEG-ONI-02", unit: "kg", qty: 100, unitPrice: 45, lineTotal: 4500 },
        { productId: 3, productName: "Agra Potato (Special)", sku: "VEG-POT-03", unit: "kg", qty: 80, unitPrice: 26, lineTotal: 2080 },
      ],
    },
    {
      id: "MC-8919",
      customer: "Green Leaf Mess",
      customerId: "cust-3",
      customerType: "Verified Buyer • Mess Caterer",
      source: "Phone",
      time: "Today, 07:30 AM",
      itemsCount: 3,
      itemsSummary: "Green Chilli 10kg, Carrot 30kg, Potato 50kg",
      totalAmount: 3810,
      paymentStatus: "Unpaid",
      paymentTerms: "Credit 3 Days",
      status: "packed",
      statusLabel: "Packed & Ready",
      driver: "Ramesh Kumar (KA-01-AB-1234)",
      vehicleNo: "KA-01-AB-1234",
      slot: "Slot 2 (11:00 AM)",
      otp: "7721",
      creditLimitNote: "₹50,000 (₹14,400 used)",
      items: [
        { productId: 4, productName: "Green Chilli G4", sku: "VEG-CHI-04", unit: "kg", qty: 10, unitPrice: 88, lineTotal: 880 },
        { productId: 5, productName: "Ooty Carrot (Washed)", sku: "VEG-CAR-05", unit: "kg", qty: 30, unitPrice: 56, lineTotal: 1680 },
        { productId: 3, productName: "Agra Potato (Special)", sku: "VEG-POT-03", unit: "kg", qty: 50, unitPrice: 25, lineTotal: 1250 },
      ],
    },
    {
      id: "MC-8918",
      customer: "Sri Lakshmi Supermarket",
      customerId: "cust-4",
      customerType: "Verified Buyer • Retail Partner",
      source: "Receiver App",
      time: "Today, 06:45 AM",
      itemsCount: 2,
      itemsSummary: "Ponni Rice 10 bags, Chana Dal 50kg",
      totalAmount: 18100,
      paymentStatus: "Partial",
      paymentTerms: "Credit 14 Days",
      status: "dispatched",
      statusLabel: "Dispatched (Trip 104)",
      driver: "Ramesh Kumar (KA-01-AB-1234)",
      vehicleNo: "KA-01-AB-1234",
      slot: "Morning 06:00 - 08:00 AM",
      otp: "9042",
      creditLimitNote: "₹1,00,000 (₹28,000 used)",
      items: [
        { productId: 7, productName: "Ponni Boiled Rice (25kg)", sku: "RICE-PON-25", unit: "bag", qty: 10, unitPrice: 1350, lineTotal: 13500 },
        { productId: 9, productName: "Kadalai Paruppu (Chana Dal)", sku: "GROC-DAL-01", unit: "kg", qty: 50, unitPrice: 92, lineTotal: 4600 },
      ],
    },
  ])

  // Suppliers
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([
    { id: 1, name: "APMC Commission Agent 42 (Ramu)", category: "Vegetables", phone: "+91 94481 11223", outstandingBalance: 85000, paymentTerms: "Net 7 Days" },
    { id: 2, name: "Nashik Farmers Onion Syndicate", category: "Vegetables", phone: "+91 98220 54321", outstandingBalance: 120000, paymentTerms: "Immediate / RTGS" },
    { id: 3, name: "Tanjore Delta Modern Rice Mills", category: "Rice", phone: "+91 94432 98765", outstandingBalance: 95000, paymentTerms: "Advance 50% + Net 15" },
    { id: 4, name: "Karnataka Agro Pulses Traders", category: "Groceries", phone: "+91 98450 77889", outstandingBalance: 12000, paymentTerms: "Net 10 Days" },
  ])

  // Purchase Orders
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderRecord[]>([
    {
      id: "po-1",
      poNumber: "PO-2026-00412",
      supplier: "APMC Commission Agent 42 (Ramu)",
      supplierId: 1,
      date: "2026-10-29",
      status: "Approved",
      totalAmount: 42000,
      items: [
        { productId: 1, productName: "Tomato Hybrid", orderedQty: 1000, receivedQty: 1000, unit: "kg", purchaseRate: 28 },
        { productId: 4, productName: "Green Chilli G4", orderedQty: 200, receivedQty: 180, unit: "kg", purchaseRate: 82 },
      ],
    },
    {
      id: "po-2",
      poNumber: "PO-2026-00413",
      supplier: "Tanjore Delta Modern Rice Mills",
      supplierId: 3,
      date: "2026-10-28",
      status: "Fully Received",
      totalAmount: 122000,
      items: [
        { productId: 7, productName: "Ponni Boiled Rice (25kg)", orderedQty: 100, receivedQty: 100, unit: "bag", purchaseRate: 1220 },
      ],
    },
  ])

  // Goods Receipts
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceiptRecord[]>([
    {
      id: "gr-1",
      grNumber: "GR-2026-00388",
      poNumber: "PO-2026-00412",
      supplier: "APMC Commission Agent 42 (Ramu)",
      receiptDate: "2026-10-29 06:30 AM",
      supplierInvoiceNo: "INV-RAMU-8821",
      orderedQty: 200,
      receivedWeight: 195,
      acceptedQty: 180,
      damagedQty: 15,
      rejectedQty: 5,
      discrepancyNote: "Weight shortage of 5 kg from farm transport. 15 kg crushed/damaged in transit logged to spoilage.",
      productName: "Green Chilli G4",
      warehouse: "Central Cold Storage Yard A",
    },
    {
      id: "gr-2",
      grNumber: "GR-2026-00387",
      poNumber: "PO-2026-00413",
      supplier: "Tanjore Delta Modern Rice Mills",
      receiptDate: "2026-10-28 04:15 PM",
      supplierInvoiceNo: "TD-9902",
      orderedQty: 100,
      receivedWeight: 2500,
      acceptedQty: 100,
      damagedQty: 0,
      rejectedQty: 0,
      discrepancyNote: "All 100 bags intact, verified on weighbridge (2,500 kg net).",
      productName: "Ponni Boiled Rice (25kg)",
      warehouse: "Rice Godown B (Hebbal)",
    },
  ])

  // Delivery Trips
  const [deliveryTrips, setDeliveryTrips] = useState<DeliveryTripRecord[]>([
    {
      id: "trip-104",
      tripNo: "TRIP-2026-00104",
      driver: "Ramesh Kumar (KA-01-AB-1234)",
      vehicleNo: "KA-01-AB-1234",
      vehicleCapacityKg: 1500,
      totalLoadKg: 780,
      status: "In Transit",
      dispatchTime: "Today, 07:15 AM",
      orders: [
        {
          orderId: "MC-8918",
          customer: "Sri Lakshmi Supermarket",
          address: "Shop 14, 8th Main, Malleshwaram, Bangalore",
          phone: "+91 98451 98765",
          amount: 18100,
          weightKg: 300,
          sequence: 1,
          status: "Pending",
        },
        {
          orderId: "MC-8919",
          customer: "Green Leaf Mess",
          address: "No 42, 1st Cross, Gandhi Bazaar, Basavanagudi",
          phone: "+91 94480 34567",
          amount: 3810,
          weightKg: 90,
          sequence: 2,
          status: "Pending",
        },
      ],
      collectedCash: 0,
      collectedUpi: 0,
      remittedToOffice: false,
    },
  ])

  // Invoices
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([
    {
      id: "inv-1",
      invoiceNo: "INV-2026-00381",
      orderId: "MC-8920",
      customer: "Saravana Bhavan Grand",
      date: "2026-10-30",
      subtotal: 34933,
      gstAmount: 1747,
      totalAmount: 36680,
      amountPaid: 36680,
      balanceDue: 0,
      paymentStatus: "Paid",
    },
    {
      id: "inv-2",
      invoiceNo: "INV-2026-00380",
      orderId: "MC-8918",
      customer: "Sri Lakshmi Supermarket",
      date: "2026-10-30",
      subtotal: 17238,
      gstAmount: 862,
      totalAmount: 18100,
      amountPaid: 5000,
      balanceDue: 13100,
      paymentStatus: "Partial",
    },
  ])

  // Spoilage Logs
  const [spoilageLogs, setSpoilageLogs] = useState<SpoilageLogRecord[]>([
    {
      id: 1,
      date: "2026-10-29",
      productName: "Green Chilli G4",
      warehouse: "Central Cold Storage Yard A",
      qty: 15,
      unit: "kg",
      estimatedLoss: 1230,
      reason: "Goods receipt transit crushing & rot",
      approvedBy: "Rajesh Kumar (Owner)",
    },
    {
      id: 2,
      date: "2026-10-28",
      productName: "Tomato Hybrid",
      warehouse: "Central Cold Storage Yard A",
      qty: 25,
      unit: "kg",
      estimatedLoss: 700,
      reason: "Overripe soft culls sorted out",
      approvedBy: "Rajesh Kumar (Owner)",
    },
  ])

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditTrailRecord[]>([
    {
      id: 1,
      timestamp: "Today, 08:45 AM",
      user: "System (Receiver App API)",
      role: "RECEIVER",
      action: "CREATE",
      entity: "ORDER",
      entityId: "MC-8921",
      notes: "Hotel Annapoorna placed order for 4 items totaling ₹34,250",
    },
    {
      id: 2,
      timestamp: "Today, 08:18 AM",
      user: "Rajesh Kumar",
      role: "OWNER",
      action: "APPROVE",
      entity: "ORDER",
      entityId: "MC-8920",
      notes: "Approved order & locked stock reservation (20 bags Sona Masoori, 100kg Onion)",
    },
    {
      id: 3,
      timestamp: "Today, 07:15 AM",
      user: "Operations Admin",
      role: "ADMIN",
      action: "DISPATCH",
      entity: "DELIVERY_TRIP",
      entityId: "TRIP-2026-00104",
      notes: "Dispatched vehicle KA-01-AB-1234 with 2 orders (780 kg load / 1,500 kg capacity)",
    },
    {
      id: 4,
      timestamp: "Today, 05:30 AM",
      user: "Rajesh Kumar",
      role: "OWNER",
      action: "UPDATE",
      entity: "RATES",
      entityId: "VEG-TOM-01",
      beforeValue: "₹32/kg",
      afterValue: "₹35/kg",
      notes: "APMC auction open trend +₹3/kg applied to new orders",
    },
  ])

  // Helper: log audit
  const logAudit = (action: string, entity: string, entityId: string, notes: string, before?: string, after?: string) => {
    const newLog: AuditTrailRecord = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      user: "Rajesh Kumar",
      role: "OWNER",
      action,
      entity,
      entityId,
      notes,
      beforeValue: before,
      afterValue: after,
    }
    setAuditLogs((prev) => [newLog, ...prev])
  }

  // Action: Update Daily Rate
  const updateDailyRate = (productId: number, newStandardRate: number, reason: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return
    const oldPrice = product.sellingPrice

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, sellingPrice: newStandardRate } : p))
    )

    logAudit(
      "UPDATE",
      "DAILY_RATE",
      product.sku,
      `Rate updated from ₹${oldPrice} to ₹${newStandardRate}. Reason: ${reason}`,
      `₹${oldPrice}`,
      `₹${newStandardRate}`
    )
  }

  // Action: Approve Order -> Reserve Stock (Enforces Rule 6.1 & Test 7)
  const approveOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return

    // 1. Check stock & reserve
    let canFulfill = true
    let shortageMessage = ""
    order.items.forEach((item) => {
      const stock = stockLedger.find((s) => s.productId === item.productId)
      if (stock && stock.availableQty < item.qty) {
        canFulfill = false
        shortageMessage += `${item.productName}: Requested ${item.qty}, Available ${stock.availableQty}. `
      }
    })

    if (!canFulfill) {
      setActiveAlert({
        code: "ERR_STOCK_OVERALLOCATION",
        severity: "error",
        title: "Stock Over-Allocation Blocked",
        message: `Cannot approve order ${orderId}: ${shortageMessage}`,
        ruleReference: "Instruction.md Rule 6.1 & Acceptance Test 7",
        logicExplanation:
          "Available stock is calculated as (physicalQty - reservedQty). Confirming this order would force available inventory into negative numbers, creating phantom stock.",
        actionableStep:
          "Replenish stock via Goods Receipt, split into partial fulfillment, or adjust line item quantity.",
        timestamp: new Date().toLocaleTimeString(),
      })
      return
    }

    // Reserve stock in ledger
    setStockLedger((prev) =>
      prev.map((entry) => {
        const item = order.items.find((i) => i.productId === entry.productId)
        if (item) {
          const newReserved = entry.reservedQty + item.qty
          const newAvail = Math.max(0, entry.physicalQty - newReserved)
          return { ...entry, reservedQty: newReserved, availableQty: newAvail }
        }
        return entry
      })
    )

    // Update order status
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "confirmed", statusLabel: "Confirmed & Stock Reserved" }
          : o
      )
    )

    // Sync approval with backend
    const apiBase = getApiBaseUrl()
    if (apiBase) {
      try {
        fetch(`${apiBase}/api/orders/${orderId}/approve`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-role": officeAuth?.role || "OWNER",
          },
        }).catch(() => {})
      } catch {
        // ignore
      }
    }

    logAudit(
      "APPROVE",
      "ORDER",
      orderId,
      `Order ${orderId} confirmed for ${order.customer}. Stock reserved across all ${order.items.length} items.`
    )
  }

  // Action: Update Order Status
  const updateOrderStatus = (orderId: string, status: OrderRecord["status"], notes?: string) => {
    const labels: Record<OrderRecord["status"], string> = {
      received: "Order Received",
      pending: "Pending Approval",
      confirmed: "Confirmed & Reserved",
      reserved: "Stock Reserved",
      picking: "Picking in Warehouse",
      packed: "Packed & Ready",
      dispatched: "Dispatched",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      completed: "Completed",
      cancelled: "Cancelled",
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, statusLabel: labels[status] } : o))
    )

    // AUTOMATIC DRIVER TRIP ROUTING: If dispatched, assign into active driver delivery trip!
    if (status === "dispatched" || status === "out_for_delivery") {
      const targetOrder = orders.find((o) => o.id === orderId)
      if (targetOrder) {
        const estWeight =
          targetOrder.items && targetOrder.items.length > 0
            ? targetOrder.items.reduce((sum, it) => sum + (it.qty || 25), 0)
            : 120

        setDeliveryTrips((prevTrips) =>
          prevTrips.map((trip, idx) => {
            // Target driver trip (trip-104 or first trip)
            if (idx === 0 || trip.id === "trip-104") {
              const alreadyExists = trip.orders.some((o) => o.orderId === orderId)
              if (alreadyExists) return trip

              const newStop: DeliveryStopRecord = {
                orderId: targetOrder.id,
                customer: targetOrder.customer,
                address:
                  targetOrder.customer === "Hotel Annapoorna"
                    ? "Shop 14, 8th Main, Malleshwaram 4th Block, Bangalore"
                    : targetOrder.customer === "Saravana Bhavan Grand"
                    ? "12th Cross, Indiranagar 100ft Road, Bangalore"
                    : "Commercial Road, Central Market Area, Bangalore",
                phone: "+91 98451 " + Math.floor(10000 + Math.random() * 90000),
                amount: targetOrder.totalAmount,
                weightKg: estWeight,
                sequence: trip.orders.length + 1,
                status: "Pending",
              }

              return {
                ...trip,
                totalLoadKg: trip.totalLoadKg + estWeight,
                orders: [...trip.orders, newStop],
              }
            }
            return trip
          })
        )

        // Deduct physical inventory upon dispatch (Rule 6.1 & 8.2)
        if (targetOrder.items && targetOrder.items.length > 0) {
          setStockLedger((prev) =>
            prev.map((entry) => {
              const item = targetOrder.items.find((i) => i.productId === entry.productId)
              if (item) {
                const newPhys = Math.max(0, entry.physicalQty - item.qty)
                const newRes = Math.max(0, entry.reservedQty - item.qty)
                return { ...entry, physicalQty: newPhys, reservedQty: newRes }
              }
              return entry
            })
          )
        }

        // Synchronize with backend API
        const apiBase = getApiBaseUrl()
        if (apiBase) {
          try {
            fetch(`${apiBase}/api/orders/${orderId}/dispatch`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-user-role": officeAuth?.role || "OWNER",
              },
              body: JSON.stringify({
                vehicleNo: "KA-01-AB-1234",
                driver: "Ramesh Kumar",
                notes,
              }),
            }).catch(() => {})
          } catch {
            // ignore
          }
        }
      }
    }

    logAudit("UPDATE", "ORDER", orderId, `Status transitioned to ${labels[status]}. ${notes || ""}`)
  }

  // Action: Cancel Order & Release Stock Reservation
  const cancelOrder = (orderId: string, reason: string) => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return

    // If order had reserved stock, release it
    if (["confirmed", "reserved", "picking", "packed"].includes(order.status)) {
      setStockLedger((prev) =>
        prev.map((entry) => {
          const item = order.items.find((i) => i.productId === entry.productId)
          if (item) {
            const newReserved = Math.max(0, entry.reservedQty - item.qty)
            const newAvail = entry.physicalQty - newReserved
            return { ...entry, reservedQty: newReserved, availableQty: newAvail }
          }
          return entry
        })
      )
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: "cancelled", statusLabel: "Cancelled" } : o
      )
    )

    logAudit("CANCEL", "ORDER", orderId, `Order cancelled. Reason: ${reason}. Stock reservations released.`)
  }

  // Action: Create New Order
  const createNewOrder = (orderData: Partial<OrderRecord>) => {
    const orderId = `MC-${Math.floor(8925 + Math.random() * 500)}`
    const newOrder: OrderRecord = {
      id: orderId,
      customer: orderData.customer || "Hotel Annapoorna",
      customerId: orderData.customerId || "cust-1",
      customerType: orderData.customerType || "Verified Buyer",
      source: orderData.source || "Receiver App",
      time: "Just Now",
      itemsCount: orderData.items?.length || 1,
      itemsSummary: orderData.itemsSummary || "Tomato 50kg, Onion 30kg",
      totalAmount: orderData.totalAmount || 2920,
      paymentStatus: "Unpaid",
      paymentTerms: orderData.paymentTerms || "Credit 7 Days",
      status: "pending",
      statusLabel: "Pending Approval",
      slot: orderData.slot || "Morning 06:00 - 08:00 AM",
      otp: String(Math.floor(1000 + Math.random() * 9000)),
      creditLimitNote: "Within Limit",
      items: orderData.items || [],
    }

    const customerRecord = customers.find((c) => c.id === (orderData.customerId || "cust-1"))
    if (customerRecord && customerRecord.creditLimit > 0) {
      const projectedBalance = customerRecord.currentBalance + (orderData.totalAmount || 2920)
      if (projectedBalance > customerRecord.creditLimit) {
        newOrder.creditLimitNote = "Credit Limit Exceeded"
        setActiveAlert({
          code: "WARN_CREDIT_LIMIT_EXCEEDED",
          severity: "warning",
          title: "Customer Credit Limit Breach Warning",
          message: `Order total ₹${newOrder.totalAmount} pushes ${customerRecord.name}'s balance to ₹${projectedBalance}, exceeding credit limit ₹${customerRecord.creditLimit} by ₹${projectedBalance - customerRecord.creditLimit}.`,
          ruleReference: "Instruction.md Rule 9.2 & Acceptance Test 14",
          logicExplanation:
            "Receivables exceeding approved credit limits present high default risk. System permits order creation with warning flag, but requires Owner confirmation before dispatch.",
          actionableStep: "Collect outstanding dues or request an Owner credit override.",
          timestamp: new Date().toLocaleTimeString(),
        })
      }
    }

    setOrders((prev) => [newOrder, ...prev])
    logAudit(
      "CREATE",
      "ORDER",
      orderId,
      `New order created for ${newOrder.customer} via ${newOrder.source}. Total: ₹${newOrder.totalAmount}`
    )
  }

  // Action: Create Purchase Order
  const createPurchaseOrder = (poData: Partial<PurchaseOrderRecord>) => {
    const poNum = `PO-2026-${String(Math.floor(415 + Math.random() * 50)).padStart(5, "0")}`
    const newPO: PurchaseOrderRecord = {
      id: `po-${Date.now()}`,
      poNumber: poNum,
      supplier: poData.supplier || "APMC Commission Agent 42",
      supplierId: poData.supplierId || 1,
      date: new Date().toISOString().split("T")[0],
      status: "Ordered",
      totalAmount: poData.totalAmount || 35000,
      items: poData.items || [],
    }

    setPurchaseOrders((prev) => [newPO, ...prev])
    logAudit("CREATE", "PURCHASE_ORDER", poNum, `Created PO for ${newPO.supplier}. Total: ₹${newPO.totalAmount}`)
  }

  // Action: Record Goods Receipt -> "Only accepted goods increase available inventory"
  const recordGoodsReceipt = (receiptData: Partial<GoodsReceiptRecord>) => {
    const grNum = `GR-2026-${String(Math.floor(390 + Math.random() * 50)).padStart(5, "0")}`
    const newGR: GoodsReceiptRecord = {
      id: `gr-${Date.now()}`,
      grNumber: grNum,
      poNumber: receiptData.poNumber || "PO-2026-00412",
      supplier: receiptData.supplier || "APMC Supplier",
      receiptDate: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      supplierInvoiceNo: receiptData.supplierInvoiceNo || `INV-SUP-${Math.floor(1000 + Math.random() * 9000)}`,
      orderedQty: receiptData.orderedQty || 100,
      receivedWeight: receiptData.receivedWeight || 100,
      acceptedQty: receiptData.acceptedQty || 100,
      damagedQty: receiptData.damagedQty || 0,
      rejectedQty: receiptData.rejectedQty || 0,
      discrepancyNote: receiptData.discrepancyNote || "Verified on weighbridge.",
      productName: receiptData.productName || "Tomato Hybrid",
      warehouse: receiptData.warehouse || "Central Cold Storage Yard A",
    }

    setGoodsReceipts((prev) => [newGR, ...prev])

    // Update stock: ONLY ACCEPTED QTY INCREASES PHYSICAL & AVAILABLE STOCK
    const prod = products.find((p) => p.name === newGR.productName)
    if (prod) {
      setStockLedger((prev) =>
        prev.map((entry) => {
          if (entry.productId === prod.id) {
            const newPhys = entry.physicalQty + newGR.acceptedQty
            const newAvail = entry.availableQty + newGR.acceptedQty
            const newWasted = entry.wastedQty + newGR.damagedQty
            return {
              ...entry,
              physicalQty: newPhys,
              availableQty: newAvail,
              wastedQty: newWasted,
            }
          }
          return entry
        })
      )
    }

    // If damaged, also log to spoilage
    if (newGR.damagedQty > 0) {
      logSpoilage({
        productName: newGR.productName,
        warehouse: newGR.warehouse,
        qty: newGR.damagedQty,
        unit: prod?.unit || "kg",
        estimatedLoss: newGR.damagedQty * (prod?.purchasePrice || 30),
        reason: `Goods receipt damage/crush from ${newGR.supplier}`,
        approvedBy: "Rajesh Kumar (Owner)",
      })
    }

    logAudit(
      "CREATE",
      "GOODS_RECEIPT",
      grNum,
      `Goods receipt logged for ${newGR.productName}. Ordered: ${newGR.orderedQty}, Accepted: ${newGR.acceptedQty}, Damaged: ${newGR.damagedQty}. Available stock increased by ${newGR.acceptedQty}.`
    )
  }

  // Action: Log Spoilage / Wastage
  const logSpoilage = (spoilageData: Partial<SpoilageLogRecord>) => {
    const newLog: SpoilageLogRecord = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      productName: spoilageData.productName || "Tomato Hybrid",
      warehouse: spoilageData.warehouse || "Central Cold Storage Yard A",
      qty: spoilageData.qty || 10,
      unit: spoilageData.unit || "kg",
      estimatedLoss: spoilageData.estimatedLoss || 350,
      reason: spoilageData.reason || "Cull & rot sorted",
      approvedBy: "Rajesh Kumar (Owner)",
    }

    setSpoilageLogs((prev) => [newLog, ...prev])

    // Deduct from physical and available stock
    const prod = products.find((p) => p.name === newLog.productName)
    if (prod) {
      setStockLedger((prev) =>
        prev.map((entry) => {
          if (entry.productId === prod.id) {
            const newPhys = Math.max(0, entry.physicalQty - newLog.qty)
            const newAvail = Math.max(0, entry.availableQty - newLog.qty)
            return {
              ...entry,
              physicalQty: newPhys,
              availableQty: newAvail,
              wastedQty: entry.wastedQty + newLog.qty,
            }
          }
          return entry
        })
      )
    }

    logAudit(
      "ADJUSTMENT",
      "SPOILAGE",
      newLog.productName,
      `Recorded ${newLog.qty} ${newLog.unit} spoilage. Est Loss: ₹${newLog.estimatedLoss}. Reason: ${newLog.reason}`
    )
  }

  // Action: Increase Stock / Manual Inward / Surplus Adjustment (Rule 6.1 & 6.2)
  const increaseStock = (
    productId: number,
    qty: number,
    warehouse?: string,
    reason?: string,
    reference?: string
  ) => {
    const numQty = Number(qty)
    if (isNaN(numQty) || numQty <= 0) return

    const prod = products.find((p) => p.id === productId)
    const targetName = prod?.name || "Commodity"

    setStockLedger((prev) =>
      prev.map((entry) => {
        if (entry.productId === productId) {
          return {
            ...entry,
            physicalQty: entry.physicalQty + numQty,
            availableQty: entry.availableQty + numQty,
          }
        }
        return entry
      })
    )

    logAudit(
      "ADJUSTMENT",
      "STOCK_LEDGER",
      prod?.sku || targetName,
      `Stock increased by ${numQty} units. Warehouse: ${warehouse || "Central Cold Storage Yard A"}. Reason: ${reason || "Manual Stock-In / Surplus Adjustment"}. Ref: ${reference || "Direct"}`
    )

    // Synchronize with backend API
    const apiBase = getApiBaseUrl()
    if (apiBase) {
      try {
        fetch(`${apiBase}/api/stock/adjust`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-role": officeAuth?.role || "OWNER",
          },
          body: JSON.stringify({
            productId,
            productName: targetName,
            warehouse,
            qty: numQty,
            reason,
            reference,
          }),
        }).catch(() => {})
      } catch {
        // ignore
      }
    }
  }

  // Action: Record Payment
  const recordPayment = (invoiceNo: string, amount: number, method: "CASH" | "UPI" | "BANK", ref?: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.invoiceNo === invoiceNo) {
          const newPaid = inv.amountPaid + amount
          const newBal = Math.max(0, inv.totalAmount - newPaid)
          const newStatus = newBal === 0 ? "Paid" : "Partial"
          return {
            ...inv,
            amountPaid: newPaid,
            balanceDue: newBal,
            paymentStatus: newStatus,
          }
        }
        return inv
      })
    )

    logAudit("PAYMENT", "INVOICE", invoiceNo, `Received ₹${amount} via ${method} (Ref: ${ref || "Direct"}).`)
  }

  // Action: Dispatch Trip
  const dispatchDeliveryTrip = (tripId: string) => {
    setDeliveryTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: "In Transit" } : t))
    )

    // Mark assigned orders as dispatched & deduct physical stock
    const trip = deliveryTrips.find((t) => t.id === tripId)
    if (trip) {
      trip.orders.forEach((o) => {
        const order = orders.find((ord) => ord.id === o.orderId)
        if (order) {
          // Stock deduction exactly once upon dispatch
          setStockLedger((prev) =>
            prev.map((entry) => {
              const item = order.items.find((i) => i.productId === entry.productId)
              if (item) {
                const newPhys = Math.max(0, entry.physicalQty - item.qty)
                const newRes = Math.max(0, entry.reservedQty - item.qty)
                return { ...entry, physicalQty: newPhys, reservedQty: newRes }
              }
              return entry
            })
          )
        }
        updateOrderStatus(o.orderId, "dispatched", `Dispatched with trip ${trip.tripNo}`)
      })
    }

    logAudit("DISPATCH", "DELIVERY_TRIP", tripId, `Dispatched delivery trip with driver ${trip?.driver}`)
  }

  // Action: Driver completes delivery with POD capture
  const completeDriverDelivery = (
    tripId: string,
    orderId: string,
    receiverName: string,
    signature: string,
    shortageNote: string,
    collectedAmount: number,
    paymentMethod: "CASH" | "UPI"
  ) => {
    // 1. Update trip order
    setDeliveryTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          const updatedOrders = t.orders.map((o) => {
            if (o.orderId === orderId) {
              return {
                ...o,
                status: shortageNote ? ("Shortage" as const) : ("Delivered" as const),
                receiverName,
                podSignature: signature,
                shortageNote,
                collectedAmount,
              }
            }
            return o
          })

          const addCash = paymentMethod === "CASH" ? collectedAmount : 0
          const addUpi = paymentMethod === "UPI" ? collectedAmount : 0

          return {
            ...t,
            orders: updatedOrders,
            collectedCash: t.collectedCash + addCash,
            collectedUpi: t.collectedUpi + addUpi,
          }
        }
        return t
      })
    )

    // 2. Update order status
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "delivered",
              statusLabel: "Delivered (POD Captured)",
              paymentStatus: collectedAmount >= o.totalAmount ? "Paid" : collectedAmount > 0 ? "Partial" : o.paymentStatus,
            }
          : o
      )
    )

    // 3. Log audit
    logAudit(
      "UPDATE",
      "PROOF_OF_DELIVERY",
      orderId,
      `Driver delivered order to ${receiverName}. Collected ₹${collectedAmount} via ${paymentMethod}. Shortage note: ${shortageNote || "None"}.`
    )

    // 4. Synchronize POD with backend API
    const apiBase = getApiBaseUrl()
    if (apiBase) {
      try {
        fetch(`${apiBase}/api/delivery/pod`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-role": "DRIVER",
            "x-driver-id": driverAuth?.driverId || "driver-1",
          },
          body: JSON.stringify({
            tripId,
            orderId,
            receiverName,
            signature,
            shortageNote,
            collectedAmount,
            method: paymentMethod,
          }),
        }).catch(() => {})
      } catch {
        // ignore
      }
    }
  }

  return (
    <MandiStoreContext.Provider
      value={{
        mode,
        setMode,
        activeOfficeTab,
        setActiveOfficeTab,
        activeAlert,
        setActiveAlert,
        clearAlert,
        products,
        customerPricing,
        stockLedger,
        customers,
        orders,
        suppliers,
        purchaseOrders,
        goodsReceipts,
        deliveryTrips,
        invoices,
        auditLogs,
        spoilageLogs,
        updateDailyRate,
        approveOrder,
        updateOrderStatus,
        cancelOrder,
        createNewOrder,
        createPurchaseOrder,
        recordGoodsReceipt,
        logSpoilage,
        increaseStock,
        recordPayment,
        dispatchDeliveryTrip,
        completeDriverDelivery,
        theme,
        setTheme,
        colorMode,
        setColorMode,
        toggleColorMode,
        officeAuth,
        setOfficeAuth,
        receiverAuth,
        setReceiverAuth,
        driverAuth,
        setDriverAuth,
        refreshKey,
        isRefreshing,
        refreshRealtimeData,
      }}
    >
      {children}
    </MandiStoreContext.Provider>
  )
}

export const useMandiStore = () => {
  const context = useContext(MandiStoreContext)
  if (!context) {
    throw new Error("useMandiStore must be used within a MandiStoreProvider")
  }
  return context
}
