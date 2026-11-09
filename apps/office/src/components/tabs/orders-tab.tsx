"use client"

import React, { useState } from "react"
import {
  ShoppingCart,
  Search,
  Filter,
  Check,
  X,
  FileText,
  Clock,
  Layers,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  Eye,
  CheckCircle2,
  Package,
} from "lucide-react"
import { useMandiStore, OrderRecord } from "@/lib/mandi-store"
import { RealtimeRefreshButton } from "@/components/realtime-refresh-button"

export const OrdersTab: React.FC = () => {
  const {
    orders,
    stockLedger,
    approveOrder,
    updateOrderStatus,
    cancelOrder,
  } = useMandiStore()

  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || "MC-8921")
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0]

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "all") return true
    if (statusFilter === "pending") return order.status === "pending"
    if (statusFilter === "confirmed")
      return order.status === "confirmed" || order.status === "reserved"
    if (statusFilter === "dispatch")
      return (
        order.status === "picking" ||
        order.status === "packed" ||
        order.status === "dispatched"
      )
    if (statusFilter === "delivered")
      return order.status === "delivered" || order.status === "completed"
    if (statusFilter === "cancelled") return order.status === "cancelled"
    return true
  })

  return (
    <div className="space-y-6">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP HEADER & FILTER PILLS BAR                               */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="page-heading flex items-center gap-2.5 text-[#11101d] dark:text-white">
            <ShoppingCart className="w-5 h-5 text-indigo-500 shrink-0" />
            Wholesale Orders
          </h3>
          <p className="page-subheading mt-0.5">
            Incoming buyer orders, credit reservations & dispatch pipeline
          </p>
        </div>
        <RealtimeRefreshButton showLabel label="Sync" />
      </div>

      <div className="overflow-x-auto no-scrollbar py-0.5">
        <div className="inline-flex items-center gap-1 p-1 rounded-2xl neo-pill-well">
          {[
            { id: "all", label: "All", count: orders.length },
            { id: "pending", label: "Pending", count: orders.filter((o) => o.status === "pending").length },
            { id: "confirmed", label: "Confirmed", count: orders.filter((o) => o.status === "confirmed" || o.status === "reserved").length },
            { id: "dispatch", label: "Transit", count: orders.filter((o) => ["picking", "packed", "dispatched"].includes(o.status)).length },
            { id: "delivered", label: "Delivered", count: orders.filter((o) => o.status === "delivered" || o.status === "completed").length },
            { id: "cancelled", label: "Cancelled", count: orders.filter((o) => o.status === "cancelled").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                statusFilter === tab.id
                  ? "neo-dock-active shadow-sm"
                  : "text-[#62687a] dark:text-[#9ea0be] hover:text-[#181628] dark:hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  statusFilter === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. MAIN ORDERS SPLIT VIEW                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Orders Table */}
        <div className="lg:col-span-8 neo-card-white overflow-hidden p-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/[0.06] dark:border-white/[0.06] text-[#787f92] dark:text-[#9496b0] font-bold">
                  <th className="py-3 px-4">ORDER</th>
                  <th className="py-3 px-4">BUYER</th>
                  <th className="py-3 px-4">CHANNEL</th>
                  <th className="py-3 px-4">TOTAL</th>
                  <th className="py-3 px-4">PAYMENT</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04] text-[#3b4152] dark:text-[#d7d6e6] font-medium">
                {filteredOrders.map((order) => {
                  const isSelected = selectedOrderId === order.id
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`cursor-pointer transition-all duration-200 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] ${
                        isSelected ? "bg-indigo-500/10 font-semibold" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-[#181628] dark:text-white">{order.id}</div>
                        <div className="text-[10px] text-[#787f92] dark:text-[#8d8ea6]">{order.time}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#181628] dark:text-white">{order.customer}</div>
                        <div className="text-[10px] text-[#787f92] dark:text-[#8d8ea6]">{order.customerType}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e1f3fe] dark:bg-[#112438] text-[#1b5182] dark:text-[#7ec2f4] border border-sky-200/50 dark:border-sky-800/40">
                          {order.source}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#181628] dark:text-white text-sm font-mono">
                          ₹{order.totalAmount.toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] text-[#787f92] dark:text-[#8d8ea6]">{order.itemsCount} items</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            order.paymentStatus === "Paid"
                              ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40"
                              : order.paymentStatus === "Partial"
                              ? "bg-sky-100 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 border border-sky-300/40"
                              : "bg-[#fae2f1] dark:bg-pink-950/50 text-[#7a225a] dark:text-pink-300 border border-pink-300/40"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === "pending"
                              ? "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300/40"
                              : order.status === "confirmed" || order.status === "reserved"
                              ? "bg-[#e5edfc] dark:bg-indigo-950/50 text-[#293a7d] dark:text-indigo-300 border border-indigo-300/40"
                              : order.status === "delivered"
                              ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40"
                              : order.status === "cancelled"
                              ? "bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-300/40"
                              : "bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border border-purple-300/40"
                          }`}
                        >
                          {order.statusLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedOrderId(order.id)
                          }}
                          className="px-3 py-1 rounded-xl text-xs font-bold neo-pill-well text-[#181628] dark:text-white hover:bg-white dark:hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Order Inspection Details */}
        {selectedOrder && (
          <div className="lg:col-span-4 space-y-4">
            <div className="neo-card-white p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
                <div>
                  <div className="text-[10px] text-[#787f92] dark:text-[#9496b0] font-bold uppercase tracking-wider">
                    Order Details
                  </div>
                  <h3 className="text-base font-bold text-[#181628] dark:text-white font-heading">
                    {selectedOrder.id}
                  </h3>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    selectedOrder.status === "pending"
                      ? "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300"
                      : selectedOrder.status === "confirmed"
                      ? "bg-[#e5edfc] dark:bg-indigo-950/50 text-[#293a7d] dark:text-indigo-300"
                      : selectedOrder.status === "delivered"
                      ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300"
                      : "bg-[#fae2f1] dark:bg-pink-950/50 text-[#7a225a] dark:text-pink-300"
                  }`}
                >
                  {selectedOrder.statusLabel}
                </span>
              </div>

              {/* Customer & Terms */}
              <div className="p-3.5 rounded-2xl neo-pill-well space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#787f92] dark:text-[#9496b0]">Customer:</span>
                  <span className="font-bold text-[#181628] dark:text-white">{selectedOrder.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#787f92] dark:text-[#9496b0]">Channel:</span>
                  <span className="text-[#1b5182] dark:text-[#7ec2f4] font-semibold">{selectedOrder.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#787f92] dark:text-[#9496b0]">Slot:</span>
                  <span className="text-[#181628] dark:text-white font-medium">{selectedOrder.slot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#787f92] dark:text-[#9496b0]">Credit:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedOrder.creditLimitNote}</span>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-[#787f92] dark:text-[#9496b0] uppercase flex items-center justify-between">
                  <span>Commodities</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Rates</span>
                </div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {selectedOrder.items.map((item, idx) => {
                    const stock = stockLedger.find((s) => s.productId === item.productId)
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] text-xs flex justify-between items-center"
                      >
                        <div>
                          <div className="font-bold text-[#181628] dark:text-white">{item.productName}</div>
                          <div className="text-[10px] text-[#787f92] dark:text-[#9496b0]">
                            {item.qty} {item.unit} @ ₹{item.unitPrice}/{item.unit}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#181628] dark:text-white font-mono">₹{item.lineTotal.toLocaleString("en-IN")}</div>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            Stock: {stock?.availableQty || 0} {item.unit}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Order Total */}
              <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] flex justify-between items-center text-xs">
                <span className="text-[#555b6e] dark:text-[#9496b0] font-semibold">Total Amount:</span>
                <span className="text-xl font-bold text-[#181628] dark:text-white font-heading font-mono">
                  ₹{selectedOrder.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Workflow Actions */}
              <div className="space-y-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
                {selectedOrder.status === "pending" && (
                  <button
                    onClick={() => approveOrder(selectedOrder.id)}
                    className="w-full h-10 rounded-xl neo-dock-active flex items-center justify-center gap-2 text-xs font-bold cursor-pointer hover:opacity-95 shadow-md hover-glow-emerald"
                  >
                    <Check className="w-4 h-4 text-emerald-300" />
                    Approve & Reserve
                  </button>
                )}

                {selectedOrder.status === "confirmed" && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, "packed", "Packed in Cold Yard A")}
                    className="w-full h-10 rounded-xl neo-dock-active flex items-center justify-center gap-2 text-xs font-bold cursor-pointer hover:opacity-95 shadow-md hover-glow-cyan"
                  >
                    <Package className="w-4 h-4 text-sky-300" />
                    Mark Packed
                  </button>
                )}

                {selectedOrder.status === "packed" && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, "dispatched", "Loaded on KA-01-AB-1234")}
                    className="w-full h-10 rounded-xl neo-dock-active flex items-center justify-center gap-2 text-xs font-bold cursor-pointer hover:opacity-95 shadow-md hover-glow-purple"
                  >
                    <ArrowRight className="w-4 h-4 text-purple-300" />
                    Dispatch to Driver
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="h-10 rounded-xl neo-pill-well text-xs font-bold text-[#181628] dark:text-white flex items-center justify-center gap-1.5 hover:bg-white dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#1b5182] dark:text-sky-400" />
                    Invoice
                  </button>

                  {selectedOrder.status !== "cancelled" && selectedOrder.status !== "delivered" && (
                    <button
                      onClick={() => cancelOrder(selectedOrder.id, "Cancelled by Admin")}
                      className="h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-xs font-bold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center gap-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Slip Modal Preview */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-[#0d0c18]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#07050e] rounded-3xl p-6 space-y-4 shadow-2xl border border-white/60 dark:border-white/10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#181628] dark:text-sky-400" />
                <h3 className="text-sm font-bold text-[#181628] dark:text-white font-heading">
                  Invoice • {selectedOrder.id}
                </h3>
              </div>
              <button onClick={() => setShowInvoiceModal(false)} className="text-[#787f92] hover:text-[#181628] dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#3b4152] dark:text-[#d7d6e6]">
              <div className="p-3.5 rounded-2xl neo-pill-well space-y-1">
                <div className="font-bold text-[#181628] dark:text-white">{selectedOrder.customer}</div>
                <div className="text-[11px] text-[#787f92] dark:text-[#9496b0]">{selectedOrder.customerType}</div>
                <div className="text-[11px] text-[#787f92] dark:text-[#9496b0]">Payment: {selectedOrder.paymentTerms}</div>
              </div>

              <div className="border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/[0.03] dark:bg-white/[0.04] text-[#787f92] dark:text-[#9496b0]">
                    <tr>
                      <th className="p-2.5">Item</th>
                      <th className="p-2.5">Qty</th>
                      <th className="p-2.5">Rate</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                    {selectedOrder.items.map((i, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold text-[#181628] dark:text-white">{i.productName}</td>
                        <td className="p-2.5">{i.qty} {i.unit}</td>
                        <td className="p-2.5">₹{i.unitPrice}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-[#181628] dark:text-white">₹{i.lineTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-black/[0.06] dark:border-white/[0.06] text-sm font-bold">
                <span className="text-[#181628] dark:text-white">Total Due</span>
                <span className="text-xl font-mono text-[#181628] dark:text-white">₹{selectedOrder.totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold neo-dock-active cursor-pointer hover-glow-purple"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
