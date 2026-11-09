"use client"

import React, { useState } from "react"
import {
  Warehouse,
  AlertTriangle,
  Plus,
  ArrowRightLeft,
  Scale,
  X,
  Check,
  PackageCheck,
  TrendingDown,
} from "lucide-react"
import { useMandiStore } from "@/lib/mandi-store"
import { RealtimeRefreshButton } from "@/components/realtime-refresh-button"

export const InventoryTab: React.FC = () => {
  const { stockLedger, logSpoilage, increaseStock, products } = useMandiStore()
  const [selectedWarehouse, setSelectedWarehouse] = useState("all")
  const [isIncreaseModalOpen, setIsIncreaseModalOpen] = useState(false)
  const [isSpoilageModalOpen, setIsSpoilageModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [isCountModalOpen, setIsCountModalOpen] = useState(false)

  // Increase stock form state
  const [increaseProduct, setIncreaseProduct] = useState("Tomato Hybrid")
  const [increaseQty, setIncreaseQty] = useState(50)
  const [increaseWarehouse, setIncreaseWarehouse] = useState("Central Cold Storage Yard A")
  const [increaseReason, setIncreaseReason] = useState("Direct Farm Purchase / Gate Inward")
  const [increaseRef, setIncreaseRef] = useState("MANDI-REC-001")
  const [increaseSuccess, setIncreaseSuccess] = useState<string | null>(null)

  // Form states
  const [spoilageProduct, setSpoilageProduct] = useState("Tomato Hybrid")
  const [spoilageQty, setSpoilageQty] = useState(10)
  const [spoilageReason, setSpoilageReason] = useState("Cull & soft rot sorted")

  const [transferProduct, setTransferProduct] = useState("Ponni Boiled Rice (25kg)")
  const [transferQty, setTransferQty] = useState(20)
  const [transferTarget, setTransferTarget] = useState("Central Cold Storage Yard A")
  const [transferSuccess, setTransferSuccess] = useState(false)

  const [countProduct, setCountProduct] = useState("Tomato Hybrid")
  const [physicalCount, setPhysicalCount] = useState(840)
  const [countResult, setCountResult] = useState<string | null>(null)

  const filteredStock = stockLedger.filter((item) => {
    if (selectedWarehouse === "all") return true
    if (selectedWarehouse === "cold") return item.warehouse.includes("Cold Storage")
    if (selectedWarehouse === "rice") return item.warehouse.includes("Rice Godown")
    if (selectedWarehouse === "groc") return item.warehouse.includes("Groceries")
    return true
  })

  const handleIncreaseStockSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const num = Number(increaseQty)
    if (isNaN(num) || num <= 0) return

    const prod = products.find((p) => p.name === increaseProduct)
    if (!prod) return

    increaseStock(prod.id, num, increaseWarehouse, increaseReason, increaseRef)
    setIncreaseSuccess(`Successfully added +${num} ${prod.unit} to ${increaseProduct}!`)

    setTimeout(() => {
      setIncreaseSuccess(null)
      setIsIncreaseModalOpen(false)
    }, 900)
  }

  const handleLogSpoilageSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const prod = products.find((p) => p.name === spoilageProduct)
    const cost = prod?.purchasePrice || 30
    logSpoilage({
      productName: spoilageProduct,
      warehouse: "Central Cold Storage Yard A",
      qty: Number(spoilageQty),
      unit: prod?.unit || "kg",
      estimatedLoss: Number(spoilageQty) * cost,
      reason: spoilageReason,
      approvedBy: "Rajesh Kumar (Owner)",
    })
    setIsSpoilageModalOpen(false)
  }

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTransferSuccess(true)
    setTimeout(() => {
      setTransferSuccess(false)
      setIsTransferModalOpen(false)
    }, 1000)
  }

  const handleCountCheck = (e: React.FormEvent) => {
    e.preventDefault()
    const stock = stockLedger.find((s) => s.productName === countProduct)
    const sys = stock?.physicalQty || 850
    const diff = Number(physicalCount) - sys
    if (diff === 0) {
      setCountResult("Exact Match! Physical count reconciles perfectly with system ledger.")
    } else if (diff < 0) {
      setCountResult(`Shortage of ${Math.abs(diff)} units detected against system records (${sys}). Flagged for audit.`)
    } else {
      setCountResult(`Surplus of ${diff} units found beyond recorded stock (${sys}).`)
    }
  }

  return (
    <div className="space-y-6">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP HEADER & WAREHOUSE ACTIONS                             */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="page-heading flex items-center gap-2.5 text-[#11101d] dark:text-white">
            <Warehouse className="w-5 h-5 text-emerald-500 shrink-0" />
            Inventory & Yards
          </h3>
          <p className="page-subheading mt-0.5">
            Real-time stock ledger, physical audit reconciliation & yard transfers
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setIncreaseProduct(products[0]?.name || "Tomato Hybrid")
              setIncreaseQty(50)
              setIsIncreaseModalOpen(true)
            }}
            className="h-9 px-3.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Increase Stock
          </button>

          <button
            onClick={() => setIsSpoilageModalOpen(true)}
            className="h-9 px-3.5 rounded-xl text-xs font-bold bg-[#fae2f1] dark:bg-pink-950/50 text-[#7a225a] dark:text-pink-300 border border-[#f3cadf] dark:border-pink-800/40 flex items-center gap-1.5 hover:opacity-90 transition-opacity hover-glow-purple cursor-pointer active:scale-95"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Log Spoilage
          </button>

          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="h-9 px-3.5 rounded-xl text-xs font-bold neo-pill-well text-[#181628] dark:text-white flex items-center gap-1.5 hover:bg-white dark:hover:bg-white/10 transition-colors hover-glow-cyan cursor-pointer active:scale-95"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#1b5182] dark:text-sky-400" />
            Transfer
          </button>

          <button
            onClick={() => setIsCountModalOpen(true)}
            className="h-9 px-3.5 rounded-xl text-xs font-bold neo-pill-well text-[#181628] dark:text-white flex items-center gap-1.5 hover:bg-white dark:hover:bg-white/10 transition-colors hover-glow-purple cursor-pointer active:scale-95"
          >
            <Scale className="w-3.5 h-3.5 text-[#293a7d] dark:text-indigo-400" />
            Count Check
          </button>

          <RealtimeRefreshButton showLabel label="Sync" />
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar py-0.5">
        <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl neo-pill-well">
          {[
            { id: "all", label: "All Facilities" },
            { id: "cold", label: "Cold Yard A" },
            { id: "rice", label: "Rice Godown B" },
            { id: "groc", label: "Groceries Depot C" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedWarehouse(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedWarehouse === tab.id
                  ? "neo-dock-active shadow-sm"
                  : "text-[#62687a] dark:text-[#9ea0be] hover:text-[#181628] dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. REAL-TIME STOCK LEDGER TABLE                               */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="neo-card-white overflow-hidden p-2">
        <div className="p-4 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#181628] dark:text-white font-heading flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-[#181628] dark:text-sky-400" />
            Commodity Stock Ledger
          </h3>
          <span className="text-xs text-[#787f92] dark:text-[#9496b0]">
            Live Godown Balance
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] dark:border-white/[0.06] text-[#787f92] dark:text-[#9496b0] font-bold">
                <th className="py-3 px-4">COMMODITY</th>
                <th className="py-3 px-4">LOCATION</th>
                <th className="py-3 px-4">PHYSICAL</th>
                <th className="py-3 px-4">RESERVED</th>
                <th className="py-3 px-4">AVAILABLE</th>
                <th className="py-3 px-4">REORDER</th>
                <th className="py-3 px-4">VALUATION</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04] text-[#3b4152] dark:text-[#d7d6e6] font-medium">
              {filteredStock.map((item, idx) => {
                const isLow = item.availableQty <= item.reorderThreshold
                const valuation = item.physicalQty * item.avgCost
                return (
                  <tr key={idx} className={isLow ? "bg-amber-500/10" : "hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"}>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#181628] dark:text-white">{item.productName}</div>
                      <div className="text-[10px] text-[#787f92] dark:text-[#8d8ea6]">Avg Cost: ₹{item.avgCost}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-[#181628] dark:text-white">{item.warehouse}</div>
                      <div className="text-[10px] text-[#787f92] dark:text-[#8d8ea6]">{item.location}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#181628] dark:text-white">
                      {item.physicalQty.toLocaleString()} units
                    </td>
                    <td className="py-3 px-4 text-amber-700 dark:text-amber-400 font-bold">
                      {item.reservedQty.toLocaleString()} units
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700 dark:text-emerald-400">
                      {item.availableQty.toLocaleString()} units
                    </td>
                    <td className="py-3 px-4 text-[#787f92] dark:text-[#8d8ea6]">
                      {item.reorderThreshold} units
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#181628] dark:text-white">
                      ₹{valuation.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isLow
                            ? "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300/40"
                            : "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40"
                        }`}
                      >
                        {isLow ? "Low Stock" : "Normal"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setIncreaseProduct(item.productName)
                          setIncreaseWarehouse(item.warehouse)
                          setIncreaseQty(50)
                          setIsIncreaseModalOpen(true)
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 inline-flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                        title="Increase stock for this commodity"
                      >
                        <Plus className="w-3 h-3" />
                        + Stock
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Spoilage Modal */}
      {isSpoilageModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0d0c18]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-2xl border border-white/60 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#181628] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Log Commodity Spoilage / Sort Waste
              </h3>
              <button onClick={() => setIsSpoilageModalOpen(false)} className="text-[#787f92] hover:text-[#181628]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleLogSpoilageSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[#3b4152] font-bold block mb-1">Select Commodity</label>
                <select
                  value={spoilageProduct}
                  onChange={(e) => setSpoilageProduct(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] font-medium focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[#3b4152] font-bold block mb-1">Quantity Dumped</label>
                <input
                  type="number"
                  value={spoilageQty}
                  onChange={(e) => setSpoilageQty(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] font-bold focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[#3b4152] font-bold block mb-1">Reason (Cull / Transit Loss / Rot)</label>
                <input
                  type="text"
                  value={spoilageReason}
                  onChange={(e) => setSpoilageReason(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] focus:outline-none"
                  required
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSpoilageModalOpen(false)}
                  className="px-4 py-2 font-bold text-[#787f92]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl neo-dock-active font-bold shadow-md"
                >
                  Deduct & Log Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0d0c18]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-2xl border border-white/60 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#181628] flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-[#1b5182]" />
                Warehouse Internal Movement
              </h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-[#787f92] hover:text-[#181628]">
                <X className="w-4 h-4" />
              </button>
            </div>
            {transferSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center">
                Transfer movement logged and inventory updated!
              </div>
            ) : (
              <form onSubmit={handleTransferSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-[#3b4152] font-bold block mb-1">Select Item</label>
                  <select
                    value={transferProduct}
                    onChange={(e) => setTransferProduct(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] font-medium focus:outline-none"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#3b4152] font-bold block mb-1">Transfer Units</label>
                  <input
                    type="number"
                    value={transferQty}
                    onChange={(e) => setTransferQty(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] font-bold focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[#3b4152] font-bold block mb-1">Destination Facility</label>
                  <input
                    type="text"
                    value={transferTarget}
                    onChange={(e) => setTransferTarget(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] focus:outline-none"
                    required
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTransferModalOpen(false)}
                    className="px-4 py-2 font-bold text-[#787f92]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl neo-dock-active font-bold shadow-md"
                  >
                    Execute Movement
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Count Reconciliation Modal */}
      {isCountModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0d0c18]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-2xl border border-white/60 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#181628] flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#293a7d]" />
                Daily Physical Stock Reconciliation
              </h3>
              <button onClick={() => { setIsCountModalOpen(false); setCountResult(null); }} className="text-[#787f92] hover:text-[#181628]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCountCheck} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[#3b4152] font-bold block mb-1">Item to Audit</label>
                <select
                  value={countProduct}
                  onChange={(e) => setCountProduct(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] font-medium focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[#3b4152] font-bold block mb-1">Physical Scale / Tally Count</label>
                <input
                  type="number"
                  value={physicalCount}
                  onChange={(e) => setPhysicalCount(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] font-bold focus:outline-none"
                  required
                />
              </div>
              {countResult && (
                <div className="p-3.5 rounded-2xl bg-[#e5edfc] text-[#293a7d] text-xs font-bold">
                  {countResult}
                </div>
              )}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsCountModalOpen(false); setCountResult(null); }}
                  className="px-4 py-2 font-bold text-[#787f92]"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl neo-dock-active font-bold shadow-md"
                >
                  Check Variance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Increase Stock Modal */}
      {isIncreaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0d0c18]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#181628] rounded-3xl p-6 space-y-4 shadow-2xl border border-white/60 dark:border-white/10 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <h3 className="text-sm font-bold text-[#181628] dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                Increase Inventory / Manual Stock-In
              </h3>
              <button
                onClick={() => {
                  setIsIncreaseModalOpen(false)
                  setIncreaseSuccess(null)
                }}
                className="text-[#787f92] hover:text-[#181628] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {increaseSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center border border-emerald-300/40">
                {increaseSuccess}
              </div>
            ) : (
              <form onSubmit={handleIncreaseStockSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-[#3b4152] dark:text-[#d7d6e6] font-bold block mb-1">
                    Commodity to Increase
                  </label>
                  <select
                    value={increaseProduct}
                    onChange={(e) => setIncreaseProduct(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] dark:text-white font-medium focus:outline-none"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({p.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[#3b4152] dark:text-[#d7d6e6] font-bold block mb-1">
                    Warehouse / Yard Facility
                  </label>
                  <select
                    value={increaseWarehouse}
                    onChange={(e) => setIncreaseWarehouse(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] dark:text-white font-medium focus:outline-none"
                  >
                    <option value="Central Cold Storage Yard A">Central Cold Storage Yard A</option>
                    <option value="Rice Godown B (Hebbal)">Rice Godown B (Hebbal)</option>
                    <option value="Groceries Depot C">Groceries Depot C</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#3b4152] dark:text-[#d7d6e6] font-bold block mb-1">
                      Units to Add
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={increaseQty}
                      onChange={(e) => setIncreaseQty(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] dark:text-white font-bold focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[#3b4152] dark:text-[#d7d6e6] font-bold block mb-1">
                      Reference / Pass No.
                    </label>
                    <input
                      type="text"
                      value={increaseRef}
                      onChange={(e) => setIncreaseRef(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] dark:text-white focus:outline-none"
                      placeholder="e.g. INW-2026-001"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#3b4152] dark:text-[#d7d6e6] font-bold block mb-1">
                    Reason / Source
                  </label>
                  <select
                    value={increaseReason}
                    onChange={(e) => setIncreaseReason(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] dark:text-white focus:outline-none font-medium"
                  >
                    <option value="Direct Farm Purchase / Gate Inward">Direct Farm Purchase / Gate Inward</option>
                    <option value="Physical Audit Surplus Adjustment">Physical Audit Surplus Adjustment</option>
                    <option value="Customer Return Inspected & Restocked">Customer Return Inspected & Restocked</option>
                    <option value="Opening Balance Correction">Opening Balance Correction</option>
                  </select>
                </div>

                {/* Stock Live Preview */}
                {(() => {
                  const currentItem = stockLedger.find((s) => s.productName === increaseProduct)
                  const curPhys = currentItem?.physicalQty || 0
                  const curAvail = currentItem?.availableQty || 0
                  const addNum = Number(increaseQty) || 0
                  return (
                    <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30 text-[11px] space-y-1">
                      <div className="flex justify-between font-medium text-[#3b4152] dark:text-[#d7d6e6]">
                        <span>Current Physical:</span>
                        <span>
                          {curPhys.toLocaleString()} → <strong className="text-emerald-700 dark:text-emerald-400">{(curPhys + addNum).toLocaleString()}</strong> units
                        </span>
                      </div>
                      <div className="flex justify-between font-medium text-[#3b4152] dark:text-[#d7d6e6]">
                        <span>Current Available:</span>
                        <span>
                          {curAvail.toLocaleString()} → <strong className="text-emerald-700 dark:text-emerald-400">{(curAvail + addNum).toLocaleString()}</strong> units
                        </span>
                      </div>
                    </div>
                  )
                })()}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsIncreaseModalOpen(false)
                      setIncreaseSuccess(null)
                    }}
                    className="px-4 py-2 font-bold text-[#787f92] dark:text-[#9ea0be]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer active:scale-95 transition-all"
                  >
                    Confirm & Inward Stock
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
