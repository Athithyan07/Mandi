"use client"

import React, { useState } from "react"
import {
  Search,
  SlidersHorizontal,
  Bell,
  LogOut,
  Building2,
  ShoppingBag,
  Truck,
  ChevronDown,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react"
import { useMandiStore, AppMode } from "@/lib/mandi-store"
import { RealtimeRefreshButton } from "@/components/realtime-refresh-button"

export const PortalHeader: React.FC = () => {
  const {
    mode,
    setMode,
    colorMode,
    toggleColorMode,
    officeAuth,
    setOfficeAuth,
    receiverAuth,
    setReceiverAuth,
    driverAuth,
    setDriverAuth,
    orders,
  } = useMandiStore()

  const pendingCount = orders.filter((o) => o.status === "pending").length

  const handleLogout = () => {
    if (mode === "office") setOfficeAuth(null)
    if (mode === "receiver") setReceiverAuth(null)
    if (mode === "driver") setDriverAuth(null)
  }

  const currentUser =
    mode === "office"
      ? officeAuth?.user || "Sign In Required"
      : mode === "receiver"
      ? receiverAuth?.name || "Sign In Required"
      : driverAuth?.name || "Sign In Required"

  const greetingSubtitle =
    mode === "office"
      ? `${orders.length} orders today`
      : mode === "receiver"
      ? "Contract rates active"
      : "Vehicle KA-01-AB-1234"

  return (
    <header className="px-4 sm:px-6 md:px-8 pt-4 sm:pt-5 md:pt-6 pb-3 sm:pb-4 flex flex-wrap items-center justify-between gap-3 sm:gap-4 border-b border-black/[0.06] dark:border-white/[0.06]">
      {/* 1. Left: Dynamic Greeting */}
      <div className="min-w-0">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#11101d] dark:text-[#f2f1fa] font-heading tracking-tight flex items-center gap-2 flex-wrap">
          <span className="truncate">Hi, {currentUser}</span>
          <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-[#e5ecfa] dark:bg-[#1c192e] text-[#20294d] dark:text-[#b4c3ee] font-semibold border border-white/50 dark:border-white/10 shadow-xs shrink-0">
            {mode === "office" ? "Office" : mode === "receiver" ? "Buyer" : "Driver"}
          </span>
        </h1>
        <p className="text-[10px] sm:text-xs text-[#524f68] dark:text-[#9ea0be] mt-0.5 font-normal opacity-60">{greetingSubtitle}</p>
      </div>

      {/* 2. Center: Minimal 3-App Switcher with Hover Glow */}
      <div className="neo-pill-well p-1 flex items-center gap-1 order-3 sm:order-2 w-full sm:w-auto">
        <button
          onClick={() => setMode("office")}
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === "office"
              ? "bg-[#181628] dark:bg-[#2e294e] text-white shadow-md font-semibold hover-glow-purple"
              : "text-[#4b4862] dark:text-[#a09cbf] hover:text-[#181628] dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Office</span>
          {pendingCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-400 text-black text-[10px] font-bold flex items-center justify-center animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setMode("receiver")}
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === "receiver"
              ? "bg-[#181628] dark:bg-[#2e294e] text-white shadow-md font-semibold hover-glow-purple"
              : "text-[#4b4862] dark:text-[#a09cbf] hover:text-[#181628] dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Receiver</span>
        </button>

        <button
          onClick={() => setMode("driver")}
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === "driver"
              ? "bg-[#181628] dark:bg-[#2e294e] text-white shadow-md font-semibold hover-glow-purple"
              : "text-[#4b4862] dark:text-[#a09cbf] hover:text-[#181628] dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5"
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Driver</span>
        </button>
      </div>

      {/* 3. Right: Search & Quick Controls with Hover Glow */}
      <div className="flex items-center gap-2 sm:gap-2.5 order-2 sm:order-3">
        <div className="relative w-36 sm:w-48 hidden md:block">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search…"
            className="w-full h-9 pl-9 pr-4 rounded-full neo-pill-well text-xs text-[#11101d] dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Realtime Data Refresh Icon */}
        <RealtimeRefreshButton />

        {/* Theme Toggle Button with Hover Halo */}
        <button
          onClick={toggleColorMode}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-[#0a0814] border border-black/10 dark:border-white/10 shadow-xs flex items-center justify-center text-[#302d44] dark:text-[#dedcf2] hover:scale-105 hover-glow-purple transition-all cursor-pointer"
          title={`Switch to ${colorMode === "light" ? "Dark" : "Light"} Mode`}
        >
          {colorMode === "light" ? <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />}
        </button>

        {/* Bell Button */}
        <div className="relative">
          <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-[#0a0814] border border-black/10 dark:border-white/10 shadow-xs flex items-center justify-center text-[#302d44] dark:text-[#dedcf2] hover:scale-105 hover-glow-purple transition-all">
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          {pendingCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pink-500 animate-ping"></span>
          )}
        </div>

        {/* User Avatar with Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-black/10 dark:border-white/10">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#181628] dark:bg-[#39345c] text-white font-semibold text-[10px] sm:text-xs flex items-center justify-center shadow-md">
            {currentUser.slice(0, 2).toUpperCase()}
          </div>
          {(officeAuth || receiverAuth || driverAuth) && (
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-red-500 flex items-center justify-center transition-all cursor-pointer"
            >
              <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
