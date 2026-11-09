"use client"

import React, { useState } from "react"
import {
  Truck,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Phone,
  IndianRupee,
  Clock,
  Layers,
} from "lucide-react"
import { useMandiStore } from "@/lib/mandi-store"
import { RealtimeRefreshButton } from "@/components/realtime-refresh-button"

export const DeliveryTab: React.FC = () => {
  const { deliveryTrips, dispatchDeliveryTrip, orders } = useMandiStore()
  const [selectedTripId, setSelectedTripId] = useState(deliveryTrips[0]?.id || "trip-104")

  const selectedTrip = deliveryTrips.find((t) => t.id === selectedTripId) || deliveryTrips[0]

  const vehicles = [
    { no: "KA-01-AB-1234", type: "Tata Ace Mini Truck", capacityKg: 1500, driver: "Ramesh Kumar", status: "On Trip" },
    { no: "KA-04-E-5678", type: "Mahindra Bolero Maxi", capacityKg: 1700, driver: "Murugan S.", status: "Available" },
    { no: "KA-02-C-9012", type: "Piaggio Ape Electric", capacityKg: 600, driver: "Standby Driver", status: "Yard Ready" },
  ]

  return (
    <div className="space-y-6">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP HEADER                                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="page-heading flex items-center gap-2.5 text-[#11101d] dark:text-white">
            <Truck className="w-5 h-5 text-sky-500 shrink-0" />
            Fleet Dispatch
          </h3>
          <p className="page-subheading mt-0.5">
            Vehicle load capacity, optimized stop sequences & delivery manifests
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RealtimeRefreshButton showLabel label="Sync" />
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#e1f3fe] dark:bg-[#112438] text-[#1b5182] dark:text-[#7ec2f4] border border-[#bedff7] dark:border-sky-800/40 shadow-xs">
            {deliveryTrips.length} Active Trips
          </span>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. FLEET VEHICLES STATUS CARDS                                */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
        {vehicles.map((v, idx) => (
          <div key={idx} className="neo-card-white p-4.5 space-y-2 hover-glow-cyan widget-lift cursor-pointer active:scale-95">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-[#181628] dark:text-white">{v.no}</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  v.status === "On Trip"
                    ? "bg-[#e5edfc] dark:bg-indigo-950/50 text-[#293a7d] dark:text-indigo-300"
                    : "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300"
                }`}
              >
                {v.status}
              </span>
            </div>
            <div className="text-xs text-[#3b4152] dark:text-[#d7d6e6] font-semibold">{v.type}</div>
            <div className="flex justify-between items-center text-[11px] text-[#787f92] dark:text-[#9496b0] border-t border-black/[0.06] dark:border-white/[0.06] pt-2">
              <span>Driver: {v.driver}</span>
              <span className="font-bold text-[#181628] dark:text-white">Cap: {v.capacityKg} kg</span>
            </div>
          </div>
        ))}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. TRIPS SPLIT VIEW                                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Trips Table */}
        <div className="lg:col-span-7 neo-card-white overflow-hidden p-2">
          <div className="p-4 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#181628] dark:text-white font-heading">
              Scheduled Trips
            </h4>
            <span className="text-xs text-[#787f92] dark:text-[#9496b0]">Optimized stops</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/[0.06] dark:border-white/[0.06] text-[#787f92] dark:text-[#9496b0] font-bold">
                  <th className="py-3 px-4">TRIP NO</th>
                  <th className="py-3 px-4">DRIVER & VEHICLE</th>
                  <th className="py-3 px-4">PAYLOAD</th>
                  <th className="py-3 px-4">STOPS</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04] text-[#3b4152] dark:text-[#d7d6e6] font-medium">
                {deliveryTrips.map((trip) => {
                  const loadPct = Math.round((trip.totalLoadKg / trip.vehicleCapacityKg) * 100)
                  return (
                    <tr
                      key={trip.id}
                      onClick={() => setSelectedTripId(trip.id)}
                      className={`cursor-pointer transition-all duration-200 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] ${
                        selectedTripId === trip.id ? "bg-indigo-500/10 font-semibold" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#181628] dark:text-white">{trip.tripNo}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#181628] dark:text-white">{trip.driver}</div>
                        <div className="text-[10px] text-[#787f92] dark:text-[#9496b0] font-mono">{trip.vehicleNo}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#181628] dark:text-white">
                          {trip.totalLoadKg} kg / {trip.vehicleCapacityKg} kg
                        </div>
                        <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${
                              loadPct > 90 ? "bg-rose-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, loadPct)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#181628] dark:text-white">{trip.orders.length} Stops</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e1f3fe] dark:bg-[#112438] text-[#1b5182] dark:text-[#7ec2f4] border border-sky-200/50 dark:border-sky-800/40">
                          {trip.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {trip.status === "Scheduled" ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              dispatchDeliveryTrip(trip.id)
                            }}
                            className="px-3 py-1 rounded-xl text-xs font-bold neo-dock-active shadow-sm hover-glow-purple cursor-pointer"
                          >
                            Dispatch
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Active</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Trip Detail & Stop Sequence */}
        {selectedTrip && (
          <div className="lg:col-span-5 neo-card-white p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
              <div>
                <div className="text-[10px] text-[#787f92] dark:text-[#9496b0] font-bold uppercase">Trip Manifest</div>
                <h4 className="text-base font-bold text-[#181628] dark:text-white font-heading">{selectedTrip.tripNo}</h4>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300">
                {selectedTrip.driver}
              </span>
            </div>

            {/* Stops */}
            <div className="space-y-2.5 text-xs">
              <div className="text-[11px] font-bold text-[#787f92] dark:text-[#9496b0] uppercase">
                Stops & POD
              </div>

              {selectedTrip.orders.map((ord, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl neo-pill-well space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="w-5 h-5 rounded-md neo-dock-active text-white font-bold text-xs flex items-center justify-center">
                      {ord.sequence}
                    </span>
                    <span className="font-bold text-[#181628] dark:text-white">{ord.customer}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.status === "Delivered"
                          ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300"
                          : "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300"
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#787f92] dark:text-[#9496b0] flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#787f92] dark:text-[#9496b0] flex-shrink-0 mt-0.5" />
                    <span>{ord.address}</span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] border-t border-black/[0.06] dark:border-white/[0.06] pt-2">
                    <span className="text-[#787f92] dark:text-[#9496b0]">Invoice: ₹{ord.amount.toLocaleString("en-IN")}</span>
                    <span className="text-[#181628] dark:text-white font-bold">{ord.weightKg} kg Payload</span>
                  </div>

                  {ord.receiverName && (
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-300/30">
                      Delivered to: <strong>{ord.receiverName}</strong> • Signed
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Driver Collection Remittance Status */}
            <div className="p-3.5 rounded-2xl neo-pill-well space-y-1.5 text-xs">
              <div className="flex justify-between font-bold text-[#181628] dark:text-white">
                <span>En-Route Cash:</span>
                <span className="text-amber-600 dark:text-amber-400 font-mono">₹{selectedTrip.collectedCash}</span>
              </div>
              <div className="flex justify-between font-bold text-[#181628] dark:text-white">
                <span>En-Route UPI:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">₹{selectedTrip.collectedUpi}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
