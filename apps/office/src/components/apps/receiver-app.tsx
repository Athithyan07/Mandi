"use client"

import React, { useState } from "react"
import {
  ShoppingBag,
  Plus,
  Minus,
  ShoppingCart,
  Clock,
  CheckCircle2,
  Truck,
  IndianRupee,
  ShieldCheck,
  Building,
  Sparkles,
  ArrowRight,
  LogOut,
} from "lucide-react"
import { useMandiStore, ProductItem } from "@/lib/mandi-store"
import { RealtimeRefreshButton } from "@/components/realtime-refresh-button"

export const ReceiverApp: React.FC = () => {
  const {
    receiverAuth,
    setReceiverAuth,
    products,
    customerPricing,
    stockLedger,
    orders,
    createNewOrder,
    setMode,
  } = useMandiStore()

  const customerId = receiverAuth?.customerId || "cust-1"
  const customerName = receiverAuth?.name || "Hotel Annapoorna"

  const [activeCategory, setActiveCategory] = useState<"All" | "Vegetables" | "Rice" | "Groceries">("All")
  const [cart, setCart] = useState<{ [productId: number]: number }>({
    1: 50, // Tomato 50kg
    2: 30, // Onion 30kg
    7: 2,  // Ponni Rice 2 bags
  })
  const [slot, setSlot] = useState("Morning 06:00 - 08:00 AM")
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null)

  // Get buyer-specific price for product
  const getCustomerPrice = (productId: number) => {
    const prod = products.find((p) => p.id === productId)
    const pricing = customerPricing.find((cp) => cp.productId === productId)
    if (!pricing || !prod) return prod?.sellingPrice || 35

    if (customerId === "cust-1") return pricing.hotelAnnapoorna
    if (customerId === "cust-2") return pricing.saravanaBhavan
    if (customerId === "cust-3") return pricing.greenLeafMess
    return prod.sellingPrice
  }

  const handleUpdateCart = (productId: number, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0
      const updated = Math.max(0, current + delta)
      if (updated === 0) {
        const copy = { ...prev }
        delete copy[productId]
        return copy
      }
      return { ...prev, [productId]: updated }
    })
  }

  // Calculate cart summary
  const cartItemIds = Object.keys(cart).map(Number)
  let cartTotal = 0
  let totalStandardTotal = 0
  const cartSummaryItems: { product: ProductItem; qty: number; unitPrice: number; lineTotal: number }[] = []

  cartItemIds.forEach((id) => {
    const product = products.find((p) => p.id === id)
    const qty = cart[id]
    if (product && qty > 0) {
      const unitPrice = getCustomerPrice(id)
      const lineTotal = unitPrice * qty
      cartTotal += lineTotal
      totalStandardTotal += product.sellingPrice * qty
      cartSummaryItems.push({ product, qty, unitPrice, lineTotal })
    }
  })

  const savings = Math.max(0, totalStandardTotal - cartTotal)

  const handlePlaceOrder = () => {
    if (cartSummaryItems.length === 0) return

    const itemsSummary = cartSummaryItems
      .map((it) => `${it.product.name} ${it.qty}${it.product.unit}`)
      .join(", ")

    createNewOrder({
      customer: customerName,
      customerId,
      customerType: "Verified Buyer • Tier 1",
      source: "Receiver App",
      totalAmount: cartTotal,
      slot,
      itemsSummary,
      items: cartSummaryItems.map((it) => ({
        productId: it.product.id,
        productName: it.product.name,
        sku: it.product.sku,
        unit: it.product.unit,
        qty: it.qty,
        unitPrice: it.unitPrice,
        lineTotal: it.lineTotal,
      })),
    })

    setOrderSuccess(`Order submitted successfully! Synced live to Mandi Office dispatch queue.`)
    setCart({})
    setTimeout(() => setOrderSuccess(null), 5000)
  }

  const myOrders = orders.filter((o) => o.customer === customerName)

  return (
    <div className="space-y-6">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP BUYER HEADER & CONTRACT BANNER                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="neo-card-white p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#191728] dark:bg-[#2e2b4a] flex items-center justify-center text-white shadow-md">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#181628] dark:text-white font-heading">{customerName}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e1f3fe] dark:bg-sky-950/60 text-[#1b5182] dark:text-sky-300 border border-[#bedff7] dark:border-sky-800">
                Contract Rate
              </span>
            </div>
            <p className="text-xs text-[#71788c] dark:text-slate-400 mt-0.5">
              7-Day Credit • Priority Dispatch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <RealtimeRefreshButton showLabel label="Sync" />
          <div className="px-3.5 py-1.5 rounded-xl neo-pill-well text-right">
            <div className="text-[10px] text-[#71788c] dark:text-slate-400 font-semibold uppercase tracking-wider">Credit</div>
            <div className="text-sm font-bold text-[#181628] dark:text-white font-mono">₹1,50,000</div>
          </div>
          <button
            onClick={() => setReceiverAuth(null)}
            title="Sign Out"
            className="p-2 rounded-xl text-[#71788c] hover:text-[#181628] dark:hover:text-white transition-colors cursor-pointer active:scale-95"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {orderSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{orderSuccess}</span>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. CATALOGUE ON LEFT, LIVE CART ON RIGHT                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Product Catalog */}
        <div className="lg:col-span-8 space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl neo-pill-well w-fit">
            {(["All", "Vegetables", "Rice", "Groceries"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                  activeCategory === cat
                    ? "neo-dock-active shadow-sm"
                    : "text-[#62687a] hover:text-[#181628]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Cards Grid */}
          <div key={activeCategory} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products
                .filter((p) => activeCategory === "All" || p.category === activeCategory)
                .map((product) => {
                  const customPrice = getCustomerPrice(product.id)
                  const currentQty = cart[product.id] || 0
                  const stock = stockLedger.find((s) => s.productId === product.id)
                  const isAvailable = (stock?.availableQty || 0) > 0

                  return (
                    <div
                      key={product.id}
                      className="neo-card-white p-4.5 space-y-3 flex flex-col justify-between widget-lift"
                    >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e5edfc] text-[#293a7d]">
                          {product.category}
                        </span>
                        <span
                          className={`text-[11px] font-bold ${
                            isAvailable ? "text-emerald-700" : "text-rose-600"
                          }`}
                        >
                          {isAvailable ? `${stock?.availableQty} ${product.unit} In Yard` : "Stock Out"}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#181628] mt-2.5 leading-snug">
                        {product.name}
                      </h4>
                      <div className="text-[10px] text-[#787f92] font-mono mt-0.5">{product.sku}</div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-base font-bold text-[#181628] font-heading">
                          ₹{customPrice}/{product.unit}
                        </div>
                        {customPrice < product.sellingPrice && (
                          <div className="text-[10px] text-[#868d9f] line-through">
                            ₹{product.sellingPrice} Base
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 p-1 rounded-xl neo-pill-well">
                        <button
                          onClick={() => handleUpdateCart(product.id, product.unit === "bag" ? -1 : -10)}
                          disabled={currentQty === 0}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#555b6e] hover:text-[#181628] hover:bg-white disabled:opacity-30 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-[#181628] px-1 font-mono min-w-5 text-center">
                          {currentQty}
                        </span>
                        <button
                          onClick={() => handleUpdateCart(product.id, product.unit === "bag" ? 1 : 10)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#181628] hover:bg-white transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Live Cart & Active Orders */}
        <div className="lg:col-span-4 space-y-4">
          {/* Cart Card */}
          <div className="neo-card-white p-5 space-y-4 widget-lift">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#181628] font-heading flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#181628]" />
                Live Purchase Order
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fae2f1] text-[#7a225a]">
                {cartSummaryItems.length} Commodities
              </span>
            </div>

            {cartSummaryItems.length === 0 ? (
              <div className="text-center py-8 text-[#868d9f] text-xs">
                Your cart is empty. Add fresh vegetables, rice bags, or groceries from the catalogue.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {cartSummaryItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3 rounded-xl bg-[#f6f9fd] text-xs flex justify-between items-center border border-slate-100"
                    >
                      <div>
                        <div className="font-bold text-[#181628]">{item.product.name}</div>
                        <div className="text-[10px] text-[#787f92]">
                          {item.qty} {item.product.unit} @ ₹{item.unitPrice}/{item.product.unit}
                        </div>
                      </div>
                      <div className="text-right font-bold text-[#181628]">
                        ₹{item.lineTotal.toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>

                {savings > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex justify-between items-center font-medium">
                    <span>Exclusive Tier Savings:</span>
                    <span className="font-bold">+ ₹{savings.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div>
                  <label className="text-[#3b4152] text-xs font-bold block mb-1">
                    Select Delivery Slot
                  </label>
                  <select
                    value={slot}
                    onChange={(e) => setSlot(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl neo-pill-well text-[#181628] text-xs font-semibold focus:outline-none"
                  >
                    <option>Morning 06:00 - 08:00 AM</option>
                    <option>Afternoon 12:00 - 02:00 PM</option>
                    <option>Evening 05:00 - 07:00 PM</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[#555b6e] text-xs font-semibold">Total Invoice Estimate:</span>
                  <span className="text-xl font-bold text-[#181628] font-heading">
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  className="w-full h-11 rounded-xl neo-dock-active flex items-center justify-center gap-2 text-xs font-bold shadow-md cursor-pointer hover:opacity-95 transition-opacity"
                >
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  Submit Order to APMC Yard
                </button>
              </div>
            )}
          </div>

          {/* Past Orders & Tracking */}
          <div className="neo-card-white p-5 space-y-3">
            <h4 className="text-xs font-bold text-[#181628] uppercase tracking-wider">
              My Orders & Live Dispatch Status ({myOrders.length})
            </h4>

            <div className="space-y-2.5 max-h-56 overflow-y-auto">
              {myOrders.map((ord) => (
                <div key={ord.id} className="p-3 rounded-xl bg-[#f6f9fd] border border-slate-100 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-[#181628]">{ord.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e1f3fe] text-[#1b5182]">
                      {ord.statusLabel}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#787f92]">{ord.itemsSummary}</div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/60 text-[11px]">
                    <span className="font-semibold text-[#181628]">Total: ₹{ord.totalAmount.toLocaleString("en-IN")}</span>
                    <span className="text-[#2c4084] font-medium">{ord.slot}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
