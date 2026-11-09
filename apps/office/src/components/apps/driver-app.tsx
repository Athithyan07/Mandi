"use client"

import React, { useState } from "react"
import {
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  IndianRupee,
  FileCheck,
  PenTool,
  AlertTriangle,
  X,
  Check,
  ShieldCheck,
  Send,
  LogOut,
  Navigation,
  ExternalLink,
  Boxes,
  Radio,
} from "lucide-react"
import { useMandiStore } from "@/lib/mandi-store"
import { RealtimeRefreshButton } from "@/components/realtime-refresh-button"

export const DriverApp: React.FC = () => {
  const {
    driverAuth,
    setDriverAuth,
    deliveryTrips,
    orders,
    completeDriverDelivery,
  } = useMandiStore()

  const driverName = driverAuth?.name || "Ramesh Kumar"
  const vehicleNo = driverAuth?.vehicle || "KA-01-AB-1234"

  const activeTrip = deliveryTrips[0] // Primary active delivery trip

  // Dynamic Real-time Sync: Merge trip stops with any order dispatched by Office app
  const allDispatchedOrders = orders.filter(
    (o) => o.status === "dispatched" || o.status === "out_for_delivery"
  )
  const allDeliveredOrders = orders.filter((o) => o.status === "delivered")

  // Combine stops ensuring every dispatched order from Office is displayed
  const mergedStops = React.useMemo(() => {
    const list = [...(activeTrip?.orders || [])]
    
    // Add any order marked dispatched or delivered that isn't already in list
    orders.forEach((o) => {
      if (
        (o.status === "dispatched" || o.status === "out_for_delivery" || o.status === "delivered") &&
        !list.some((existing) => existing.orderId === o.id)
      ) {
        const estWeight = o.items && o.items.length > 0 ? o.items.reduce((sum, it) => sum + (it.qty || 25), 0) : 120
        list.push({
          orderId: o.id,
          customer: o.customer,
          address:
            o.customer === "Hotel Annapoorna"
              ? "Shop 14, 8th Main, Malleshwaram 4th Block, Bangalore"
              : o.customer === "Saravana Bhavan Grand"
              ? "12th Cross, Indiranagar 100ft Road, Bangalore"
              : "Commercial Road, Central Market Area, Bangalore",
          phone: "+91 98451 98765",
          amount: o.totalAmount,
          weightKg: estWeight,
          sequence: list.length + 1,
          status: o.status === "delivered" ? "Delivered" : "Pending",
        })
      }
    })

    return list
  }, [activeTrip?.orders, orders])

  // POD modal state
  const [selectedOrderForPOD, setSelectedOrderForPOD] = useState<any | null>(null)
  const [receiverName, setReceiverName] = useState("Chef Murthy")
  const [signatureText, setSignatureText] = useState("Murthy_Verified")
  const [shortageNote, setShortageNote] = useState("")
  const [collectedAmount, setCollectedAmount] = useState(18100)
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI">("CASH")
  const [podSuccess, setPodSuccess] = useState<string | null>(null)

  const handleOpenPOD = (order: any) => {
    setSelectedOrderForPOD(order)
    setCollectedAmount(order.amount)
    setReceiverName("Store Manager")
    setShortageNote("")
  }

  const handleConfirmPOD = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrderForPOD || !activeTrip) return

    completeDriverDelivery(
      activeTrip.id,
      selectedOrderForPOD.orderId,
      receiverName,
      signatureText,
      shortageNote,
      Number(collectedAmount),
      paymentMethod
    )

    setPodSuccess(`Delivery & POD confirmed for ${selectedOrderForPOD.customer}! Stock deducted & payment recorded.`)
    setSelectedOrderForPOD(null)
    setTimeout(() => setPodSuccess(null), 5000)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. DRIVER VEHICLE BANNER (Soft Canvas Theme)                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="neo-card-white p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#191728] dark:bg-[#1e1a33] flex items-center justify-center text-white shadow-md hover-glow-purple">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-bold text-[#181628] dark:text-white font-heading">{driverName}</div>
              <div className="text-xs text-[#71788c] dark:text-[#9ea0be] font-mono mt-0.5">
                {vehicleNo} • 1,500 kg
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RealtimeRefreshButton showLabel label="Sync" />
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40 flex items-center gap-1.5 shadow-xs">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              Live Dispatch
            </span>
            <button
              onClick={() => setDriverAuth(null)}
              title="Sign Out"
              className="p-2 rounded-xl text-[#71788c] dark:text-[#9ea0be] hover:text-[#181628] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {activeTrip && (
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] text-center text-xs">
            <div className="p-3 rounded-2xl neo-pill-well">
              <div className="text-[10px] text-[#787f92] dark:text-[#9496b0] font-semibold">Total Stops</div>
              <div className="text-sm font-bold text-[#181628] dark:text-white font-mono mt-1">
                {mergedStops.length} Stops
              </div>
            </div>
            <div className="p-3 rounded-2xl neo-pill-well">
              <div className="text-[10px] text-[#787f92] dark:text-[#9496b0] font-semibold">Payload</div>
              <div className="text-sm font-bold text-[#181628] dark:text-white font-mono mt-1">
                {mergedStops.reduce((sum, s) => sum + (s.weightKg || 120), 0)} kg
              </div>
            </div>
            <div className="p-3 rounded-2xl neo-pill-well">
              <div className="text-[10px] text-[#787f92] dark:text-[#9496b0] font-semibold">Collections</div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                ₹{(activeTrip.collectedCash + activeTrip.collectedUpi).toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        )}
      </div>

      {podSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{podSuccess}</span>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. ACTIVE TRIP DELIVERY SEQUENCE                               */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#181628] dark:text-white font-heading flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#181628] dark:text-sky-400" />
            Delivery Manifest
          </h3>
          <span className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/40">
            Trip #{activeTrip?.tripNo || "TRIP-2026-00104"}
          </span>
        </div>

        {mergedStops.map((ord, idx) => {
          const correspondingOrder = orders.find((o) => o.id === ord.orderId)
          const isDelivered = ord.status === "Delivered" || ord.status === "Shortage" || correspondingOrder?.status === "delivered"

          return (
            <div
              key={idx}
              className={`neo-card-white p-5 space-y-3.5 transition-all hover-glow-purple widget-lift ${
                isDelivered ? "opacity-85 border-emerald-300/40 bg-emerald-50/20 dark:bg-emerald-950/20" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center ${
                      isDelivered ? "bg-emerald-600 text-white" : "neo-dock-active"
                    }`}
                  >
                    {isDelivered ? <Check className="w-4 h-4" /> : ord.sequence || idx + 1}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#181628] dark:text-white leading-tight flex items-center gap-2">
                      {ord.customer}
                      {!isDelivered && (
                        <span className="text-[10px] bg-sky-100 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 font-bold px-2 py-0.5 rounded-full border border-sky-300/40">
                          Dispatched
                        </span>
                      )}
                    </h4>
                    <div className="text-[11px] text-[#787f92] font-mono">
                      Order Ref: {ord.orderId} • Weight: {ord.weightKg || 120} kg
                    </div>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                    isDelivered
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-[#fae2f1] text-[#7a225a] border border-[#f3cadf]"
                  }`}
                >
                  {isDelivered ? "Delivered" : "In Transit"}
                </span>
              </div>

              {/* Items in this shipment */}
              {correspondingOrder?.itemsSummary && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-[#3b4152]">
                  <Boxes className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span className="font-semibold">Manifest Items:</span>
                  <span className="truncate">{correspondingOrder.itemsSummary}</span>
                </div>
              )}

              <div className="text-xs text-[#555b6e] flex items-start gap-2 p-3 rounded-xl neo-pill-well">
                <MapPin className="w-4 h-4 text-[#787f92] flex-shrink-0 mt-0.5" />
                <span className="flex-1">{ord.address}</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ord.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
                >
                  <Navigation className="w-3.5 h-3.5" /> Start Nav
                </a>
              </div>

              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                <div>
                  <div className="text-[10px] text-[#787f92] font-semibold uppercase">Invoice Amount</div>
                  <div className="text-base font-bold text-[#181628] font-mono">
                    ₹{ord.amount.toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <a
                    href={`tel:${ord.phone}`}
                    className="h-9 px-3.5 rounded-xl text-xs font-bold neo-pill-well text-[#181628] flex items-center gap-1.5 hover:bg-white transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> Call Buyer
                  </a>

                  {!isDelivered ? (
                    <button
                      onClick={() => handleOpenPOD(ord)}
                      className="h-9 px-4 rounded-xl text-xs font-bold neo-dock-active flex items-center gap-1.5 shadow-sm cursor-pointer hover:opacity-95"
                    >
                      <PenTool className="w-3.5 h-3.5" /> Capture POD
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Settled
                    </span>
                  )}
                </div>
              </div>

              {ord.receiverName && (
                <div className="p-3 rounded-xl bg-[#f6f9fd] text-[11px] text-[#555b6e] flex justify-between border border-slate-100">
                  <span>Received by: <strong>{ord.receiverName}</strong></span>
                  <span className="text-emerald-700 font-bold">Collected: ₹{ord.collectedAmount}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. CAPTURE POD MODAL                                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {selectedOrderForPOD && (
        <div className="fixed inset-0 z-50 bg-[#0d0c18]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-2xl border border-white/60 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-[#181628]" />
                <h3 className="text-sm font-bold text-[#181628] font-heading">
                  Proof of Delivery (POD) • {selectedOrderForPOD.customer}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForPOD(null)}
                className="text-[#787f92] hover:text-[#181628]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPOD} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[#3b4152] font-bold block mb-1">
                  Receiver Staff Name (Chef / Store Incharge)
                </label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] font-medium focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[#3b4152] font-bold block mb-1">
                  Shortage / Return Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={shortageNote}
                  onChange={(e) => setShortageNote(e.target.value)}
                  placeholder="e.g. 5kg onion shortage accepted"
                  className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#3b4152] font-bold block mb-1">
                    Amount Collected (₹)
                  </label>
                  <input
                    type="number"
                    value={collectedAmount}
                    onChange={(e) => setCollectedAmount(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] font-mono font-bold focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#3b4152] font-bold block mb-1">
                    Payment Mode
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("CASH")}
                      className={`flex-1 h-10 rounded-xl font-bold cursor-pointer transition-all ${
                        paymentMethod === "CASH"
                          ? "neo-dock-active"
                          : "neo-pill-well text-[#555b6e]"
                      }`}
                    >
                      Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("UPI")}
                      className={`flex-1 h-10 rounded-xl font-bold cursor-pointer transition-all ${
                        paymentMethod === "UPI"
                          ? "neo-dock-active"
                          : "neo-pill-well text-[#555b6e]"
                      }`}
                    >
                      UPI
                    </button>
                  </div>
                </div>
              </div>

              {/* Digital E-Signature simulation */}
              <div>
                <label className="text-[#3b4152] font-bold block mb-1">
                  Digital Signature / Verification Code
                </label>
                <div className="h-16 rounded-xl neo-pill-well flex items-center justify-center font-mono font-bold text-base text-[#181628] border border-dashed border-slate-300">
                  {signatureText || "Receiver Verified"}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForPOD(null)}
                  className="px-4 py-2.5 rounded-xl font-bold text-[#787f92] hover:text-[#181628]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl neo-dock-active font-bold flex items-center gap-1.5 shadow-md cursor-pointer hover:opacity-95"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  Confirm POD & Complete Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
