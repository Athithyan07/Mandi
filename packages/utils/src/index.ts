// Mandi Connect — Core Business Logic & Rule Engine
// Implements business rules specified in Architecture.md and Instruction.md

import type { OrderStatus, PaymentStatus } from "@mandi/types";

/**
 * Rule 4.3: Customer-specific pricing with fallback to default selling price
 */
export function resolveProductPrice(
  defaultPrice: number,
  customerPrice?: number
): number {
  if (customerPrice !== undefined && customerPrice > 0) {
    return customerPrice;
  }
  return defaultPrice;
}

/**
 * Rule 4.2 & 6.2: Bag/Sack weight conversion into standard stock units (kg)
 * Example: 1 rice bag = 25 kg
 */
export function convertToKilograms(
  quantity: number,
  unit: string,
  standardWeightKg?: number
): number {
  const normalizedUnit = unit.toLowerCase().trim();
  if (normalizedUnit === "bag" || normalizedUnit === "sack") {
    return quantity * (standardWeightKg || 25);
  }
  if (normalizedUnit === "g" || normalizedUnit === "gram") {
    return quantity / 1000;
  }
  return quantity; // Default assume 1:1 if already kg or piece
}

/**
 * Rule 6.1: Check if sufficient available stock exists for an order reservation
 */
export function canReserveStock(
  availableStock: number,
  requestedQuantity: number
): { allowed: boolean; shortage: number } {
  if (availableStock >= requestedQuantity) {
    return { allowed: true, shortage: 0 };
  }
  return { allowed: false, shortage: requestedQuantity - availableStock };
}

/**
 * Rule 12.2: Compute GST breakdown (CGST + SGST or IGST)
 */
export function calculateTax(
  taxableAmount: number,
  taxRatePercent: number,
  isInterstate: boolean = false
): {
  taxRate: number;
  taxAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalWithTax: number;
} {
  const taxAmount = Math.round(((taxableAmount * taxRatePercent) / 100) * 100) / 100;
  if (isInterstate) {
    return {
      taxRate: taxRatePercent,
      taxAmount,
      cgst: 0,
      sgst: 0,
      igst: taxAmount,
      totalWithTax: taxableAmount + taxAmount,
    };
  }
  const halfTax = Math.round((taxAmount / 2) * 100) / 100;
  return {
    taxRate: taxRatePercent,
    taxAmount,
    cgst: halfTax,
    sgst: halfTax,
    igst: 0,
    totalWithTax: taxableAmount + taxAmount,
  };
}

/**
 * Rule 9.2: Customer credit check
 */
export function checkCreditLimit(
  currentBalance: number,
  creditLimit: number,
  newOrderTotal: number
): {
  isWithinLimit: boolean;
  projectedBalance: number;
  exceededBy: number;
} {
  const projectedBalance = currentBalance + newOrderTotal;
  if (creditLimit <= 0) {
    // 0 credit limit means prepaid or no strict cap set
    return { isWithinLimit: true, projectedBalance, exceededBy: 0 };
  }
  const isWithinLimit = projectedBalance <= creditLimit;
  return {
    isWithinLimit,
    projectedBalance,
    exceededBy: isWithinLimit ? 0 : projectedBalance - creditLimit,
  };
}

/**
 * Rule 7.3: Valid Order Status Transitions
 */
export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  RECEIVED: ["PENDING_APPROVAL", "REJECTED", "CANCELLED"],
  PENDING_APPROVAL: ["CONFIRMED", "REJECTED", "CANCELLED"],
  CONFIRMED: ["STOCK_RESERVED", "CANCELLED"],
  STOCK_RESERVED: ["PICKING", "CANCELLED"],
  PICKING: ["PACKED", "CANCELLED"],
  PACKED: ["DISPATCHED", "PARTIALLY_FULFILLED", "CANCELLED"],
  DISPATCHED: ["OUT_FOR_DELIVERY", "DELIVERY_FAILED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "PARTIALLY_FULFILLED", "DELIVERY_FAILED", "RETURNED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
  PARTIALLY_FULFILLED: ["DELIVERED", "COMPLETED"],
  BACKORDERED: ["CONFIRMED", "CANCELLED"],
  DELIVERY_FAILED: ["OUT_FOR_DELIVERY", "RETURNED", "CANCELLED"],
  RETURNED: ["COMPLETED"],
};

export function isValidStatusTransition(
  currentStatus: OrderStatus,
  targetStatus: OrderStatus
): boolean {
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(targetStatus) : false;
}

/**
 * Rule 8.2: Delivery vehicle capacity validation
 */
export function validateVehicleCapacity(
  vehicleCapacityKg: number,
  tripOrdersWeightKg: number
): { isOverloaded: boolean; excessKg: number; loadPercentage: number } {
  const excessKg = tripOrdersWeightKg - vehicleCapacityKg;
  const loadPercentage =
    vehicleCapacityKg > 0 ? Math.round((tripOrdersWeightKg / vehicleCapacityKg) * 100) : 0;
  return {
    isOverloaded: excessKg > 0,
    excessKg: Math.max(0, excessKg),
    loadPercentage,
  };
}

/**
 * Unique Document Number Formatter
 */
export function generateDocumentNumber(
  prefix: "ORD" | "PO" | "GR" | "INV" | "TRIP" | "PAY",
  sequence: number,
  year = new Date().getFullYear()
): string {
  const padded = String(sequence).padStart(5, "0");
  return `${prefix}-${year}-${padded}`;
}

/**
 * Currency Formatter for INR (Indian Rupee)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─────────────────────────────────────────────────────────────
// CUSTOMIZED DOMAIN WARNINGS & LOGIC-BOUND ERROR MESSAGES
// ─────────────────────────────────────────────────────────────

export interface CustomMessage {
  code: string;
  severity: "ERROR" | "WARNING" | "INFO";
  ruleReference: string;
  title: string;
  message: string;
  logicExplanation: string;
  actionableStep: string;
  details?: Record<string, any>;
}

/**
 * Rule 6.1 & Test 7: Stock Over-Allocation Error
 */
export function createStockOverAllocationError(
  productName: string,
  requestedQty: number,
  availableQty: number,
  unit = "kg"
): CustomMessage {
  const shortage = requestedQty - availableQty;
  return {
    code: "ERR_STOCK_OVERALLOCATION",
    severity: "ERROR",
    ruleReference: "Instruction.md Section 6.1 (Stock Movement Rules) & Section 12 Acceptance Test 7",
    title: "Stock Over-Allocation Blocked",
    message: `Insufficient available stock for ${productName}. Requested: ${requestedQty} ${unit}, Available: ${availableQty} ${unit} (Shortage: ${shortage} ${unit}).`,
    logicExplanation:
      "Available stock is calculated as (physicalQty - reservedQty). Confirming this order would force available inventory into negative numbers, creating phantom reservations and leading to downstream picking and vehicle dispatch failures.",
    actionableStep:
      "Record an incoming Goods Receipt from an approved PO to replenish stock, split into partial fulfillment, or reduce the ordered line quantity.",
    details: { productName, requestedQty, availableQty, shortage, unit },
  };
}

/**
 * Rule 9.2 & Test 14: Customer Credit Limit Breach Warning
 */
export function createCreditLimitWarning(
  customerName: string,
  currentBalance: number,
  creditLimit: number,
  orderTotal: number
): CustomMessage {
  const projectedBalance = currentBalance + orderTotal;
  const exceededBy = projectedBalance - creditLimit;
  return {
    code: "WARN_CREDIT_LIMIT_EXCEEDED",
    severity: "WARNING",
    ruleReference: "Instruction.md Section 9.2 (Credit Control) & Section 12 Acceptance Test 14",
    title: "Customer Credit Limit Breach Warning",
    message: `Order total ₹${orderTotal} pushes ${customerName}'s outstanding balance to ₹${projectedBalance}, exceeding approved credit limit of ₹${creditLimit} by ₹${exceededBy}.`,
    logicExplanation:
      "Customer credit control policy mandates that transactions causing accounts receivable to exceed agreed credit limits represent default risks. The system flags the order with an approval requirement before dispatch.",
    actionableStep:
      "Collect outstanding dues via cash/UPI collection or require Owner/Admin authorization to grant a credit exception.",
    details: { customerName, currentBalance, creditLimit, orderTotal, projectedBalance, exceededBy },
  };
}

/**
 * Rule 29 & Rule 38: Idempotent Single-Stock Deduction Dispatch Warning
 */
export function createDoubleDispatchWarning(
  orderId: string,
  currentStatus: string
): CustomMessage {
  return {
    code: "WARN_IDEMPOTENT_DISPATCH",
    severity: "WARNING",
    ruleReference: "Instruction.md Section 11 Rule 29 (Single Stock Deduction) & Rule 38 (Prevent Duplicate Transactions)",
    title: "Duplicate Dispatch Request Ignored",
    message: `Order ${orderId} has already been dispatched (current status: '${currentStatus}'). Physical inventory was not deducted again.`,
    logicExplanation:
      "Rule 29 strictly mandates that physical stock must be deducted exactly once per dispatch. Duplicate dispatch requests are treated idempotently to avoid distorting physical inventory counts.",
    actionableStep:
      "Check the driver manifest and active trip sheet. The goods are already loaded or out for delivery.",
    details: { orderId, currentStatus },
  };
}

/**
 * Rule 33 & Section 2: Role-Based Access Control Error
 */
export function createRoleUnauthorizedError(
  userRole: string,
  requiredRoles: string[],
  resource: string
): CustomMessage {
  return {
    code: "ERR_ROLE_UNAUTHORIZED",
    severity: "ERROR",
    ruleReference: "Instruction.md Section 2 (User Roles and Access Control) & Section 11 Rule 33",
    title: "Access Denied — Role Unauthorized",
    message: `Role '${userRole}' does not possess required privileges for '${resource}'. Required role(s): ${requiredRoles.join(", ")}.`,
    logicExplanation:
      "Access control boundaries ensure operational compartmentalization. Drivers cannot access owner financial records, and receivers cannot view supplier purchase costs.",
    actionableStep:
      "Switch or log in with an authorized Owner or Admin account to access this module.",
    details: { userRole, requiredRoles, resource },
  };
}

/**
 * Rule 33 & BOLA: Cross-Tenant Data Access Violation Error
 */
export function createTenantIsolationError(
  callerCustomerId: string,
  requestedCustomerId: string
): CustomMessage {
  return {
    code: "ERR_TENANT_ISOLATION_VIOLATION",
    severity: "ERROR",
    ruleReference: "Instruction.md Section 11 Rule 33 & OWASP API Top 10 BOLA/IDOR Prevention",
    title: "Cross-Tenant Data Access Denied",
    message: `Unauthorized attempt by customer '${callerCustomerId}' to access data belonging to customer '${requestedCustomerId}'.`,
    logicExplanation:
      "Commercial confidentiality strictly restricts receiver companies to their own company's pricing, orders, and statements to prevent commercial data leaks.",
    actionableStep:
      `Query only resources associated with your authenticated receiver account ID (${callerCustomerId}).`,
    details: { callerCustomerId, requestedCustomerId },
  };
}

/**
 * Rule 34: Invalid Numeric Input Error
 */
export function createInvalidInputError(
  field: string,
  value: any,
  expectedCondition: string
): CustomMessage {
  return {
    code: "ERR_INVALID_NUMERIC_INPUT",
    severity: "ERROR",
    ruleReference: "Instruction.md Section 11 Rule 34 (Input Validation & Data Integrity)",
    title: "Invalid Input Parameter",
    message: `Invalid value '${value}' provided for '${field}'. ${expectedCondition}.`,
    logicExplanation:
      "Quantities, rates, taxes, and amounts must be positive numbers. Negative or malformed numbers can corrupt the relational ledger and distort financial balances.",
    actionableStep:
      "Provide a valid positive numeric value complying with standard units.",
    details: { field, value, expectedCondition },
  };
}

/**
 * Rule 7.3: Invalid Status Transition Error
 */
export function createInvalidStatusTransitionError(
  currentStatus: string,
  targetStatus: string,
  validTransitions: string[]
): CustomMessage {
  return {
    code: "ERR_INVALID_STATUS_TRANSITION",
    severity: "ERROR",
    ruleReference: "Instruction.md Section 7.3 (Status Workflow & Transition Rules)",
    title: "Illegal Status Transition",
    message: `Cannot transition order status from '${currentStatus}' to '${targetStatus}'.`,
    logicExplanation:
      "Orders must follow the strict lifecycle: Order Received → Pending Approval → Confirmed → Stock Reserved → Picking → Packed → Dispatched → Out for Delivery → Delivered → Completed. Skipping stages compromises warehouse tracking.",
    actionableStep:
      `Follow the sequential lifecycle steps. Allowed next status(es): ${validTransitions.length > 0 ? validTransitions.join(", ") : "None (Terminal Status)"}.`,
    details: { currentStatus, targetStatus, allowedTransitions: validTransitions },
  };
}

/**
 * Rule 8.2: Delivery Vehicle Overload Warning
 */
export function createVehicleOverloadWarning(
  vehicleNo: string,
  vehicleCapacityKg: number,
  totalLoadKg: number
): CustomMessage {
  const excessKg = totalLoadKg - vehicleCapacityKg;
  const loadPercentage = Math.round((totalLoadKg / vehicleCapacityKg) * 100);
  return {
    code: "WARN_VEHICLE_OVERLOAD",
    severity: "WARNING",
    ruleReference: "Instruction.md Section 8.2 (Delivery Assignment & Capacity Limits)",
    title: "Vehicle Capacity Overload Warning",
    message: `Trip load (${totalLoadKg} kg) exceeds vehicle ${vehicleNo} rated capacity (${vehicleCapacityKg} kg) by ${excessKg} kg (${loadPercentage}% load).`,
    logicExplanation:
      "Assigning cargo beyond rated vehicle limits compromises road safety, causes transit delays, and risks vegetable crushing damage.",
    actionableStep:
      "Re-assign excess orders to a secondary delivery trip or allocate a higher-capacity transport vehicle.",
    details: { vehicleNo, vehicleCapacityKg, totalLoadKg, excessKg, loadPercentage },
  };
}

/**
 * Rule 5.3: Goods Receipt Discrepancy Warning
 */
export function createGoodsReceiptDiscrepancyWarning(
  productName: string,
  orderedQty: number,
  receivedWeight: number,
  acceptedQty: number,
  damagedQty: number
): CustomMessage {
  const shortage = orderedQty - receivedWeight;
  return {
    code: "WARN_GOODS_RECEIPT_DISCREPANCY",
    severity: "WARNING",
    ruleReference: "Instruction.md Section 5.3 (Goods Receipt Discrepancy Rules) & Section 6.1",
    title: "Goods Receipt Shortage / Damage Logged",
    message: `Shortage/damage recorded for ${productName}: Ordered ${orderedQty}, Received ${receivedWeight}, Accepted ${acceptedQty}, Damaged ${damagedQty}.`,
    logicExplanation:
      "Rule 5.3 strictly stipulates that only accepted goods increase available inventory. Damaged goods are automatically routed to spoilage valuation to prevent unmarketable stock in customer orders.",
    actionableStep:
      "Verify weighbridge slip, file transit debit note with supplier APMC agent, and review cold storage sorting.",
    details: { productName, orderedQty, receivedWeight, acceptedQty, damagedQty, shortage },
  };
}
