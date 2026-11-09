import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import { router as apiRouter } from "./routes/api.js"
import { extractAuthContext } from "./middleware/auth.js"

dotenv.config()

export function createApp() {
  const app = express()

  // Security headers using Helmet
  app.use(helmet({
    contentSecurityPolicy: false, // allow flexibility for API JSON consumers
    crossOriginEmbedderPolicy: false,
  }))

  // Standard middleware
  app.use(cors({ origin: "*" }))
  app.use(express.json({ limit: "1mb" })) // Enforce request body size limit to avoid DoS
  app.use(extractAuthContext) // Extract auth role and customer headers

  // Request logger (disabled in test env)
  if (process.env.NODE_ENV !== "test") {
    app.use((req, res, next) => {
      const timestamp = new Date().toLocaleTimeString()
      console.log(`[${timestamp}] ${req.method} ${req.url}`)
      next()
    })
  }

  // Routes
  app.use("/api", apiRouter)

  // Root fallback
  app.get("/", (req, res) => {
    res.json({
      name: "Mandi Connect Backend API Server",
      version: "1.0.0",
      status: "online",
      endpoints: {
        health: "/api/health",
        dashboard: "/api/dashboard/stats",
        products: "/api/products",
        rates: "/api/rates",
        orders: "/api/orders",
        stock: "/api/stock",
        purchases: "/api/purchases",
        goodsReceipt: "/api/goods-receipt",
        deliveryTrips: "/api/delivery/trips",
        invoices: "/api/invoices",
        payments: "/api/payments",
        auditLogs: "/api/audit-logs",
      },
    })
  })

  // Global Error Handler (no stack trace leak)
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error",
    })
  })

  return app
}

export const app = createApp()
