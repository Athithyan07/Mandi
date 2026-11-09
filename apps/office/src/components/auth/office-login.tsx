"use client"

import React, { useState } from "react"
import { Building2, ShieldCheck, Lock, ArrowRight, KeyRound, User } from "lucide-react"
import { useMandiStore } from "@/lib/mandi-store"

export const OfficeLogin: React.FC = () => {
  const { setOfficeAuth, setMode } = useMandiStore()
  const [role, setRole] = useState<"OWNER" | "ADMIN">("OWNER")
  const [pin, setPin] = useState("")
  const [email, setEmail] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    // Security validation - requires conscious user authentication
    if (!email.trim() || !pin.trim()) {
      setErrorMessage("Please enter both authorized email and security PIN.")
      return
    }

    if (pin !== "2026") {
      setErrorMessage("Invalid PIN code. Hint: Use 2026 for APMC demo verification.")
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setOfficeAuth({
        user: role === "OWNER" ? "Rajesh Kumar (Owner)" : "Operations Admin",
        role,
      })
      setIsLoading(false)
    }, 350)
  }

  const fillDemoCredentials = (selectedRole: "OWNER" | "ADMIN") => {
    setRole(selectedRole)
    setEmail(selectedRole === "OWNER" ? "rajesh@mandiconnect.com" : "admin@mandiconnect.com")
    setPin("2026")
    setErrorMessage(null)
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
        {/* Squircle Icon Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-[1.25rem] mx-auto flex items-center justify-center bg-gradient-to-br from-[#1e1b3a] to-[#0d0b1d] dark:from-[#3b3565] dark:to-[#1e1a35] text-white shadow-lg relative group">
            <Building2 className="w-8 h-8 text-indigo-300 transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1e1b3a] flex items-center justify-center">
              <ShieldCheck className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/40 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 tracking-wide uppercase mb-1">
              <ShieldCheck className="w-3 h-3" />
              APMC Wholesale Mandi
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#11101d] dark:text-[#f2f1fa] font-heading tracking-tight">
              Office Portal
            </h2>
            <p className="page-subheading mt-1">
              Wholesale yard operations & billing
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold text-center animate-in fade-in">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          {/* Role Pill Switcher */}
          <div>
            <label className="text-[#1c1a2e] dark:text-[#e4e2f5] font-semibold block mb-1.5 text-[11px] uppercase tracking-wider opacity-60">
              Authority
            </label>
            <div className="neo-pill-well p-1 grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setRole("OWNER")}
                className={`py-2 rounded-full font-semibold transition-all cursor-pointer ${
                  role === "OWNER"
                    ? "bg-[#181628] dark:bg-[#3b365e] text-white shadow-xs"
                    : "text-[#524f68] dark:text-[#a09cbf] hover:text-[#181628] dark:hover:text-white"
                }`}
              >
                Owner
              </button>
              <button
                type="button"
                onClick={() => setRole("ADMIN")}
                className={`py-2 rounded-full font-semibold transition-all cursor-pointer ${
                  role === "ADMIN"
                    ? "bg-[#181628] dark:bg-[#3b365e] text-white shadow-xs"
                    : "text-[#524f68] dark:text-[#a09cbf] hover:text-[#181628] dark:hover:text-white"
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[#1c1a2e] dark:text-[#e4e2f5] font-semibold text-[11px] uppercase tracking-wider opacity-60">
                Email
              </label>
              <button
                type="button"
                onClick={() => fillDemoCredentials(role)}
                className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Auto-fill
              </button>
            </div>
            <input
              type="email"
              placeholder="e.g. rajesh@mandiconnect.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-4 rounded-xl neo-pill-well text-[#11101d] dark:text-white placeholder-slate-400 text-xs font-medium focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-[#1c1a2e] dark:text-[#e4e2f5] font-semibold block mb-1 text-[11px] uppercase tracking-wider opacity-60">
              PIN <span className="normal-case tracking-normal opacity-70">(Demo: 2026)</span>
            </label>
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
            {isLoading ? <span>Verifying…</span> : (
              <>
                <span>Enter Office</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Switcher */}
        <div className="pt-3 border-t border-black/5 dark:border-white/10 flex justify-between text-[11px] text-[#524f68] dark:text-[#a09cbf]">
          <span className="opacity-60">Switch mode</span>
          <div className="space-x-2 font-semibold">
            <button
              onClick={() => setMode("receiver")}
              className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Buyer
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
