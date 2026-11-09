"use client"

import React, { useState } from "react"
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Truck,
  IndianRupee,
  Scale,
  Warehouse,
  ShieldCheck,
  Calendar,
  Layers,
  FileText,
  Users,
  Compass,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { useMandiStore, OfficeTab } from "@/lib/mandi-store"
import { DashboardTab } from "@/components/tabs/dashboard-tab"
import { OrdersTab } from "@/components/tabs/orders-tab"
import { InventoryTab } from "@/components/tabs/inventory-tab"
import { RatesTab } from "@/components/tabs/rates-tab"
import { PurchaseTab } from "@/components/tabs/purchase-tab"
import { DeliveryTab } from "@/components/tabs/delivery-tab"
import { BillingTab } from "@/components/tabs/billing-tab"
import { AuditTab } from "@/components/tabs/audit-tab"

export const OfficeApp: React.FC = () => {
  const { activeOfficeTab, setActiveOfficeTab, orders, stockLedger } = useMandiStore()
  const [isHovered, setIsHovered] = useState(false)
  const [isPinned, setIsPinned] = useState(false)

  const pendingCount = orders.filter((o) => o.status === "pending").length

  const railNavItems: { id: OfficeTab; label: string; icon: any; count?: number; desc: string }[] = [
    { id: "dashboard", label: "Overview", icon: Compass, desc: "Live stats & charts" },
    { id: "orders", label: "Orders", icon: ShoppingCart, count: pendingCount, desc: "Review & dispatch" },
    { id: "inventory", label: "Inventory", icon: Warehouse, desc: "Stock & yards" },
    { id: "rates", label: "Daily Rates", icon: Scale, desc: "Market prices" },
    { id: "purchase", label: "Purchases", icon: Package, desc: "Inward & weighing" },
    { id: "delivery", label: "Fleet & Trips", icon: Truck, desc: "Routes & delivery" },
    { id: "billing", label: "Billing", icon: IndianRupee, desc: "Invoices & ledger" },
    { id: "audit", label: "Audit Trail", icon: ShieldCheck, desc: "Activity history" },
  ]

  // Expanded state is true when hovered near it OR pinned
  const isExpanded = isHovered || isPinned

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden relative">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. LEFT SIDEBAR: VISIBLE ON PC (DESKTOP)                      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden lg:flex py-6 flex-col justify-between border-r border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#07050e] transition-all duration-300 ease-in-out z-20 ${
          isExpanded ? "w-60 px-3.5 shadow-2xl" : "w-20 px-2.5"
        }`}
      >
        <div className="space-y-4 flex flex-col w-full">
          {/* Top Brand Eye / Compass Squircle */}
          <div className="flex items-center gap-3 px-2 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#181628] dark:bg-[#1f1b34] flex-shrink-0 flex items-center justify-center text-white shadow-md hover-glow-purple transition-all">
              <span className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-sky-400 to-pink-400"></span>
              </span>
            </div>

            {isExpanded && (
              <div className="overflow-hidden whitespace-nowrap animate-in fade-in duration-200">
                <div className="font-bold text-xs tracking-wider text-[#11101d] dark:text-white font-heading">
                  MANDI CONNECT
                </div>
                <div className="text-[10px] text-[#55526e] dark:text-[#8e8ca8] font-medium">
                  Yard Operations
                </div>
              </div>
            )}
          </div>

          {/* Navigation Items with visible words */}
          <div className="space-y-1">
            {railNavItems.map((item) => {
              const Icon = item.icon
              const isActive = activeOfficeTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveOfficeTab(item.id)}
                  title={item.label}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-2xl relative cursor-pointer transition-all duration-200 ${isActive
                      ? "neo-dock-active shadow-md"
                      : "text-[#55526e] dark:text-[#a09cbf] hover:bg-white/80 dark:hover:bg-white/5 hover:text-[#11101d] dark:hover:text-white hover-glow-purple"
                    }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Nav Item Title & Description (Visible in Words) */}
                  {isExpanded && (
                    <div className="flex-1 text-left overflow-hidden whitespace-nowrap animate-in fade-in duration-200">
                      <div className="text-xs font-bold leading-tight flex items-center justify-between">
                        <span>{item.label}</span>
                        {item.count && item.count > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-bold">
                            {item.count}
                          </span>
                        ) : null}
                      </div>
                      <div className="text-[10px] opacity-70 font-medium truncate mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                  )}

                  {/* Dot indicator when collapsed */}
                  {!isExpanded && item.count && item.count > 0 ? (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-pink-500"></span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>

        {/* Bottom Rail Utilities / Pin Toggle */}
        <div className="space-y-2 pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={`w-full p-2.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all text-xs font-semibold ${isPinned
                ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                : "text-[#55526e] dark:text-[#a09cbf] hover:bg-white/60 dark:hover:bg-white/5"
              }`}
            title={isPinned ? "Unpin sidebar" : "Pin sidebar expanded"}
          >
            {isPinned ? <ChevronLeft className="w-4 h-4 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 flex-shrink-0" />}
            {isExpanded && (
              <span className="overflow-hidden whitespace-nowrap">
                {isPinned ? "Pinned Open" : "Fold on Leave"}
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. MAIN ACTIVE WORKSPACE AREA                                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden relative">
        {/* Scrollable Tab Content Container with Responsive Padding */}
        <div className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 overflow-y-auto min-w-0 overscroll-contain smooth-scroll pb-24 lg:pb-8">
          <div key={activeOfficeTab} className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-7xl mx-auto">
            {activeOfficeTab === "dashboard" && <DashboardTab />}
            {activeOfficeTab === "orders" && <OrdersTab />}
            {activeOfficeTab === "inventory" && <InventoryTab />}
            {activeOfficeTab === "rates" && <RatesTab />}
            {activeOfficeTab === "purchase" && <PurchaseTab />}
            {activeOfficeTab === "delivery" && <DeliveryTab />}
            {activeOfficeTab === "billing" && <BillingTab />}
            {activeOfficeTab === "audit" && <AuditTab />}
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 3. MOBILE & TABLET BOTTOM NAVIGATION BAR                      */}
        {/* ───────────────────────────────────────────────────────────── */}
        <nav
          aria-label="Mobile and Tablet Bottom Navigation"
          className="lg:hidden shrink-0 bg-white/95 dark:bg-[#07050e]/95 backdrop-blur-xl border-t border-black/[0.08] dark:border-white/[0.08] shadow-[0_-8px_25px_rgba(0,0,0,0.12)] px-2 py-1.5 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar z-30"
          style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
        >
          {railNavItems.map((item) => {
            const Icon = item.icon
            const isActive = activeOfficeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveOfficeTab(item.id)}
                className={`flex-1 min-w-[54px] py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer relative shrink-0 ${
                  isActive
                    ? "neo-dock-active text-white shadow-sm"
                    : "text-[#625f7a] dark:text-[#9ea0be] hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95"
                }`}
              >
                <div className="relative">
                  <Icon className="w-4 h-4" />
                  {item.count && item.count > 0 ? (
                    <span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 rounded-full bg-pink-500 text-white text-[8px] font-bold flex items-center justify-center animate-pulse">
                      {item.count}
                    </span>
                  ) : null}
                </div>
                <span className="text-[9px] font-semibold tracking-tight truncate max-w-[52px] text-center">
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
