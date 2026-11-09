"use client"

import React from "react"

interface LiquidGlassWidgetProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export const LiquidGlassWidget: React.FC<LiquidGlassWidgetProps> = ({
  children,
  className = "",
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative glass-widget transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  )
}
