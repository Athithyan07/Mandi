// Customized Domain Warnings & Logic-Bound Error Messages for Mandi Connect Backend

export interface CustomMessage {
  code: string
  severity: "ERROR" | "WARNING" | "INFO"
  ruleReference: string
  title: string
  message: string
  logicExplanation: string
  actionableStep: string
  details?: Record<string, any>
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
  const shortage = requestedQty - availableQty
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
  }
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
  const projectedBalance = currentBalance + orderTotal
  const exceededBy = projectedBalance - creditLimit
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
  }
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
  }
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
  }
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
  }
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
  }
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
  }
}

