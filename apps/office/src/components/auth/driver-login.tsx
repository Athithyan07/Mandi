"use client"

import React, { useState } from "react"
import { Truck, KeyRound, ArrowRight, CheckCircle2 } from "lucide-react"
import { useMandiStore } from "@/lib/mandi-store"

export const DriverLogin: React.FC = () => {
  const { setDriverAuth, setMode } = useMandiStore()
  const [driverId, setDriverId] = useState<string | null>(null)
  const [pin, setPin] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const drivers = [
    {
      id: "driver-1",
      name: "Ramesh Kumar",
      phone: "+91 98450 67890",
      vehicle: "KA-01-AB-1234",
      vehicleType: "Tata Ace Mini Truck (1,500 kg)",
      activeTrips: 1,
    },
    {
      id: "driver-2",
      name: "Murugan S.",
      phone: "+91 98860 12345",
      vehicle: "KA-04-E-5678",
      vehicleType: "Bolero Maxi (1,700 kg)",
      activeTrips: 0,
    },
  ]

  const selectedDriver = drivers.find((d) => d.id === driverId)

  const handleSelectDriver = (id: string) => {
    setDriverId(id)
    setErrorMessage(null)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!driverId || !selectedDriver) {
      setErrorMessage("Please select your assigned fleet vehicle driver profile.")
      return
    }

    if (!pin.trim()) {
      setErrorMessage("Please enter your 4-digit Driver Security PIN.")
      return
    }

    if (pin !== "7721") {
      setErrorMessage("Invalid Driver PIN. Hint: Use 7721 for fleet delivery demo verification.")
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setDriverAuth({
        driverId: selectedDriver.id,
        name: selectedDriver.name,
        vehicle: selectedDriver.vehicle,
      })
      setIsLoading(false)
    }, 350)
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 min-h-[70vh] login-bg-animated relative">
      {/* Radiant Floating Background Orbs */}
      <div className="login-orb-glow login-orb-1" />
      <div className="login-orb-glow login-orb-2" />
      <div className="login-orb-glow login-orb-3" />

      {/* Dot Grid Pattern Overlay */}
      <div className="login-dot-grid" />

      <div className="w-full max-w-md login-card p-6 sm:p-8 space-y-5 relative z-10">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-[1.25rem] mx-auto flex items-center justify-center bg-gradient-to-br from-[#3a1030] to-[#1d0818] dark:from-[#502040] dark:to-[#2d1025] text-white shadow-lg relative group">
            <Truck className="w-8 h-8 text-pink-300 transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-pink-500 border-2 border-white dark:border-[#3a1030] flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-50 dark:bg-pink-950/60 border border-pink-200/60 dark:border-pink-800/40 text-[10px] font-semibold text-pink-700 dark:text-pink-300 tracking-wide uppercase mb-1">
              <Truck className="w-3 h-3" />
              Live Fleet Logistics
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#11101d] dark:text-[#f2f1fa] font-heading tracking-tight">
              Driver Cockpit
            </h2>
            <p className="page-subheading mt-1">
              Route manifest & delivery tracking
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold text-center animate-in fade-in">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="text-[#1c1a2e] dark:text-[#e4e2f5] font-semibold block mb-1.5 text-[11px] uppercase tracking-wider opacity-60">
              Fleet Driver
            </label>
            <div className="space-y-2">
              {drivers.map((d) => {
                const isSelected = driverId === d.id
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleSelectDriver(d.id)}
                    className={`w-full p-3.5 rounded-2xl text-left border transition-all flex items-center justify-between cursor-pointer active:scale-[0.98] ${
                      isSelected
                        ? "neo-card-mauve font-semibold border-pink-400 text-[#541a45] dark:text-[#f7d4ee]"
                        : "bg-slate-50 dark:bg-[#1f1d2e] border-black/5 dark:border-white/5 text-[#3b3852] dark:text-[#d3d0ea] hover:bg-slate-100 dark:hover:bg-[#28263a]"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs">{d.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 font-normal">
                        {d.vehicle} • {d.vehicleType}
                      </div>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-pink-600 dark:text-pink-300 flex-shrink-0" />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Select</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[#1c1a2e] dark:text-[#e4e2f5] font-semibold text-[11px] uppercase tracking-wider opacity-60">
                PIN <span className="normal-case tracking-normal opacity-70">(Demo: 7721)</span>
              </label>
              <button
                type="button"
                onClick={() => setPin("7721")}
                className="text-[10px] text-pink-600 dark:text-pink-400 font-semibold hover:underline"
              >
                Auto-fill
              </button>
            </div>
            <input
              type="password"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              className="w-full h-10 px-4 rounded-xl neo-pill-well text-[#11101d] dark:text-white placeholder-slate-400 text-xs tracking-widest text-center font-mono font-semibold focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-full neo-dock-active flex items-center justify-center gap-2 text-xs font-semibold shadow-md cursor-pointer hover:opacity-95 transition-all active:scale-[0.98]"
          >
            {isLoading ? <span>Connecting…</span> : (
              <>
                <span>Enter Cockpit</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-black/5 dark:border-white/10 flex justify-between text-[11px] text-[#524f68] dark:text-[#a09cbf]">
          <span className="opacity-60">Switch mode</span>
          <div className="space-x-2 font-semibold">
            <button
              onClick={() => setMode("office")}
              className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Office
            </button>
            <span className="opacity-30">•</span>
            <button
              onClick={() => setMode("receiver")}
              className="text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              Buyer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
