"use client"

import React, { useState } from "react"
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Truck,
  IndianRupee,
  AlertTriangle,
  ArrowUpRight,
  Scale,
  Check,
  X,
  Sparkles,
} from "lucide-react"
import { useMandiStore } from "@/lib/mandi-store"
import { RealtimeRefreshButton } from "@/components/realtime-refresh-button"

export const DashboardTab: React.FC = () => {
  const {
    orders,
    stockLedger,
    invoices,
    suppliers,
    spoilageLogs,
    setActiveOfficeTab,
  } = useMandiStore()

  // Interactive plot hover states
  const [hoveredPoint, setHoveredPoint] = useState<{ day: string; orders: number; gmv: string } | null>(null)
  const [selectedDonutSegment, setSelectedDonutSegment] = useState<string>("upi")
  const [hourlyFilter, setHourlyFilter] = useState<"all" | "morning" | "noon">("all")

  // Selected detail item for the Minimal Detailed Pane
  const [selectedItemDetail, setSelectedItemDetail] = useState<{
    type: "order" | "stock" | "collection" | "buyer"
    title: string
    subtitle: string
    stats: { label: string; value: string; highlight?: boolean }[]
    tags: string[]
    description: string
  } | null>({
    type: "order",
    title: "Order #MC-8921",
    subtitle: "Hotel Annapoorna • Morning Slot",
    stats: [
      { label: "Total Amount", value: "₹24,500", highlight: true },
      { label: "Payment", value: "Paid (UPI)" },
      { label: "Status", value: "Dispatched (KA-01-AB-1234)" },
      { label: "Items", value: "5 Commodities" },
    ],
    tags: ["Verified Buyer", "Fast Delivery"],
    description: "Packed and loaded for delivery to Hotel Annapoorna.",
  })

  const totalSalesToday = orders.reduce((acc, o) => acc + o.totalAmount, 0)
  const totalStockValuation = stockLedger.reduce(
    (acc, it) => acc + it.physicalQty * it.avgCost,
    0
  )
  const totalOutstanding = invoices.reduce((acc, i) => acc + i.balanceDue, 0)
  const pendingOrders = orders.filter((o) => o.status === "pending")
  const lowStockItems = stockLedger.filter((s) => s.availableQty <= s.reorderThreshold)
  const totalSupplierPayable = suppliers.reduce((acc, s) => acc + s.outstandingBalance, 0)
  const totalSpoilageLoss = spoilageLogs.reduce((acc, l) => acc + l.estimatedLoss, 0)
  const totalSpoilageQty = spoilageLogs.reduce((acc, l) => acc + l.qty, 0)

  // 7-day trend data
  const trendDays = [
    { day: "Mon", orders: 45, gmv: "₹1.1L", cx: 10, cy: 65 },
    { day: "Tue", orders: 60, gmv: "₹1.4L", cx: 55, cy: 52 },
    { day: "Wed", orders: 55, gmv: "₹1.3L", cx: 100, cy: 55 },
    { day: "Thu", orders: 85, gmv: "₹2.0L", cx: 140, cy: 38 },
    { day: "Fri", orders: 105, gmv: "₹2.5L", cx: 180, cy: 30 },
    { day: "Sat", orders: 120, gmv: "₹3.1L", cx: 250, cy: 18 },
    { day: "Sun", orders: 75, gmv: "₹1.8L", cx: 290, cy: 25 },
  ]

  return (
    <div className="space-y-6">
      {/* Realtime Action Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">APMC Live Feed</span>
        </div>
        <RealtimeRefreshButton showLabel label="Sync" />
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP 3 PASTEL CARDS (Clean Apple Minimalism)                */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Sales */}
        <div
          onClick={() =>
            setSelectedItemDetail({
              type: "order",
              title: "Daily Sales",
              subtitle: "All Channels",
              stats: [
                { label: "Gross Sales", value: `₹${totalSalesToday.toLocaleString("en-IN")}`, highlight: true },
                { label: "Total Orders", value: `${orders.length}` },
                { label: "Pending", value: `${pendingOrders.length}` },
                { label: "Active Trips", value: "3" },
              ],
              tags: ["Wholesale GMV"],
              description: "Booked orders for today's trading session.",
            })
          }
          className="neo-card-periwinkle p-5 space-y-3.5 relative overflow-hidden flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#232f57] dark:text-[#c4d2fa]">
              Sales
            </span>
            <div className="w-7 h-7 rounded-full bg-white/70 dark:bg-white/10 flex items-center justify-center text-[#2d3864] dark:text-[#a5b9f7] shadow-xs">
              <ShoppingCart className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-[#111933] dark:text-white font-heading tracking-tight">
              +{orders.length * 10}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-black/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold shadow-xs flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +24%
            </span>
          </div>

          {/* Interactive 7-Day Trend Curve */}
          <div className="space-y-1.5 pt-1 relative">
            <div className="flex justify-between items-center text-[10px] text-[#2f3c66] dark:text-[#a0afde] font-medium">
              <span>7-Day Volume</span>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                {hoveredPoint ? `${hoveredPoint.day}: ${hoveredPoint.orders} (${hoveredPoint.gmv})` : "Peak: 120 Orders"}
              </span>
            </div>
            
            <div className="h-18 w-full relative flex items-center">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80">
                <defs>
                  <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#303b6d" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#303b6d" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 10 65 Q 55 50, 100 55 T 180 30 T 250 18 L 290 25 L 290 80 L 10 80 Z"
                  fill="url(#curveGradient)"
                />
                <path
                  d="M 10 65 Q 55 50, 100 55 T 180 30 T 250 18 L 290 25"
                  fill="none"
                  stroke="#242e5c"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="dark:stroke-[#91a8fa]"
                />
                {trendDays.map((p, idx) => (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveOfficeTab("orders")
                    }}
                  >
                    <circle
                      cx={p.cx}
                      cy={p.cy}
                      r={hoveredPoint?.day === p.day ? 7 : p.day === "Sat" ? 5 : 3.5}
                      fill={p.day === "Sat" ? "#4ade80" : "#242e5c"}
                      stroke="#ffffff"
                      strokeWidth={hoveredPoint?.day === p.day ? 2.5 : 1.5}
                      className="dark:fill-[#91a8fa] transition-all hover:scale-125"
                    />
                  </g>
                ))}
              </svg>
            </div>

            <div className="flex justify-between text-[9px] text-[#556391] dark:text-[#8898cb] font-mono font-bold">
              {trendDays.map((p, idx) => (
                <span
                  key={idx}
                  className={`cursor-pointer hover:underline ${p.day === "Sat" ? "text-emerald-700 dark:text-emerald-300 font-extrabold" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveOfficeTab("orders")
                  }}
                >
                  {p.day}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center text-[11px] text-[#2f3c66] dark:text-[#a0afde] border-t border-black/5 dark:border-white/10 pt-2 font-medium">
            <span>GMV: ₹{totalSalesToday.toLocaleString("en-IN")}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setActiveOfficeTab("orders")
              }}
              className="text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Orders <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Warehouse Stock */}
        <div
          onClick={() =>
            setSelectedItemDetail({
              type: "stock",
              title: "Godown Stock",
              subtitle: "All Warehouses",
              stats: [
                { label: "Total Value", value: `₹${(totalStockValuation / 100000).toFixed(2)}L`, highlight: true },
                { label: "Weight", value: "3,450 kg" },
                { label: "Low Stock", value: `${lowStockItems.length} SKUs` },
                { label: "Spoilage", value: "0.8%" },
              ],
              tags: ["Physical Stock", "Godown A, B & C"],
              description: "Total commodities currently available in storage.",
            })
          }
          className="neo-card-sky p-5 space-y-3.5 relative overflow-hidden flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#123857] dark:text-[#bde1fc]">
              Inventory
            </span>
            <div className="w-7 h-7 rounded-full bg-white/70 dark:bg-white/10 flex items-center justify-center text-[#1c4868] dark:text-[#a3d5fa] shadow-xs">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-[#092238] dark:text-white font-heading tracking-tight">
              3,450 kg
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-black/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold shadow-xs flex items-center gap-1">
              <Check className="w-3 h-3" /> 9 SKUs
            </span>
          </div>

          {/* Segmented Category Ratio Bar */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center text-[10px] text-[#1a4466] dark:text-[#a5d2f6] font-medium">
              <span>Ratio</span>
              <span className="font-mono font-semibold">100% Calibrated</span>
            </div>

            <div className="h-3.5 w-full rounded-xl bg-white/60 dark:bg-black/40 p-0.5 flex gap-1 overflow-hidden">
              <div
                className="h-full rounded-lg bg-gradient-to-r from-[#17537e] to-[#2572a8] dark:from-[#2e88c7] dark:to-[#4bb2f7]"
                style={{ width: "52%" }}
              />
              <div
                className="h-full rounded-lg bg-gradient-to-r from-[#447a54] to-[#5aa871] dark:from-[#49b569] dark:to-[#77dc95]"
                style={{ width: "33%" }}
              />
              <div
                className="h-full rounded-lg bg-gradient-to-r from-[#8a5b28] to-[#b37736] dark:from-[#d19451] dark:to-[#f2be80]"
                style={{ width: "15%" }}
              />
            </div>

            <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] font-semibold">
              <span className="text-[#133c5e] dark:text-[#a4d3f7]">Veg 52%</span>
              <span className="text-[#1f4a2d] dark:text-[#94e3ab]">Rice 33%</span>
              <span className="text-[#543513] dark:text-[#f4caa0]">Groc 15%</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-[11px] text-[#1c4669] dark:text-[#9fcdee] border-t border-black/5 dark:border-white/10 pt-2 font-medium">
            <span>Valuation: ₹{(totalStockValuation / 100000).toFixed(2)}L</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setActiveOfficeTab("inventory")
              }}
              className="text-xs font-semibold text-sky-700 dark:text-sky-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Stock <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 3: Dispatches */}
        <div
          onClick={() =>
            setSelectedItemDetail({
              type: "collection",
              title: "Procurement Batches",
              subtitle: "Farm Gate Arrivals",
              stats: [
                { label: "Purchases", value: "₹1,42,800", highlight: true },
                { label: "Commission", value: "APMC 42" },
                { label: "Weighbridge", value: "Verified" },
                { label: "Payable", value: "₹65,000" },
              ],
              tags: ["APMC Inward"],
              description: "Direct farm inward received at APMC yard.",
            })
          }
          className="neo-card-mauve p-5 space-y-3.5 relative overflow-hidden flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#571e42] dark:text-[#f3c8e5]">
              Dispatches
            </span>
            <div className="w-7 h-7 rounded-full bg-white/70 dark:bg-white/10 flex items-center justify-center text-[#582143] dark:text-[#e4a4cf] shadow-xs">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-[#360d27] dark:text-white font-heading tracking-tight">
              6 Active Lots
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-black/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold shadow-xs flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 92% Fulfilled
            </span>
          </div>

          {/* Stepped Progress Stages */}
          <div className="space-y-1.5 pt-1 text-[10px]">
            <div>
              <div className="flex justify-between font-semibold text-[#421631] dark:text-[#f7d0e9]">
                <span>Weighbridge</span>
                <span>100%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/60 dark:bg-black/40 overflow-hidden mt-0.5">
                <div className="h-full rounded-full bg-[#5c2447] dark:bg-[#df85be]" style={{ width: "100%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-[#421631] dark:text-[#f7d0e9]">
                <span>Sorting</span>
                <span>83%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/60 dark:bg-black/40 overflow-hidden mt-0.5">
                <div className="h-full rounded-full bg-[#7a2e5d] dark:bg-[#eb9ad0]" style={{ width: "83%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-[#421631] dark:text-[#f7d0e9]">
                <span>Dispatched</span>
                <span>67%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/60 dark:bg-black/40 overflow-hidden mt-0.5">
                <div className="h-full rounded-full bg-[#9e3a78] dark:bg-[#f2b5dc]" style={{ width: "67%" }} />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[11px] text-[#5c2447] dark:text-[#e3b4d2] border-t border-black/5 dark:border-white/10 pt-2 font-medium">
            <span>Procured: ₹1,42,800</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setActiveOfficeTab("delivery")
              }}
              className="text-xs font-semibold text-fuchsia-700 dark:text-fuchsia-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Fleet <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. MINIMAL 8 KPI TILES (Click to Navigate with Hover Glow)     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. MINIMAL 8 KPI TILES (Apple Minimalism)                      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div
          className="neo-card-white p-4 space-y-1.5 cursor-pointer"
          onClick={() => setActiveOfficeTab("billing")}
        >
          <div className="flex items-center justify-between text-[11px] text-[#787f92] font-semibold tracking-wide">
            <span>Profit</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+18.2%</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            ₹{Math.round(totalSalesToday * 0.18).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-[#787f92] flex justify-between font-medium">
            <span>GMV: ₹{totalSalesToday.toLocaleString("en-IN")}</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Ledger →</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div
          className="neo-card-white p-4 space-y-1.5 cursor-pointer"
          onClick={() => setActiveOfficeTab("orders")}
        >
          <div className="flex items-center justify-between text-[11px] text-[#787f92] font-semibold tracking-wide">
            <span>Pending</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#11101d] dark:text-white">
            {pendingOrders.length} Orders
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 flex justify-between font-medium">
            <span>Awaiting Action</span>
            <span className="font-semibold underline">Review →</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div
          className="neo-card-white p-4 space-y-1.5 cursor-pointer"
          onClick={() => setActiveOfficeTab("billing")}
        >
          <div className="flex items-center justify-between text-[11px] text-[#787f92] font-semibold tracking-wide">
            <span>Receivables</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">7d Terms</span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400">
            ₹{totalOutstanding.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-[#787f92] flex justify-between font-medium">
            <span>{invoices.length} Invoices</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Collect →</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div
          className="neo-card-white p-4 space-y-1.5 cursor-pointer"
          onClick={() => setActiveOfficeTab("purchase")}
        >
          <div className="flex items-center justify-between text-[11px] text-[#787f92] font-semibold tracking-wide">
            <span>Payables</span>
            <span className="text-slate-400 font-medium">3 Farms</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#11101d] dark:text-white">
            ₹{totalSupplierPayable.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 flex justify-between font-medium">
            <span>Farm Inward</span>
            <span className="font-semibold underline">Pay →</span>
          </div>
        </div>

        {/* KPI 5 */}
        <div
          className="neo-card-white p-4 space-y-1.5 cursor-pointer"
          onClick={() => setActiveOfficeTab("inventory")}
        >
          <div className="flex items-center justify-between text-[11px] text-[#787f92] font-semibold tracking-wide">
            <span>Valuation</span>
            <span className="text-sky-600 dark:text-sky-400 font-medium">3 Godowns</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#11101d] dark:text-white">
            ₹{(totalStockValuation / 100000).toFixed(2)}L
          </div>
          <div className="text-[11px] text-[#787f92] flex justify-between font-medium">
            <span>9 SKUs</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Stock →</span>
          </div>
        </div>

        {/* KPI 6 */}
        <div
          className="neo-card-white p-4 space-y-1.5 cursor-pointer"
          onClick={() =>
            setSelectedItemDetail({
              type: "stock",
              title: "Wastage",
              subtitle: "Yard Sorting",
              stats: [
                { label: "Loss", value: `₹${totalSpoilageLoss.toLocaleString("en-IN")}`, highlight: true },
                { label: "Weight", value: `${totalSpoilageQty} kg` },
                { label: "Rate", value: "0.82%" },
                { label: "Cap", value: "2.0%" },
              ],
              tags: ["Sorting Loss"],
              description: "Recorded shrinkage and sorting loss.",
            })
          }
        >
          <div className="flex items-center justify-between text-[11px] text-[#787f92] font-semibold tracking-wide">
            <span>Wastage</span>
            <span className="text-rose-600 dark:text-rose-400 font-semibold">0.82%</span>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
            ₹{totalSpoilageLoss.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-rose-700 dark:text-rose-400 flex justify-between font-medium">
            <span>{totalSpoilageQty} kg cull</span>
            <span className="font-semibold underline">Details →</span>
          </div>
        </div>

        {/* KPI 7 */}
        <div
          className="neo-card-white p-4 space-y-1.5 cursor-pointer"
          onClick={() => setActiveOfficeTab("inventory")}
        >
          <div className="flex items-center justify-between text-[11px] text-[#787f92] font-semibold tracking-wide">
            <span>Low Stock</span>
            <AlertTriangle className="w-3 h-3 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#11101d] dark:text-white">
            {lowStockItems.length} SKUs
          </div>
          <div className="text-[11px] text-rose-700 dark:text-rose-400 flex justify-between font-medium">
            <span>Chilli & Carrot</span>
            <span className="font-semibold underline">Reorder →</span>
          </div>
        </div>

        {/* KPI 8 */}
        <div
          className="neo-card-white p-4 space-y-1.5 cursor-pointer"
          onClick={() => setActiveOfficeTab("delivery")}
        >
          <div className="flex items-center justify-between text-[11px] text-[#787f92] font-semibold tracking-wide">
            <span>Fleet</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">En Route</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            4 / 6 Stops
          </div>
          <div className="text-[11px] text-[#787f92] flex justify-between font-medium">
            <span>KA-01</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Route →</span>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. VISUAL PLOTS (Arrivals vs Dispatches & Payment Split)      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Plot A: Arrivals vs Dispatches */}
        <div className="lg:col-span-7 neo-card-white p-5 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-sm font-bold text-[#11101d] dark:text-white font-heading">
                  Arrivals vs Dispatches
                </h4>
              </div>
              <p className="text-[11px] text-[#787f92]">
                Hourly kg comparison: Farm inward vs delivery dispatches
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setHourlyFilter("all")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all ${
                  hourlyFilter === "all" ? "neo-dock-active" : "neo-pill-well text-[#787f92]"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setHourlyFilter("morning")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all ${
                  hourlyFilter === "morning" ? "neo-dock-active" : "neo-pill-well text-[#787f92]"
                }`}
              >
                Morning
              </button>
              <button
                onClick={() => setHourlyFilter("noon")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all ${
                  hourlyFilter === "noon" ? "neo-dock-active" : "neo-pill-well text-[#787f92]"
                }`}
              >
                Midday
              </button>
            </div>
          </div>

          <div className="h-40 w-full relative flex flex-col justify-end">
            <div className="flex justify-between items-center text-[10px] text-[#787f92] mb-2 px-1">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Inward
                </span>
                <span className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" /> Dispatches
                </span>
              </div>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                Net: +1,240 kg In Godown
              </span>
            </div>

            <div className="flex-1 flex items-end justify-between gap-2 px-1 pb-2 border-b border-slate-200 dark:border-white/10">
              {[
                { time: "05:00", inward: 480, outward: 120, period: "morning" },
                { time: "06:00", inward: 720, outward: 280, period: "morning" },
                { time: "07:00", inward: 950, outward: 540, period: "morning" },
                { time: "08:00", inward: 610, outward: 780, period: "morning" },
                { time: "09:00", inward: 340, outward: 620, period: "noon" },
                { time: "10:00", inward: 220, outward: 450, period: "noon" },
                { time: "11:00", inward: 180, outward: 310, period: "noon" },
                { time: "12:00", inward: 110, outward: 190, period: "noon" },
              ]
                .filter((b) => hourlyFilter === "all" || b.period === hourlyFilter)
                .map((b, idx) => {
                  const maxVal = 1000
                  const inH = Math.round((b.inward / maxVal) * 100)
                  const outH = Math.round((b.outward / maxVal) * 100)

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-1 h-full justify-end group cursor-pointer"
                      onClick={() =>
                        setSelectedItemDetail({
                          type: "stock",
                          title: `Hour ${b.time}`,
                          subtitle: "Throughput Snapshot",
                          stats: [
                            { label: "Arrivals", value: `${b.inward} kg`, highlight: true },
                            { label: "Dispatches", value: `${b.outward} kg` },
                            { label: "Net Buffer", value: `+${b.inward - b.outward} kg` },
                            { label: "Yard", value: "Central Yard A" },
                          ],
                          tags: ["Weighbridge Verified", "Gate Pass"],
                          description: `Activity snapshot logged at ${b.time}.`,
                        })
                      }
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-1 rounded-md bg-[#11101d] text-white text-[10px] font-mono pointer-events-none z-20 shadow-lg">
                        {b.time}: {b.inward}kg In / {b.outward}kg Out
                      </div>

                      <div className="w-full flex items-end justify-center gap-1 h-28">
                        <div
                          className="w-1/2 max-w-[14px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all group-hover:brightness-125"
                          style={{ height: `${inH}%` }}
                        />
                        <div
                          className="w-1/2 max-w-[14px] bg-gradient-to-t from-indigo-700 to-indigo-500 rounded-t-sm transition-all group-hover:brightness-125"
                          style={{ height: `${outH}%` }}
                        />
                      </div>

                      <span className="text-[10px] font-mono font-bold text-[#787f92]">
                        {b.time}
                      </span>
                    </div>
                  )
                })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-black/[0.05] dark:border-white/[0.05]">
            <button
              onClick={() => setActiveOfficeTab("purchase")}
              className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
            >
              Inward Receipts <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveOfficeTab("delivery")}
              className="text-indigo-700 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
            >
              Delivery Trips <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Plot B: Payment Methods Donut */}
        <div className="lg:col-span-5 neo-card-white p-5 space-y-3.5 flex flex-col justify-between">
          <div className="border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-sm font-bold text-[#11101d] dark:text-white font-heading">
                Payment Split
              </h4>
            </div>
            <p className="text-[11px] text-[#787f92]">
              UPI, 7-day credit, and driver cash
            </p>
          </div>

          <div className="flex items-center justify-around gap-4">
            <div className="relative w-30 h-30 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" stroke="rgba(0,0,0,0.06)" strokeWidth="14" fill="none" className="dark:stroke-white/10" />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#10b981"
                  strokeWidth={selectedDonutSegment === "upi" ? "18" : "14"}
                  strokeDasharray="114.6 238.7"
                  strokeDashoffset="0"
                  fill="none"
                  className="cursor-pointer transition-all hover:opacity-90"
                  onClick={() => setSelectedDonutSegment("upi")}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#6366f1"
                  strokeWidth={selectedDonutSegment === "credit" ? "18" : "14"}
                  strokeDasharray="86.0 238.7"
                  strokeDashoffset="-114.6"
                  fill="none"
                  className="cursor-pointer transition-all hover:opacity-90"
                  onClick={() => setSelectedDonutSegment("credit")}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#f59e0b"
                  strokeWidth={selectedDonutSegment === "cash" ? "18" : "14"}
                  strokeDasharray="38.1 238.7"
                  strokeDashoffset="-200.6"
                  fill="none"
                  className="cursor-pointer transition-all hover:opacity-90"
                  onClick={() => setSelectedDonutSegment("cash")}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[9px] text-[#787f92] uppercase font-bold">Total</span>
                <span className="text-sm font-extrabold font-mono text-[#11101d] dark:text-white">₹3.08L</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs flex-1">
              <div
                onClick={() => setSelectedDonutSegment("upi")}
                className={`p-2 rounded-xl cursor-pointer transition-all border ${
                  selectedDonutSegment === "upi"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700"
                    : "border-transparent hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex justify-between items-center font-bold">
                  <span className="text-emerald-700 dark:text-emerald-400">● UPI (48%)</span>
                  <span className="font-mono text-[#11101d] dark:text-white">₹1,48,000</span>
                </div>
              </div>

              <div
                onClick={() => setSelectedDonutSegment("credit")}
                className={`p-2 rounded-xl cursor-pointer transition-all border ${
                  selectedDonutSegment === "credit"
                    ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700"
                    : "border-transparent hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex justify-between items-center font-bold">
                  <span className="text-indigo-700 dark:text-indigo-400">● Credit (36%)</span>
                  <span className="font-mono text-[#11101d] dark:text-white">₹1,12,000</span>
                </div>
              </div>

              <div
                onClick={() => setSelectedDonutSegment("cash")}
                className={`p-2 rounded-xl cursor-pointer transition-all border ${
                  selectedDonutSegment === "cash"
                    ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700"
                    : "border-transparent hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex justify-between items-center font-bold">
                  <span className="text-amber-700 dark:text-amber-400">● Cash (16%)</span>
                  <span className="font-mono text-[#11101d] dark:text-white">₹48,000</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.05] flex justify-between items-center text-xs">
            <span className="text-[10px] text-[#787f92]">Zero bad debts</span>
            <button
              onClick={() => setActiveOfficeTab("billing")}
              className="text-indigo-700 dark:text-indigo-300 font-bold hover:underline flex items-center gap-1"
            >
              Invoices & Accounts <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. ORDERS PIPELINE & MINIMAL DETAILED PANE                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Orders Pipeline */}
        <div className="lg:col-span-8 neo-card-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#11101d] dark:text-white font-heading">
                Live Orders Pipeline
              </h3>
              <p className="text-xs text-[#787f92]">
                Commodities in fulfillment stages
              </p>
            </div>
            <button
              onClick={() => setActiveOfficeTab("inventory")}
              className="text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:underline flex items-center gap-1"
            >
              Inventory <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[10px] text-[#787f92] font-bold">
                  <th className="text-left font-bold pb-1">COMMODITY</th>
                  <th className="pb-1 cursor-pointer hover:underline" onClick={() => setActiveOfficeTab("orders")}>ORDER</th>
                  <th className="pb-1 cursor-pointer hover:underline" onClick={() => setActiveOfficeTab("orders")}>CONFIRM</th>
                  <th className="pb-1 cursor-pointer hover:underline" onClick={() => setActiveOfficeTab("inventory")}>RESERVE</th>
                  <th className="pb-1 cursor-pointer hover:underline" onClick={() => setActiveOfficeTab("orders")}>PICK</th>
                  <th className="pb-1 cursor-pointer hover:underline" onClick={() => setActiveOfficeTab("orders")}>PACK</th>
                  <th className="pb-1 cursor-pointer hover:underline" onClick={() => setActiveOfficeTab("delivery")}>DISPATCH</th>
                </tr>
              </thead>
              <tbody>
                {/* Row 1: Tomato */}
                <tr
                  onClick={() =>
                    setSelectedItemDetail({
                      type: "stock",
                      title: "Tomato Hybrid",
                      subtitle: "Cold Yard A",
                      stats: [
                        { label: "Physical", value: "850 kg", highlight: true },
                        { label: "Reserved", value: "320 kg" },
                        { label: "Available", value: "530 kg" },
                        { label: "Rate", value: "₹35/kg" },
                      ],
                      tags: ["Fresh Arrival", "QC Approved"],
                      description: "Daily harvest received from Commission Agent 42.",
                    })
                  }
                  className="cursor-pointer hover:opacity-95"
                >
                  <td className="text-left font-bold text-[#11101d] dark:text-white py-2 flex items-center gap-1.5">
                    <span>Tomato Hybrid</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveOfficeTab("inventory")
                      }}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-indigo-600 dark:text-indigo-400"
                      title="Open in Inventory"
                    >
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                  <td>
                    <div className="mx-1 py-2 rounded-xl bg-[#e5ecfa] dark:bg-[#151c33] text-[#1a2448] dark:text-[#c4d2fa] font-bold">
                      50 kg
                    </div>
                  </td>
                  <td>
                    <div className="mx-1 py-2 rounded-xl bg-[#e5ecfa] dark:bg-[#151c33] text-[#1a2448] dark:text-[#c4d2fa] font-bold">
                      50 kg
                    </div>
                  </td>
                  <td>
                    <div className="mx-1 py-2 rounded-xl bg-[#e5ecfa] dark:bg-[#151c33] text-[#1a2448] dark:text-[#c4d2fa] font-bold">
                      50 kg
                    </div>
                  </td>
                  <td>
                    <div className="mx-1 py-2 rounded-xl bg-[#e5ecfa] dark:bg-[#151c33] text-[#1a2448] dark:text-[#c4d2fa] font-bold">
                      40 kg
                    </div>
                  </td>
                  <td>
                    <div className="mx-1 py-2 rounded-xl bg-[#e5ecfa] dark:bg-[#151c33] text-[#1a2448] dark:text-[#c4d2fa] font-bold">
                      30 kg
                    </div>
                  </td>
                  <td>
                    <div className="mx-1 py-2 rounded-xl bg-[#e5ecfa] dark:bg-[#151c33] text-[#1a2448] dark:text-[#c4d2fa] font-bold">
                      10 kg
                    </div>
                  </td>
                </tr>

                {/* Row 2: Onion */}
                <tr
                  onClick={() =>
                    setSelectedItemDetail({
                      type: "stock",
                      title: "Nashik Red Onion",
                      subtitle: "Depot C",
                      stats: [
                        { label: "Physical", value: "2,400 kg", highlight: true },
                        { label: "Reserved", value: "650 kg" },
                        { label: "Available", value: "1,750 kg" },
                        { label: "Rate", value: "₹46/kg" },
                      ],
                      tags: ["Bulk Stock", "Dry Yard"],
                      description: "Nashik red onion export grade with 7-day shelf resilience.",
                    })
                  }
                  className="cursor-pointer hover:opacity-95"
                >
                  <td className="text-left font-bold text-[#11101d] dark:text-white py-2 flex items-center gap-1.5">
                    <span>Nashik Red Onion</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveOfficeTab("inventory")
                      }}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-sky-600 dark:text-sky-400"
                      title="Open in Inventory"
                    >
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                  <td>
                    <div className="mx-1 py-2 rounded-xl bg-[#e0f1fc] dark:bg-[#0e2136] text-[#102d44] dark:text-[#bde1fc] font-bold">
                      100 kg
                    </div>
                  </td>
                  <td>
                    <div className="mx-1 py-2 rounded-xl bg-[#e0f1fc] dark:bg-[#0e2136] text-[#102d44] dark:text-[#bde1fc] font-bold">
                      100 kg
                    </div>
                  </td>
                  <td>
                    <div className="mx-1 py-2 rounded-xl bg-[#e0f1fc] dark:bg-[#0e2136] text-[#102d44] dark:text-[#bde1fc] font-bold">
                      100 kg
                    </div>
                  </td>
                  <td>
                    <div className="mx-1 py-2 rounded-xl bg-[#e0f1fc] dark:bg-[#0e2136] text-[#102d44] dark:text-[#bde1fc] font-bold">
                      80 kg
                    </div>
                  </td>
                  <td>
                    <div className="mx-1 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 font-medium">-</div>
                  </td>
                  <td>
                    <div className="mx-1 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 font-medium">-</div>
                  </td>
                </tr>

                {/* Row 3: Rice */}
                <tr
                  onClick={() =>
                    setSelectedItemDetail({
                      type: "stock",
                      title: "Ponni Boiled Rice",
                      subtitle: "Rice Godown B",
                      stats: [
                        { label: "Total Sacks", value: "340 bags", highlight: true },
                        { label: "Reserved", value: "45 bags" },
                        { label: "Available", value: "295 bags" },
                        { label: "Rate", value: "₹1,350/bag" },
                      ],
                      tags: ["Tanjore Gold", "25kg Standard"],
                      description: "Premium single-boiled Ponni rice for hotel caterers.",
                    })
                  }
                  className="cursor-pointer hover:opacity-95"
                >
                  <td className="text-left font-bold text-[#11101d] dark:text-white py-2 flex items-center gap-1.5">
                    <span>Ponni Rice (25kg)</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveOfficeTab("inventory")
                      }}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-fuchsia-600 dark:text-fuchsia-400"
                      title="Open in Inventory"
                    >
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                  <td>
                    <div className="mx-1 py-2 rounded-xl bg-[#fae2f0] dark:bg-[#251020] text-[#421631] dark:text-[#f4cbe6] font-bold">
                      20 bags
                    </div>
                  </td>
                  <td>
                    <div className="mx-1 py-2 rounded-xl bg-[#fae2f0] dark:bg-[#251020] text-[#421631] dark:text-[#f4cbe6] font-bold">
                      20 bags
                    </div>
                  </td>
                  <td>
                    <div className="mx-1 py-2 rounded-xl bg-[#fae2f0] dark:bg-[#251020] text-[#421631] dark:text-[#f4cbe6] font-bold">
                      20 bags
                    </div>
                  </td>
                  <td>
                    <div className="mx-1 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 font-medium">-</div>
                  </td>
                  <td>
                    <div className="mx-1 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 font-medium">-</div>
                  </td>
                  <td>
                    <div className="mx-1 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 font-medium">-</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Minimal Detailed Pane */}
        <div className="lg:col-span-4 space-y-4">
          {selectedItemDetail ? (
            <div className="neo-card-white p-5 space-y-3.5 relative border border-white/80 dark:border-white/10 animate-in fade-in duration-200">
              <div className="flex justify-between items-start border-b border-black/[0.06] dark:border-white/[0.06] pb-2.5">
                <div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                    Inspector
                  </div>
                  <h4 className="text-sm font-bold text-[#11101d] dark:text-white font-heading mt-0.5">
                    {selectedItemDetail.title}
                  </h4>
                  <div className="text-[11px] text-[#787f92]">
                    {selectedItemDetail.subtitle}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItemDetail(null)}
                  className="text-slate-400 hover:text-[#11101d] dark:hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 4 Stat Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {selectedItemDetail.stats.map((s, idx) => (
                  <div key={idx} className="p-2.5 rounded-2xl neo-pill-well">
                    <div className="text-[10px] text-[#787f92] font-semibold">{s.label}</div>
                    <div
                      className={`text-sm font-bold font-mono mt-0.5 ${
                        s.highlight ? "text-indigo-600 dark:text-indigo-400" : "text-[#11101d] dark:text-white"
                      }`}
                    >
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {selectedItemDetail.tags.map((t, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e5ecfa] dark:bg-[#1a223d] text-[#1a2448] dark:text-[#c4d2fa]"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Clean 1-line note */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] text-xs text-[#3b3852] dark:text-[#d3d0ea] border border-black/5 dark:border-white/5">
                {selectedItemDetail.description}
              </div>

              {/* Quick Actions */}
              <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between gap-2">
                {selectedItemDetail.type === "order" && (
                  <>
                    <button
                      onClick={() => setActiveOfficeTab("orders")}
                      className="flex-1 py-2 rounded-xl text-xs font-bold neo-dock-active flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Orders <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveOfficeTab("delivery")}
                      className="py-2 px-3 rounded-xl text-xs font-bold neo-pill-well text-[#11101d] dark:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" /> Fleet
                    </button>
                  </>
                )}
                {selectedItemDetail.type === "stock" && (
                  <>
                    <button
                      onClick={() => setActiveOfficeTab("inventory")}
                      className="flex-1 py-2 rounded-xl text-xs font-bold neo-dock-active flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Inventory <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveOfficeTab("rates")}
                      className="py-2 px-3 rounded-xl text-xs font-bold neo-pill-well text-[#11101d] dark:text-white cursor-pointer"
                    >
                      Rates
                    </button>
                  </>
                )}
                {selectedItemDetail.type === "collection" && (
                  <>
                    <button
                      onClick={() => setActiveOfficeTab("billing")}
                      className="flex-1 py-2 rounded-xl text-xs font-bold neo-dock-active flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Billing <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveOfficeTab("purchase")}
                      className="py-2 px-3 rounded-xl text-xs font-bold neo-pill-well text-[#11101d] dark:text-white cursor-pointer"
                    >
                      POs
                    </button>
                  </>
                )}
                {selectedItemDetail.type === "buyer" && (
                  <button
                    onClick={() => setActiveOfficeTab("billing")}
                    className="w-full py-2 rounded-xl text-xs font-bold neo-dock-active flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Buyer Ledger <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="neo-card-white p-6 text-center text-xs text-[#787f92] space-y-2">
              <Sparkles className="w-6 h-6 mx-auto text-indigo-500 animate-pulse" />
              <div className="font-bold text-[#11101d] dark:text-white">Quick Inspector</div>
              <p>Click any pipeline lot or metric to inspect.</p>
            </div>
          )}

          {/* Key Buyers */}
          <div className="neo-card-white p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#11101d] dark:text-white font-heading">
              Key Buyers
            </h3>

            <div className="space-y-2 text-xs">
              <div
                onClick={() =>
                  setSelectedItemDetail({
                    type: "buyer",
                    title: "Hotel Annapoorna",
                    subtitle: "Tier 1 Account",
                    stats: [
                      { label: "Credit Limit", value: "₹1,50,000", highlight: true },
                      { label: "Current Due", value: "₹42,500" },
                      { label: "Terms", value: "7 Days Net" },
                      { label: "Monthly", value: "1,200 kg" },
                    ],
                    tags: ["Daily Delivery", "Direct Route"],
                    description: "Key hospitality buyer for tomatoes and Ponni rice.",
                  })
                }
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#e5ecfa] dark:bg-[#1a223d] text-[#1a2448] dark:text-[#c4d2fa] font-bold text-xs flex items-center justify-center">
                    HA
                  </div>
                  <div>
                    <div className="font-bold text-[#11101d] dark:text-white">Hotel Annapoorna</div>
                    <div className="text-[10px] text-[#787f92]">₹42k due • 7 Days</div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveOfficeTab("billing")
                  }}
                  title="View Billing"
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-indigo-600 dark:text-indigo-400"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div
                onClick={() =>
                  setSelectedItemDetail({
                    type: "buyer",
                    title: "Saravana Bhavan",
                    subtitle: "Express Account",
                    stats: [
                      { label: "Credit Limit", value: "₹2,00,000", highlight: true },
                      { label: "Current Due", value: "₹0 (Settled)" },
                      { label: "Payment", value: "UPI Instant" },
                      { label: "Monthly", value: "2,100 kg" },
                    ],
                    tags: ["Fast Moving", "Zero Due"],
                    description: "Prompt settlement buyer with instant UPI payments.",
                  })
                }
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#fae2f0] dark:bg-[#2e1526] text-[#421631] dark:text-[#f4cbe6] font-bold text-xs flex items-center justify-center">
                    SB
                  </div>
                  <div>
                    <div className="font-bold text-[#11101d] dark:text-white">Saravana Bhavan</div>
                    <div className="text-[10px] text-[#787f92]">Zero Due • UPI</div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveOfficeTab("billing")
                  }}
                  title="View Billing"
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-indigo-600 dark:text-indigo-400"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
