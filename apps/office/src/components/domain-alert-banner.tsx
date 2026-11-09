"use client"

import React from "react"
import { useMandiStore } from "@/lib/mandi-store"
import { AlertTriangle, AlertCircle, Info, X, ShieldAlert, ArrowRight } from "lucide-react"

export function DomainAlertBanner() {
  const { activeAlert, clearAlert } = useMandiStore()

  if (!activeAlert) return null

  const isError = activeAlert.severity === "error"
  const isWarning = activeAlert.severity === "warning"

  const bgStyle = isError
    ? "bg-rose-50 border-rose-300 dark:bg-rose-950/40 dark:border-rose-800 text-rose-950 dark:text-rose-100"
    : isWarning
    ? "bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800 text-amber-950 dark:text-amber-100"
    : "bg-blue-50 border-blue-300 dark:bg-blue-950/40 dark:border-blue-800 text-blue-950 dark:text-blue-100"

  const iconColor = isError
    ? "text-rose-600 dark:text-rose-400"
    : isWarning
    ? "text-amber-600 dark:text-amber-400"
    : "text-blue-600 dark:text-blue-400"

  const badgeStyle = isError
    ? "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300"
    : isWarning
    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
    : "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300"

  return (
    <div className="px-4 py-2 w-full animate-in fade-in slide-in-from-top-2 duration-200">
      <div className={`p-4 rounded-xl border shadow-sm relative flex flex-col sm:flex-row gap-3.5 ${bgStyle}`}>
        <div className="shrink-0 mt-0.5">
          {isError ? (
            <ShieldAlert className={`w-5 h-5 ${iconColor}`} />
          ) : isWarning ? (
            <AlertTriangle className={`w-5 h-5 ${iconColor}`} />
          ) : (
            <Info className={`w-5 h-5 ${iconColor}`} />
          )}
        </div>

        <div className="flex-1 text-sm space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeStyle}`}>
              {activeAlert.severity}
            </span>
            <span className="font-semibold text-sm">
              {activeAlert.title}
            </span>
            <span className="text-xs opacity-75 font-mono">
              [{activeAlert.ruleReference}]
            </span>
          </div>

          <p className="font-medium">
            {activeAlert.message}
          </p>

          <div className="pt-1 text-xs opacity-90 border-t border-current/15 mt-2 space-y-1">
            <p>
              <strong className="font-semibold">Business Logic: </strong>
              {activeAlert.logicExplanation}
            </p>
            {activeAlert.actionableStep && (
              <p className="flex items-center gap-1.5 font-medium">
                <ArrowRight className="w-3.5 h-3.5 inline shrink-0" />
                <span><strong>Action: </strong>{activeAlert.actionableStep}</span>
              </p>
            )}
          </div>
        </div>

        <button
          onClick={clearAlert}
          className="self-start sm:self-center p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-current opacity-70 hover:opacity-100 transition-opacity"
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

