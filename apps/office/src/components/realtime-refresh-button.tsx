"use client"

import React from "react"
import { RotateCw } from "lucide-react"
import { useMandiStore } from "@/lib/mandi-store"

interface RealtimeRefreshButtonProps {
  className?: string
  showLabel?: boolean
  label?: string
}

export const RealtimeRefreshButton: React.FC<RealtimeRefreshButtonProps> = ({
  className = "",
  showLabel = false,
  label = "Sync",
}) => {
  const { refreshRealtimeData, isRefreshing } = useMandiStore()

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        refreshRealtimeData()
      }}
      disabled={isRefreshing}
      title="Refresh Realtime Data"
      className={`inline-flex items-center justify-center gap-1.5 rounded-full transition-all duration-200 cursor-pointer active:scale-90 hover:brightness-110 ${
        showLabel
          ? "px-3 py-1.5 text-xs font-semibold neo-pill-well text-[#181628] dark:text-white"
          : "w-8 h-8 rounded-full bg-white dark:bg-[#12111d] border border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-300 shadow-xs hover:border-indigo-400/50"
      } ${className}`}
    >
      <RotateCw
        className={`w-3.5 h-3.5 transition-transform duration-500 ${
          isRefreshing ? "animate-spin text-indigo-500 dark:text-indigo-400" : ""
        }`}
      />
      {showLabel && (
        <span className="text-[11px] font-mono tracking-tight font-medium">
          {isRefreshing ? "Syncing..." : label}
        </span>
      )}
    </button>
  )
}
