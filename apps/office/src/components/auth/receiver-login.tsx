"use client"

import React, { useState } from "react"
import { ShoppingBag, Building, Phone, KeyRound, ArrowRight, CheckCircle2 } from "lucide-react"
import { useMandiStore } from "@/lib/mandi-store"

export const ReceiverLogin: React.FC = () => {
  const { customers, setReceiverAuth, setMode } = useMandiStore()
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [mobileNumber, setMobileNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)

  const handleSelectBuyer = (c: any) => {
    setSelectedCustomerId(c.id)
    setMobileNumber(c.phone)
    setErrorMessage(null)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!selectedCustomerId || !selectedCustomer) {
      setErrorMessage("Please select your verified wholesale buyer account.")
      return
    }

    if (!otp.trim()) {
      setErrorMessage("Please enter the 4-digit verification OTP.")
      return
    }

    if (otp !== "4821") {
      setErrorMessage("Invalid OTP. Hint: Use 4821 for wholesale demo verification.")
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setReceiverAuth({
        customerId: selectedCustomer.id,
        name: selectedCustomer.name,
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
          <div className="w-16 h-16 rounded-[1.25rem] mx-auto flex items-center justify-center bg-gradient-to-br from-[#0c2240] to-[#071428] dark:from-[#1a3055] dark:to-[#0d1e38] text-white shadow-lg relative group">
            <ShoppingBag className="w-8 h-8 text-sky-300 transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-sky-500 border-2 border-white dark:border-[#0c2240] flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200/60 dark:border-sky-800/40 text-[10px] font-semibold text-sky-700 dark:text-sky-300 tracking-wide uppercase mb-1">
              <ShoppingBag className="w-3 h-3" />
              Verified Wholesale Buyer
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#11101d] dark:text-[#f2f1fa] font-heading tracking-tight">
              Buyer Portal
            </h2>
            <p className="page-subheading mt-1">
              Wholesale ordering & contract pricing
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
              Buyer Account
            </label>
            <div className="space-y-2">
              {customers.map((c) => {
                const isSelected = selectedCustomerId === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectBuyer(c)}
                    className={`w-full p-3 rounded-2xl text-left border transition-all flex items-center justify-between cursor-pointer active:scale-[0.98] ${
                      isSelected
                        ? "neo-card-sky font-semibold border-sky-400 text-[#143956] dark:text-[#cde7fc]"
                        : "bg-slate-50 dark:bg-[#1f1d2e] border-black/5 dark:border-white/5 text-[#3b3852] dark:text-[#d3d0ea] hover:bg-slate-100 dark:hover:bg-[#28263a]"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs">{c.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                        Credit: ₹{c.creditLimit.toLocaleString("en-IN")} • {c.paymentTerms}
                      </div>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-300 flex-shrink-0" />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Select</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-[#1c1a2e] dark:text-[#e4e2f5] font-semibold block mb-1 text-[11px] uppercase tracking-wider opacity-60">
              Mobile
            </label>
            <input
              type="text"
              placeholder="+91 Mobile number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full h-10 px-4 rounded-xl neo-pill-well text-[#11101d] dark:text-white placeholder-slate-400 text-xs font-medium focus:outline-none"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[#1c1a2e] dark:text-[#e4e2f5] font-semibold text-[11px] uppercase tracking-wider opacity-60">
                OTP <span className="normal-case tracking-normal opacity-70">(Demo: 4821)</span>
              </label>
              <button
                type="button"
                onClick={() => setOtp("4821")}
                className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold hover:underline"
              >
                Auto-fill
              </button>
            </div>
            <input
              type="password"
              placeholder="••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
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
            {isLoading ? <span>Validating…</span> : (
              <>
                <span>Access Catalogue</span>
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
              onClick={() => setMode("driver")}
              className="text-pink-600 dark:text-pink-400 hover:underline cursor-pointer"
            >
              Driver
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
