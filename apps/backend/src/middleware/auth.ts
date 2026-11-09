import { Request, Response, NextFunction } from "express"
import { createRoleUnauthorizedError, createTenantIsolationError } from "../utils/custom-messages.js"

export type UserRole = "OWNER" | "ADMIN" | "DRIVER" | "RECEIVER" | "ANONYMOUS"

declare global {
  namespace Express {
    interface Request {
      userRole?: UserRole
      customerId?: string
      driverId?: string
    }
  }
}

/**
 * Authentication & Identity extraction middleware
 */
export function extractAuthContext(req: Request, res: Response, next: NextFunction) {
  // Extract user role from header or fallback
  const roleHeader = (req.headers["x-user-role"] as string)?.toUpperCase()
  if (roleHeader && ["OWNER", "ADMIN", "DRIVER", "RECEIVER"].includes(roleHeader)) {
    req.userRole = roleHeader as UserRole
  } else {
    // If not specified, in production it would be ANONYMOUS,
    // in test or local dev default to OWNER unless explicitly set
    req.userRole = (roleHeader as UserRole) || "ANONYMOUS"
  }

  req.customerId = (req.headers["x-customer-id"] as string) || undefined
  req.driverId = (req.headers["x-driver-id"] as string) || undefined
  next()
}

/**
 * Role-Based Access Control (RBAC) Guard (Instruction.md Rule 33)
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.userRole || "ANONYMOUS"

    if (!allowedRoles.includes(userRole)) {
      const customErr = createRoleUnauthorizedError(userRole, allowedRoles, req.originalUrl || req.path)
      return res.status(403).json({
        error: customErr.message,
        customMessage: customErr,
        logicExplanation: customErr.logicExplanation,
        ruleReference: customErr.ruleReference,
      })
    }

    next()
  }
}

/**
 * Tenant Isolation & BOLA/IDOR Prevention
 * Ensures RECEIVER role cannot access another customer's data
 */
export function enforceTenantIsolation(req: Request, res: Response, next: NextFunction) {
  if (req.userRole === "RECEIVER") {
    const callerCustomerId = req.customerId

    // If query parameter specifies a customerId that doesn't match the caller's ID
    if (req.query.customerId && req.query.customerId !== callerCustomerId) {
      const customErr = createTenantIsolationError(callerCustomerId || "anonymous", req.query.customerId as string)
      return res.status(403).json({
        error: customErr.message,
        customMessage: customErr,
        logicExplanation: customErr.logicExplanation,
        ruleReference: customErr.ruleReference,
      })
    }

    // Automatically enforce filtering by caller customer ID
    if (callerCustomerId) {
      req.query.customerId = callerCustomerId
    }
  }

  next()
}

