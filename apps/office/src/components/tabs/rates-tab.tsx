"use client"

import React, { useState } from "react"
import { Scale, Plus, AlertTriangle, X, Check, TrendingUp, History } from "lucide-react"
import { useMandiStore } from "@/lib/mandi-store"
import { RealtimeRefreshButton } from "@/components/realtime-refresh-button"

export const RatesTab: React.FC = () => {
  const { products, customerPricing, updateDailyRate } = useMandiStore()
  const [isUpdateRatesModalOpen, setIsUpdateRatesModalOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(1)
  const [newRate, setNewRate] = useState(38)
  const [reason, setReason] = useState("APMC auction opening demand high")

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0]

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateDailyRate(selectedProductId, Number(newRate), reason)
    setIsUpdateRatesModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP HEADER & RATE ACTIONS                                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="page-heading flex items-center gap-2.5 text-[#11101d] dark:text-white">
            <Scale className="w-5 h-5 text-amber-500 shrink-0" />
            Daily Mandi Rates
          </h3>
          <p className="page-subheading mt-0.5">
            Morning auction market prices, spot margins & customer-specific contract rates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RealtimeRefreshButton showLabel label="Sync" />
          <button
            onClick={() => {
              setSelectedProductId(1)
              setNewRate(selectedProduct.sellingPrice)
              setIsUpdateRatesModalOpen(true)
            }}
            className="h-10 px-4 rounded-xl text-xs font-bold neo-dock-active flex items-center gap-2 cursor-pointer shadow-md hover-glow-purple"
          >
            <Plus className="w-4 h-4" />
            Update Rates
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. RATE MATRIX TABLE                                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="neo-card-white overflow-hidden p-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] dark:border-white/[0.06] text-[#787f92] dark:text-[#9496b0] font-bold">
                <th className="py-3.5 px-4">COMMODITY</th>
                <th className="py-3.5 px-4">CATEGORY</th>
                <th className="py-3.5 px-4">UNIT</th>
                <th className="py-3.5 px-4">STANDARD</th>
                <th className="py-3.5 px-4">ANNAPOORNA</th>
                <th className="py-3.5 px-4">SARAVANA</th>
                <th className="py-3.5 px-4">GREEN LEAF</th>
                <th className="py-3.5 px-4">TREND</th>
                <th className="py-3.5 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04] text-[#3b4152] dark:text-[#d7d6e6] font-medium">
              {products.map((p) => {
                const pricing = customerPricing.find((cp) => cp.productId === p.id)
                return (
                  <tr key={p.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#181628] dark:text-white">{p.name}</div>
                      <div className="text-[10px] text-[#787f92] dark:text-[#8d8ea6] font-mono">{p.sku}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e5edfc] dark:bg-indigo-950/50 text-[#293a7d] dark:text-indigo-300 border border-indigo-300/40">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">{p.unit}</td>
                    <td className="py-3.5 px-4 font-bold text-[#181628] dark:text-white font-mono text-sm">
                      ₹{p.sellingPrice}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1b5182] dark:text-sky-300">
                      ₹{pricing?.hotelAnnapoorna ?? p.sellingPrice}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#293a7d] dark:text-indigo-300">
                      ₹{pricing?.saravanaBhavan ?? p.sellingPrice}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#7a225a] dark:text-pink-300">
                      ₹{pricing?.greenLeafMess ?? p.sellingPrice}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                        <TrendingUp className="w-3.5 h-3.5" /> +2.4%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedProductId(p.id)
                          setNewRate(p.sellingPrice)
                          setIsUpdateRatesModalOpen(true)
                        }}
                        className="px-3 py-1 rounded-xl text-xs font-bold neo-pill-well text-[#181628] dark:text-white hover:bg-white dark:hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        Revise
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revise Rate Modal */}
      {isUpdateRatesModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0d0c18]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#07050e] rounded-3xl p-6 space-y-4 shadow-2xl border border-white/60 dark:border-white/10 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
              <h3 className="text-sm font-bold text-[#181628] flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#181628]" />
                Revise APMC Selling Rate • {selectedProduct.name}
              </h3>
              <button onClick={() => setIsUpdateRatesModalOpen(false)} className="text-[#787f92] hover:text-[#181628]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[#3b4152] font-bold block mb-1">Select Commodity</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    const id = Number(e.target.value)
                    setSelectedProductId(id)
                    const found = products.find((p) => p.id === id)
                    if (found) setNewRate(found.sellingPrice)
                  }}
                  className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] font-medium focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[#3b4152] font-bold block mb-1">
                  New Selling Rate per {selectedProduct.unit} (₹)
                </label>
                <input
                  type="number"
                  value={newRate}
                  onChange={(e) => setNewRate(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] font-bold text-base focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[#3b4152] font-bold block mb-1">Reason for Revision</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] focus:outline-none"
                  required
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateRatesModalOpen(false)}
                  className="px-4 py-2 font-bold text-[#787f92]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl neo-dock-active font-bold shadow-md cursor-pointer"
                >
                  Publish New Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
