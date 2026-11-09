"use client"

import React, { useState } from "react"
import {
  Package,
  Plus,
  Scale,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building,
  X,
  Check,
  Truck,
} from "lucide-react"
import { useMandiStore } from "@/lib/mandi-store"
import { RealtimeRefreshButton } from "@/components/realtime-refresh-button"

export const PurchaseTab: React.FC = () => {
  const {
    suppliers,
    purchaseOrders,
    goodsReceipts,
    products,
    createPurchaseOrder,
    recordGoodsReceipt,
  } = useMandiStore()

  const [activeSubTab, setActiveSubTab] = useState<"pos" | "receipts" | "suppliers">("pos")
  const [isPOModalOpen, setIsPOModalOpen] = useState(false)
  const [isGRModalOpen, setIsGRModalOpen] = useState(false)

  // PO Form
  const [poSupplierId, setPOSupplierId] = useState(1)
  const [poProductId, setPOProductId] = useState(1)
  const [poQty, setPOQty] = useState(500)
  const [poRate, setPORate] = useState(28)

  // GR Form
  const [grPONumber, setGRPONumber] = useState("PO-2026-00412")
  const [grSupplier, setGRSupplier] = useState("APMC Commission Agent 42")
  const [grProduct, setGRProduct] = useState("Tomato Hybrid")
  const [grOrderedQty, setGROrderedQty] = useState(500)
  const [grWeighbridgeWeight, setGRWeighbridgeWeight] = useState(490)
  const [grAcceptedQty, setGRAcceptedQty] = useState(480)
  const [grDamagedQty, setGRDamagedQty] = useState(10)
  const [grRejectedQty, setGRRejectedQty] = useState(0)
  const [grInvoiceNo, setGRInvoiceNo] = useState("INV-SUP-8910")
  const [grWarehouse, setGRWarehouse] = useState("Central Cold Storage Yard A")

  const handleCreatePOSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const sup = suppliers.find((s) => s.id === poSupplierId)
    const prod = products.find((p) => p.id === poProductId)
    const totalAmount = Number(poQty) * Number(poRate)

    createPurchaseOrder({
      supplier: sup?.name || "APMC Supplier",
      supplierId: poSupplierId,
      totalAmount,
      items: [
        {
          productId: poProductId,
          productName: prod?.name || "Commodity",
          orderedQty: Number(poQty),
          receivedQty: 0,
          unit: prod?.unit || "kg",
          purchaseRate: Number(poRate),
        },
      ],
    })
    setIsPOModalOpen(false)
  }

  const handleRecordGRSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const discrepancyNote =
      Number(grDamagedQty) > 0 || Number(grWeighbridgeWeight) < Number(grOrderedQty)
        ? `Weighbridge variation: ${Number(grOrderedQty) - Number(grWeighbridgeWeight)}kg lower than manifest. ${grDamagedQty}kg sorted cull.`
        : "Weight matches manifest."

    recordGoodsReceipt({
      poNumber: grPONumber,
      supplier: grSupplier,
      productName: grProduct,
      orderedQty: Number(grOrderedQty),
      receivedWeight: Number(grWeighbridgeWeight),
      acceptedQty: Number(grAcceptedQty),
      damagedQty: Number(grDamagedQty),
      rejectedQty: Number(grRejectedQty),
      supplierInvoiceNo: grInvoiceNo,
      warehouse: grWarehouse,
      discrepancyNote,
    })
    setIsGRModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP HEADER & SUB TABS                                      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="page-heading flex items-center gap-2.5 text-[#11101d] dark:text-white">
            <Package className="w-5 h-5 text-indigo-500 shrink-0" />
            Purchases & Inward
          </h3>
          <p className="page-subheading mt-0.5">
            Farm arrivals, weighbridge gross/tare verification & supplier payables
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RealtimeRefreshButton showLabel label="Sync" />
          <button
            onClick={() => setIsGRModalOpen(true)}
            className="h-9 px-3.5 rounded-xl text-xs font-bold neo-pill-well text-[#181628] dark:text-white flex items-center gap-1.5 hover:bg-white dark:hover:bg-white/10 transition-colors hover-glow-cyan cursor-pointer active:scale-95"
          >
            <Scale className="w-3.5 h-3.5 text-[#1b5182] dark:text-sky-400" />
            Verify Receipt
          </button>
          <button
            onClick={() => setIsPOModalOpen(true)}
            className="h-9 px-4 rounded-xl text-xs font-bold neo-dock-active flex items-center gap-1.5 shadow-md cursor-pointer hover:opacity-95 hover-glow-purple active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-300" />
            New Order
          </button>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar py-0.5">
        <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl neo-pill-well">
          <button
            onClick={() => setActiveSubTab("pos")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubTab === "pos"
                ? "neo-dock-active shadow-sm"
                : "text-[#62687a] dark:text-[#9ea0be] hover:text-[#181628] dark:hover:text-white"
            }`}
          >
            Orders ({purchaseOrders.length})
          </button>
          <button
            onClick={() => setActiveSubTab("receipts")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubTab === "receipts"
                ? "neo-dock-active shadow-sm"
                : "text-[#62687a] dark:text-[#9ea0be] hover:text-[#181628] dark:hover:text-white"
            }`}
          >
            Receipts ({goodsReceipts.length})
          </button>
          <button
            onClick={() => setActiveSubTab("suppliers")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubTab === "suppliers"
                ? "neo-dock-active shadow-sm"
                : "text-[#62687a] dark:text-[#9ea0be] hover:text-[#181628] dark:hover:text-white"
            }`}
          >
            Suppliers ({suppliers.length})
          </button>
        </div>
      </div>

      <div key={activeSubTab} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* ───────────────────────────────────────────────────────────── */}
        {/* 2. SUBTAB 1: PURCHASE ORDERS                                   */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeSubTab === "pos" && (
          <div className="neo-card-white overflow-hidden p-2 widget-lift">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[#787f92] font-bold">
                  <th className="py-3 px-4">PO NUMBER</th>
                  <th className="py-3 px-4">SUPPLIER</th>
                  <th className="py-3 px-4">ORDER DATE</th>
                  <th className="py-3 px-4">ITEMS SUMMARY</th>
                  <th className="py-3 px-4">TOTAL AMOUNT</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#3b4152] font-medium">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-[#181628]">{po.poNumber}</td>
                    <td className="py-3 px-4 font-bold text-[#181628]">{po.supplier}</td>
                    <td className="py-3 px-4 text-[#787f92]">{po.date}</td>
                    <td className="py-3 px-4">
                      {po.items.map((it, i) => (
                        <div key={i} className="text-[11px] text-[#3b4152]">
                          {it.productName}: {it.orderedQty} {it.unit} @ ₹{it.purchaseRate}
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#181628] text-sm font-mono">
                      ₹{po.totalAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setGRPONumber(po.poNumber)
                          setGRSupplier(po.supplier)
                          setIsGRModalOpen(true)
                        }}
                        className="px-3 py-1 rounded-xl text-xs font-bold neo-pill-well text-[#181628] hover:bg-white transition-colors"
                      >
                        Receive Lot
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. SUBTAB 2: GOODS RECEIPTS INSPECTION                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubTab === "receipts" && (
        <div className="neo-card-white overflow-hidden p-2">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#181628] font-heading flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Goods Receipt Inspection & Weighbridge Logs (Architecture Rule 5.3)
            </h3>
            <span className="text-xs text-[#7a225a] font-bold">
              Only accepted weight increases available stock
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[#787f92] font-bold">
                  <th className="py-3 px-4">GR # / PO #</th>
                  <th className="py-3 px-4">COMMODITY & SUPPLIER</th>
                  <th className="py-3 px-4">RECEIPT TIME</th>
                  <th className="py-3 px-4">ORDERED</th>
                  <th className="py-3 px-4">MEASURED WEIGHT</th>
                  <th className="py-3 px-4">ACCEPTED</th>
                  <th className="py-3 px-4">DAMAGED / REJECTED</th>
                  <th className="py-3 px-4">DISCREPANCY REMARKS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#3b4152] font-medium">
                {goodsReceipts.map((gr) => (
                  <tr key={gr.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-[#181628]">{gr.grNumber}</div>
                      <div className="text-[10px] text-[#787f92]">{gr.poNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#181628]">{gr.productName}</div>
                      <div className="text-[10px] text-[#787f92]">{gr.supplier}</div>
                    </td>
                    <td className="py-3 px-4 text-[#787f92]">{gr.receiptDate}</td>
                    <td className="py-3 px-4 font-bold text-[#181628]">{gr.orderedQty} units</td>
                    <td className="py-3 px-4 font-bold text-[#1b5182]">{gr.receivedWeight} units</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      +{gr.acceptedQty} (Stock In)
                    </td>
                    <td className="py-3 px-4">
                      {gr.damagedQty > 0 ? (
                        <span className="text-amber-700 font-bold">{gr.damagedQty} damaged</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#787f92] text-[11px] max-w-xs">
                      {gr.discrepancyNote}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. SUBTAB 3: SUPPLIERS LEDGER                                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubTab === "suppliers" && (
        <div className="neo-card-white overflow-hidden p-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[#787f92] font-bold">
                <th className="py-3 px-4">SUPPLIER ID / NAME</th>
                <th className="py-3 px-4">CATEGORY</th>
                <th className="py-3 px-4">CONTACT</th>
                <th className="py-3 px-4">PAYMENT TERMS</th>
                <th className="py-3 px-4">OUTSTANDING PAYABLE</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#3b4152] font-medium">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#181628]">{s.name}</div>
                    <div className="text-[10px] text-[#787f92]">Agent Code: APMC-0{s.id}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e5edfc] text-[#293a7d]">
                      {s.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#3b4152]">{s.phone}</td>
                  <td className="py-3 px-4 text-[#3b4152]">{s.paymentTerms}</td>
                  <td className="py-3 px-4 font-bold text-amber-700 text-sm font-mono">
                    ₹{s.outstandingBalance.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>

      {/* Create PO Modal */}
      {isPOModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0d0c18]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-2xl border border-white/60 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#181628] font-heading">
                Create Supplier Purchase Order
              </h3>
              <button onClick={() => setIsPOModalOpen(false)} className="text-[#787f92] hover:text-[#181628]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePOSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[#3b4152] font-bold block mb-1">Select Supplier</label>
                <select
                  value={poSupplierId}
                  onChange={(e) => setPOSupplierId(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] font-medium focus:outline-none"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#3b4152] font-bold block mb-1">Select Commodity</label>
                <select
                  value={poProductId}
                  onChange={(e) => {
                    const id = Number(e.target.value)
                    setPOProductId(id)
                    const p = products.find((pr) => pr.id === id)
                    if (p) setPORate(p.purchasePrice)
                  }}
                  className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] font-medium focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#3b4152] font-bold block mb-1">Quantity</label>
                  <input
                    type="number"
                    value={poQty}
                    onChange={(e) => setPOQty(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] font-bold focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[#3b4152] font-bold block mb-1">Rate per Unit (₹)</label>
                  <input
                    type="number"
                    value={poRate}
                    onChange={(e) => setPORate(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] font-bold focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-[#787f92]">Estimated PO Value:</span>
                <span className="text-base font-bold font-mono text-[#181628]">
                  ₹{(Number(poQty) * Number(poRate)).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPOModalOpen(false)}
                  className="px-4 py-2 font-bold text-[#787f92]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl neo-dock-active font-bold shadow-md cursor-pointer hover:opacity-95"
                >
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify GR Modal */}
      {isGRModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0d0c18]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 space-y-4 shadow-2xl border border-white/60 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#181628] font-heading flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#181628]" />
                Inspect & Record Inward Goods Receipt
              </h3>
              <button onClick={() => setIsGRModalOpen(false)} className="text-[#787f92] hover:text-[#181628]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordGRSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#3b4152] font-bold block mb-1">PO Reference</label>
                  <input
                    type="text"
                    value={grPONumber}
                    onChange={(e) => setGRPONumber(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] font-mono font-bold focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[#3b4152] font-bold block mb-1">Supplier Name</label>
                  <input
                    type="text"
                    value={grSupplier}
                    onChange={(e) => setGRSupplier(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[#3b4152] font-bold block mb-1">Ordered Qty</label>
                  <input
                    type="number"
                    value={grOrderedQty}
                    onChange={(e) => setGROrderedQty(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] font-bold focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[#3b4152] font-bold block mb-1">Weighbridge Weight</label>
                  <input
                    type="number"
                    value={grWeighbridgeWeight}
                    onChange={(e) => setGRWeighbridgeWeight(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#1b5182] font-bold focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[#3b4152] font-bold block mb-1">Accepted Qty</label>
                  <input
                    type="number"
                    value={grAcceptedQty}
                    onChange={(e) => setGRAcceptedQty(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl neo-pill-well text-emerald-700 font-bold focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#3b4152] font-bold block mb-1">Damaged / Rot Qty</label>
                  <input
                    type="number"
                    value={grDamagedQty}
                    onChange={(e) => setGRDamagedQty(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl neo-pill-well text-amber-700 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#3b4152] font-bold block mb-1">Invoice / DC Number</label>
                  <input
                    type="text"
                    value={grInvoiceNo}
                    onChange={(e) => setGRInvoiceNo(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGRModalOpen(false)}
                  className="px-4 py-2 font-bold text-[#787f92]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl neo-dock-active font-bold shadow-md cursor-pointer hover:opacity-95"
                >
                  Verify & Increase Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
