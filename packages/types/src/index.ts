// Mandi Connect — Core Domain Types
// Vegetable, Groceries & Rice Distribution Management System

export type UserRole = "OWNER" | "ADMIN" | "DRIVER" | "RECEIVER";

export type ProductStatus = "ACTIVE" | "INACTIVE";

export type UnitType =
  | "KG"
  | "GRAM"
  | "BAG"
  | "SACK"
  | "PIECE"
  | "BUNDLE"
  | "LITRE";

export type SupplierStatus = "ACTIVE" | "INACTIVE";

export type PurchaseOrderStatus =
  | "DRAFT"
  | "APPROVED"
  | "ORDERED"
  | "PARTIALLY_RECEIVED"
  | "FULLY_RECEIVED"
  | "CANCELLED";

export type OrderSource =
  | "RECEIVER_APP"
  | "PHONE"
  | "WHATSAPP"
  | "WALK_IN"
  | "OFFICE";

export type OrderStatus =
  | "RECEIVED"
  | "PENDING_APPROVAL"
  | "CONFIRMED"
  | "STOCK_RESERVED"
  | "PICKING"
  | "PACKED"
  | "DISPATCHED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED"
  | "PARTIALLY_FULFILLED"
  | "BACKORDERED"
  | "DELIVERY_FAILED"
  | "RETURNED";

export type PaymentMethod =
  | "CASH"
  | "UPI"
  | "BANK_TRANSFER"
  | "CHEQUE"
  | "ADVANCE";

export type PaymentStatus =
  | "UNPAID"
  | "PARTIAL"
  | "PAID"
  | "ADVANCE"
  | "REFUNDED";

export type StockMovementType =
  | "PURCHASE_IN"
  | "ORDER_RESERVATION"
  | "RESERVATION_RELEASE"
  | "DISPATCH"
  | "RETURN_IN"
  | "RETURN_APPROVED"
  | "WASTAGE"
  | "WAREHOUSE_TRANSFER"
  | "ADJUSTMENT"
  | "STOCK_COUNT";

export type DeliveryStatus =
  | "ASSIGNED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "PARTIALLY_DELIVERED"
  | "FAILED"
  | "RETURNED";

export type VehicleStatus = "AVAILABLE" | "ON_TRIP" | "MAINTENANCE" | "INACTIVE";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "APPROVE"
  | "REJECT"
  | "CANCEL"
  | "DISPATCH"
  | "PAYMENT"
  | "ADJUSTMENT";

// --- Domain Models ---

export interface User {
  id: string;
  supabaseId: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Unit {
  id: number;
  name: string;
  type: UnitType;
  standardWeightKg?: number; // e.g. 1 rice bag = 25kg
  isActive: boolean;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  imageUrl?: string;
  categoryId: number;
  categoryName?: string;
  unit: string;
  unitType: UnitType;
  standardWeightKg?: number;
  purchasePrice: number;
  sellingPrice: number;
  minMarginPct?: number;
  taxRate: number; // e.g. 0% for fresh veg, 5% for branded rice
  hsnCode?: string;
  // Rice specific
  brand?: string;
  variety?: string;
  grade?: string;
  bagWeightKg?: number;
  batchNumber?: string;
  bestBeforeDate?: string;
  status: ProductStatus;
  minStockLevel: number;
}

export interface CustomerPrice {
  id: number;
  customerId: string;
  customerName: string;
  productId: number;
  productName: string;
  price: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

export interface Customer {
  id: string;
  companyName: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  gstNumber?: string;
  creditLimit: number;
  paymentTermDays: number;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
}

export interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  category?: string;
  gstNumber?: string;
  panNumber?: string;
  paymentTermDays: number;
  openingBalance: number;
  currentOutstanding: number;
  status: SupplierStatus;
}

export interface PurchaseOrderItem {
  id: number;
  purchaseOrderId: number;
  productId: number;
  productName: string;
  orderedQty: number;
  receivedQty: number;
  unit: string;
  purchaseRate: number;
  amount: number;
}

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierId: number;
  supplierName: string;
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDate?: string;
  notes?: string;
  transportCharge: number;
  otherCharges: number;
  totalAmount: number;
  items: PurchaseOrderItem[];
  approvedBy?: string;
}

export interface GoodsReceiptItem {
  id: number;
  goodsReceiptId: number;
  purchaseItemId: number;
  productId: number;
  productName: string;
  orderedQty: number;
  receivedQty: number;
  acceptedQty: number; // Only this increases stock
  damagedQty: number;
  rejectedQty: number;
  actualWeightKg?: number;
  purchaseRate: number;
  warehouseId: number;
  warehouseName: string;
  batchNumber?: string;
  expiryDate?: string;
}

export interface GoodsReceipt {
  id: number;
  grNumber: string;
  purchaseOrderId: number;
  poNumber: string;
  supplierId: number;
  supplierName: string;
  receiptDate: string;
  supplierInvoiceNo?: string;
  invoiceFileUrl?: string;
  notes?: string;
  items: GoodsReceiptItem[];
  createdById: string;
}

export interface Warehouse {
  id: number;
  name: string;
  location?: string;
  isActive: boolean;
}

export interface StockLedgerItem {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  category: string;
  warehouseId: number;
  warehouseName: string;
  physicalQty: number;
  reservedQty: number;
  availableQty: number; // physicalQty - reservedQty
  wastedQty: number;
  unit: string;
  standardWeightKg?: number;
  minStockLevel: number;
  avgCostPrice: number;
  totalValuation: number;
}

export interface StockMovement {
  id: number;
  idempotencyKey: string;
  productId: number;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  movementType: StockMovementType;
  qtyChange: number;
  qtyBefore: number;
  qtyAfter: number;
  referenceType?: string;
  referenceId?: string;
  reason?: string;
  approvedBy?: string;
  createdByName: string;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  sku: string;
  unit: string;
  orderedQty: number;
  confirmedQty: number;
  reservedQty: number;
  pickedQty: number;
  dispatchedQty: number;
  deliveredQty: number;
  returnedQty: number;
  remainingQty: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  orderNo: string;
  customerId: string;
  customerName: string;
  source: OrderSource;
  status: OrderStatus;
  orderDate: string;
  requiredDate?: string;
  notes?: string;
  rejectionReason?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  balanceDue: number;
  itemsCount: number;
  itemsSummary: string;
  driverName?: string;
  vehicleNo?: string;
  slot?: string;
  otp?: string;
  items: OrderItem[];
}

export interface Driver {
  id: number;
  userId: string;
  name: string;
  phone: string;
  licenceNo?: string;
  isActive: boolean;
}

export interface Vehicle {
  id: number;
  vehicleNo: string;
  vehicleType: string;
  capacityKg: number;
  status: VehicleStatus;
  isActive: boolean;
}

export interface DeliveryTripOrder {
  id: number;
  tripId: number;
  orderId: number;
  orderNo: string;
  customerName: string;
  address: string;
  phone: string;
  deliverySeq: number;
  status: DeliveryStatus;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  // Proof of delivery
  deliveredAt?: string;
  receiverName?: string;
  receiverSignUrl?: string;
  podPhotoUrl?: string;
  deliveredQtyNote?: string;
  shortageNote?: string;
  returnNote?: string;
  failureReason?: string;
  remarks?: string;
}

export interface DeliveryTrip {
  id: number;
  tripNo: string;
  driverId: number;
  driverName: string;
  vehicleId: number;
  vehicleNo: string;
  vehicleCapacityKg: number;
  totalLoadKg: number;
  status: "DRAFT" | "DISPATCHED" | "IN_TRANSIT" | "COMPLETED";
  dispatchTime?: string;
  returnTime?: string;
  notes?: string;
  orders: DeliveryTripOrder[];
  collectedAmount: number;
  remittedToOffice: boolean;
}

export interface Invoice {
  id: number;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  orderId?: number;
  orderNo?: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  items: {
    id: number;
    description: string;
    qty: number;
    unit: string;
    rate: number;
    taxRate: number;
    taxAmount: number;
    lineTotal: number;
  }[];
}

export interface Payment {
  id: number;
  paymentRef: string;
  customerId: string;
  customerName: string;
  orderId?: number;
  orderNo?: string;
  invoiceId?: number;
  invoiceNo?: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  paymentDate: string;
  notes?: string;
  recordedBy: string;
}

export interface AuditLogItem {
  id: number;
  userName: string;
  userRole: UserRole;
  action: AuditAction;
  entityType: string;
  entityId: string;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  notes?: string;
  timestamp: string;
}
