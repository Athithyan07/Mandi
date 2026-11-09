"use client"

import React, { useState, useEffect } from "react"
import { MandiStoreProvider, useMandiStore } from "@/lib/mandi-store"
import { BrandLoadingSplash } from "@/components/brand-loading-splash"
import { PortalHeader } from "@/components/portal-header"
import { DomainAlertBanner } from "@/components/domain-alert-banner"
import { OfficeLogin } from "@/components/auth/office-login"
import { ReceiverLogin } from "@/components/auth/receiver-login"
import { DriverLogin } from "@/components/auth/driver-login"
import { OfficeApp } from "@/components/apps/office-app"
import { ReceiverApp } from "@/components/apps/receiver-app"
import { DriverApp } from "@/components/apps/driver-app"

function MandiPortalCanvas() {
  const { mode, colorMode, officeAuth, receiverAuth, driverAuth } = useMandiStore()

  // Only startup loading animation should be there
  const [showStartupSplash, setShowStartupSplash] = useState(false)

  useEffect(() => {
    try {
      const hasSession = sessionStorage.getItem("mandi_session_started")
      if (!hasSession) {
        setShowStartupSplash(true)
      }
    } catch {
      setShowStartupSplash(true)
    }
  }, [])

  const handleSplashComplete = () => {
    try {
      sessionStorage.setItem("mandi_session_started", "true")
    } catch {
      // ignore in restricted browser environments
    }
    setShowStartupSplash(false)
  }

  return (
    <>
      {/* 1. Startup Brand Loading Screen (Shown ONLY on initial fresh launch) */}
      {showStartupSplash && (
        <BrandLoadingSplash onComplete={handleSplashComplete} />
      )}

      {/* 2. Main Outer Canvas Frame */}
      <div className={`canvas-frame ${colorMode === "dark" ? "dark" : ""}`} data-color-mode={colorMode}>
        <div className="canvas-board flex flex-col">
          {/* Top Header & App Switcher */}
          <PortalHeader />

          {/* Contextual Logic Warning & Error Banner */}
          <DomainAlertBanner />

          {/* Dynamic App & Login View Router with Page Click Transitions */}
          <div key={mode} className="flex-1 flex flex-col min-h-0 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            {mode === "office" && (
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {!officeAuth ? <OfficeLogin /> : <OfficeApp />}
              </div>
            )}

            {mode === "receiver" && (
              <div className="flex-1 p-3.5 sm:p-5 md:p-8 overflow-y-auto min-w-0 overscroll-contain smooth-scroll">
                {!receiverAuth ? <ReceiverLogin /> : <ReceiverApp />}
              </div>
            )}

            {mode === "driver" && (
              <div className="flex-1 p-3.5 sm:p-5 md:p-8 overflow-y-auto min-w-0 overscroll-contain smooth-scroll">
                {!driverAuth ? <DriverLogin /> : <DriverApp />}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default function MandiConnectPortal() {
  return (
    <MandiStoreProvider>
      <MandiPortalCanvas />
    </MandiStoreProvider>
  )
}
