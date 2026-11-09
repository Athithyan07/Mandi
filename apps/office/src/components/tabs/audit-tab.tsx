"use client"

import React, { useState } from "react"
import { ShieldCheck, Filter, Search, Clock, FileText, CheckCircle2, User } from "lucide-react"
import { useMandiStore } from "@/lib/mandi-store"
import { RealtimeRefreshButton } from "@/components/realtime-refresh-button"

export const AuditTab: React.FC = () => {
  const { auditLogs } = useMandiStore()
  const [filterAction, setFilterAction] = useState("all")
  const [search, setSearch] = useState("")

  const filteredLogs = auditLogs.filter((log) => {
    if (filterAction !== "all" && log.action !== filterAction) return false
    if (
      search &&
      !log.entityId.toLowerCase().includes(search.toLowerCase()) &&
      !log.notes?.toLowerCase().includes(search.toLowerCase()) &&
      !log.user.toLowerCase().includes(search.toLowerCase())
    ) {
      return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP HEADER & FILTER BAR                                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="page-heading flex items-center gap-2.5 text-[#11101d] dark:text-white">
            <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0" />
            Audit Trail
          </h3>
          <p className="page-subheading mt-0.5">
            Immutable activity history, user attribution & timestamped compliance logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RealtimeRefreshButton showLabel label="Sync" />

          {/* Filter by action */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl neo-pill-well">
            {[
              { id: "all", label: "All" },
              { id: "CREATE", label: "Creates" },
              { id: "APPROVE", label: "Approvals" },
              { id: "UPDATE", label: "Updates" },
              { id: "DISPATCH", label: "Dispatches" },
              { id: "PAYMENT", label: "Payments" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterAction(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                  filterAction === tab.id
                    ? "neo-dock-active shadow-sm"
                    : "text-[#62687a] dark:text-[#9ea0be] hover:text-[#181628] dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. SEARCH INPUT                                               */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="max-w-md relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#787f92]" />
        <input
          type="text"
          placeholder="Search by order ID, entity, user, or notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl neo-pill-well text-[#181628] text-xs font-medium focus:outline-none"
        />
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. AUDIT LOGS TABLE                                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div key={filterAction} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="neo-card-white overflow-hidden p-2 widget-lift">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[#787f92] font-bold">
                  <th className="py-3 px-4">TIMESTAMP</th>
                  <th className="py-3 px-4">USER / AGENT</th>
                  <th className="py-3 px-4">ACTION</th>
                  <th className="py-3 px-4">ENTITY</th>
                  <th className="py-3 px-4">ENTITY ID</th>
                  <th className="py-3 px-4">TRANSACTION AUDIT DETAILS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#3b4152] font-medium">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-[#787f92] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#181628] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#787f92]" />
                        {log.user}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          log.action === "APPROVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : log.action === "CREATE"
                            ? "bg-[#e5edfc] text-[#293a7d]"
                            : log.action === "DISPATCH"
                            ? "bg-[#e1f3fe] text-[#1b5182]"
                            : log.action === "PAYMENT"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-[#fae2f1] text-[#7a225a]"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#181628]">{log.entity}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#181628]">{log.entityId}</td>
                    <td className="py-3 px-4 text-[#555b6e] max-w-md">{log.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
