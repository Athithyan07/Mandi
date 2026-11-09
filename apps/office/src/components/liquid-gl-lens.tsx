"use client"

import React from "react"

interface LiquidGLLensProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function LiquidGLLens({
  children,
  className = "",
  onClick,
}: LiquidGLLensProps) {
  return (
    <div
      onClick={onClick}
      className={`relative transition-all duration-200 hover:-translate-y-0.5 ${className}`}
    >
      {children}
    </div>
  )
}
