"use client"

import React, { useState } from "react"
import {
  IndianRupee,
  Plus,
  FileText,
  CreditCard,
  Building,
  AlertTriangle,
  CheckCircle2,
  X,
  Check,
} from "lucide-react"
import { useMandiStore } from "@/lib/mandi-store"
import { RealtimeRefreshButton } from "@/components/realtime-refresh-button"

export const BillingTab: React.FC = () => {
  const { invoices, customers, recordPayment } = useMandiStore()
  const [activeSubTab, setActiveSubTab] = useState<"invoices" | "customers">("invoices")
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // Payment form
  const [paymentInvoiceNo, setPaymentInvoiceNo] = useState("INV-2026-00380")
  const [paymentAmount, setPaymentAmount] = useState(5000)
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "CASH" | "BANK">("UPI")
  const [paymentRef, setPaymentRef] = useState("UPI/AXIS/9842104")

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    recordPayment(paymentInvoiceNo, Number(paymentAmount), paymentMethod, paymentRef)
    setIsPaymentModalOpen(false)
  }

  const totalOutstanding = invoices.reduce((acc, inv) => acc + inv.balanceDue, 0)
  const totalBilled = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0)

  return (
    <div className="space-y-6">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP HEADER & SUB TABS                                      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="page-heading flex items-center gap-2.5 text-[#11101d] dark:text-white">
            <IndianRupee className="w-5 h-5 text-emerald-500 shrink-0" />
            Billing & Ledger
          </h3>
          <p className="page-subheading mt-0.5">
            GST wholesale tax invoices, buyer credit balances & payment reconciliation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RealtimeRefreshButton showLabel label="Sync" />
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="h-9 px-4 rounded-xl text-xs font-bold neo-dock-active flex items-center gap-1.5 shadow-md cursor-pointer hover:opacity-95 hover-glow-purple active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-300" />
            Record Payment
          </button>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar py-0.5">
        <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl neo-pill-well">
          <button
            onClick={() => setActiveSubTab("invoices")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubTab === "invoices"
                ? "neo-dock-active shadow-sm"
                : "text-[#62687a] dark:text-[#9ea0be] hover:text-[#181628] dark:hover:text-white"
            }`}
          >
            Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setActiveSubTab("customers")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubTab === "customers"
                ? "neo-dock-active shadow-sm"
                : "text-[#62687a] dark:text-[#9ea0be] hover:text-[#181628] dark:hover:text-white"
            }`}
          >
            Customers ({customers.length})
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. SUMMARY KPI CARDS                                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="neo-card-sky p-5 space-y-1 widget-lift cursor-pointer active:scale-95">
          <div className="text-[11px] text-[#1b5182] dark:text-sky-300 font-bold uppercase tracking-wider">Invoiced Amount</div>
          <div className="text-2xl font-bold text-[#181628] dark:text-white font-heading font-mono">
            ₹{totalBilled.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-[#2c5885] dark:text-sky-400">Total Billed</div>
        </div>

        <div className="neo-card-mauve p-5 space-y-1 widget-lift cursor-pointer active:scale-95">
          <div className="text-[11px] text-[#7a225a] dark:text-pink-300 font-bold uppercase tracking-wider">Receivables</div>
          <div className="text-2xl font-bold text-[#7a225a] dark:text-pink-200 font-heading font-mono">
            ₹{totalOutstanding.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold">Pending Collection</div>
        </div>

        <div className="neo-card-periwinkle p-5 space-y-1 widget-lift cursor-pointer active:scale-95">
          <div className="text-[11px] text-[#293a7d] dark:text-indigo-300 font-bold uppercase tracking-wider">Credit Terms</div>
          <div className="text-xl font-bold text-[#181628] dark:text-white font-heading">7 to 14 Days Net</div>
          <div className="text-[11px] text-[#3d4d8c] dark:text-indigo-300">Standard Buyer Limit</div>
        </div>
      </div>

      <div key={activeSubTab} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* ───────────────────────────────────────────────────────────── */}
        {/* 3. INVOICES LIST                                              */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeSubTab === "invoices" && (
          <div className="neo-card-white overflow-hidden p-2 widget-lift">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/[0.06] dark:border-white/[0.06] text-[#787f92] dark:text-[#9496b0] font-bold">
                  <th className="py-3 px-4">INVOICE</th>
                  <th className="py-3 px-4">CUSTOMER</th>
                  <th className="py-3 px-4">DATE</th>
                  <th className="py-3 px-4">TAXABLE</th>
                  <th className="py-3 px-4">GST</th>
                  <th className="py-3 px-4">TOTAL</th>
                  <th className="py-3 px-4">PAID</th>
                  <th className="py-3 px-4">BALANCE</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04] text-[#3b4152] dark:text-[#d7d6e6] font-medium">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#181628] dark:text-white">{inv.invoiceNo}</td>
                    <td className="py-3 px-4 font-bold text-[#181628] dark:text-white">{inv.customer}</td>
                    <td className="py-3 px-4 text-[#787f92] dark:text-[#8d8ea6]">{inv.date}</td>
                    <td className="py-3 px-4 font-mono">₹{inv.subtotal.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-4 font-mono text-[#787f92] dark:text-[#8d8ea6]">₹{inv.gstAmount.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-4 font-bold text-[#181628] dark:text-white font-mono">
                      ₹{inv.totalAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      ₹{inv.amountPaid.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                      ₹{inv.balanceDue.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.paymentStatus === "Paid"
                            ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40"
                            : inv.paymentStatus === "Partial"
                            ? "bg-[#e5edfc] dark:bg-indigo-950/50 text-[#293a7d] dark:text-indigo-300 border border-indigo-300/40"
                            : "bg-[#fae2f1] dark:bg-pink-950/50 text-[#7a225a] dark:text-pink-300 border border-pink-300/40"
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {inv.balanceDue > 0 && (
                        <button
                          onClick={() => {
                            setPaymentInvoiceNo(inv.invoiceNo)
                            setPaymentAmount(inv.balanceDue)
                            setIsPaymentModalOpen(true)
                          }}
                          className="px-3 py-1 rounded-xl text-xs font-bold neo-dock-active shadow-sm hover-glow-purple cursor-pointer"
                        >
                          Settle
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 4. CUSTOMER LEDGER                                            */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeSubTab === "customers" && (
          <div className="neo-card-white overflow-hidden p-2 widget-lift">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/[0.06] dark:border-white/[0.06] text-[#787f92] dark:text-[#9496b0] font-bold">
                  <th className="py-3 px-4">CUSTOMER</th>
                  <th className="py-3 px-4">PHONE</th>
                  <th className="py-3 px-4">TERMS</th>
                  <th className="py-3 px-4">LIMIT</th>
                  <th className="py-3 px-4">BALANCE</th>
                  <th className="py-3 px-4">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04] text-[#3b4152] dark:text-[#d7d6e6] font-medium">
                {customers.map((c) => {
                  const isOver = c.currentBalance > c.creditLimit
                  return (
                    <tr key={c.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#181628] dark:text-white">{c.name}</div>
                        <div className="text-[10px] text-[#787f92] dark:text-[#8d8ea6]">{c.type}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#3b4152] dark:text-[#d7d6e6]">{c.phone}</td>
                      <td className="py-3 px-4 text-[#3b4152] dark:text-[#d7d6e6]">{c.paymentTerms}</td>
                      <td className="py-3 px-4 font-mono text-[#181628] dark:text-white font-bold">
                        ₹{c.creditLimit.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                        ₹{c.currentBalance.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isOver ? "bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-300/40" : "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40"
                          }`}
                        >
                          {isOver ? "Over Limit" : "Good Standing"}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Settle Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0d0c18]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#07050e] rounded-3xl p-6 space-y-4 shadow-2xl border border-white/60 dark:border-white/10 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
              <h3 className="text-sm font-bold text-[#181628] dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#181628] dark:text-sky-400" />
                Record Payment
              </h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-[#787f92] hover:text-[#181628] dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[#3b4152] font-bold block mb-1">Invoice Reference</label>
                <input
                  type="text"
                  value={paymentInvoiceNo}
                  onChange={(e) => setPaymentInvoiceNo(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] font-mono font-bold focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[#3b4152] font-bold block mb-1">Amount Received (₹)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] font-mono font-bold text-base focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[#3b4152] font-bold block mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["UPI", "CASH", "BANK"] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`h-10 rounded-xl font-bold transition-all cursor-pointer ${
                        paymentMethod === method ? "neo-dock-active shadow-sm" : "neo-pill-well text-[#555b6e]"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[#3b4152] font-bold block mb-1">UTR / Cash Receipt Reference</label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 font-bold text-[#787f92]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl neo-dock-active font-bold shadow-md cursor-pointer hover:opacity-95"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
