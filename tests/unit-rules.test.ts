import { describe, it, expect } from "vitest"
import {
  convertToKilograms,
  resolveProductPrice,
  canReserveStock,
  calculateTax,
  checkCreditLimit,
  isValidStatusTransition,
  validateVehicleCapacity,
  generateDocumentNumber,
} from "./packages/utils/src/index.js"

describe("Instruction.md - Unit & Business Rule Engine Tests", () => {
  describe("Rule 4.2 & 6.2: Categories, Units & Weight Conversions", () => {
    it("converts 1 rice bag (standard 25kg) into base stock unit (kg)", () => {
      const kg = convertToKilograms(1, "bag", 25)
      expect(kg).toBe(25)
    })

    it("converts multiple rice bags into kg", () => {
      const kg = convertToKilograms(20, "bag", 25)
      expect(kg).toBe(500)
    })

    it("converts grams to kilograms accurately", () => {
      const kg = convertToKilograms(500, "gram")
      expect(kg).toBe(0.5)
    })

    it("preserves kg and piece units without modification", () => {
      expect(convertToKilograms(45, "kg")).toBe(45)
      expect(convertToKilograms(10, "piece")).toBe(10)
    })
  })

  describe("Rule 4.3: Customer-Specific Pricing Fallback", () => {
    it("returns customer-specific price when configured", () => {
      const price = resolveProductPrice(35, 32)
      expect(price).toBe(32)
    })

    it("falls back to default selling price when customer has no custom price", () => {
      const price = resolveProductPrice(35, undefined)
      expect(price).toBe(35)
    })

    it("falls back to default price if custom price is zero or invalid", () => {
      const price = resolveProductPrice(35, 0)
      expect(price).toBe(35)
    })
  })

  describe("Rule 6.1: Stock Reservation Check", () => {
    it("allows reservation when available stock is sufficient", () => {
      const result = canReserveStock(500, 100)
      expect(result.allowed).toBe(true)
      expect(result.shortage).toBe(0)
    })

    it("blocks reservation and flags shortage when requested quantity exceeds available stock", () => {
      const result = canReserveStock(40, 100)
      expect(result.allowed).toBe(false)
      expect(result.shortage).toBe(60)
    })
  })

  describe("Rule 9.2: Customer Credit Limit & Breach Alert", () => {
    it("allows order when customer balance is within credit limit", () => {
      const result = checkCreditLimit(42000, 150000, 34250)
      expect(result.isWithinLimit).toBe(true)
      expect(result.projectedBalance).toBe(76250)
      expect(result.exceededBy).toBe(0)
    })

    it("flags credit limit breach when order causes balance to exceed credit limit", () => {
      const result = checkCreditLimit(140000, 150000, 25000)
      expect(result.isWithinLimit).toBe(false)
      expect(result.projectedBalance).toBe(165000)
      expect(result.exceededBy).toBe(15000)
    })
  })

  describe("Rule 7.3: Status Transition Workflow", () => {
    it("allows valid forward transitions", () => {
      expect(isValidStatusTransition("RECEIVED", "PENDING_APPROVAL")).toBe(true)
      expect(isValidStatusTransition("PENDING_APPROVAL", "CONFIRMED")).toBe(true)
      expect(isValidStatusTransition("CONFIRMED", "STOCK_RESERVED")).toBe(true)
      expect(isValidStatusTransition("PACKED", "DISPATCHED")).toBe(true)
      expect(isValidStatusTransition("DISPATCHED", "OUT_FOR_DELIVERY")).toBe(true)
      expect(isValidStatusTransition("OUT_FOR_DELIVERY", "DELIVERED")).toBe(true)
      expect(isValidStatusTransition("DELIVERED", "COMPLETED")).toBe(true)
    })

    it("disallows illegal transition skips (e.g., jump from RECEIVED directly to DELIVERED)", () => {
      expect(isValidStatusTransition("RECEIVED", "DELIVERED")).toBe(false)
      expect(isValidStatusTransition("CONFIRMED", "COMPLETED")).toBe(false)
    })

    it("allows cancellation from pre-dispatch stages", () => {
      expect(isValidStatusTransition("PENDING_APPROVAL", "CANCELLED")).toBe(true)
      expect(isValidStatusTransition("CONFIRMED", "CANCELLED")).toBe(true)
      expect(isValidStatusTransition("STOCK_RESERVED", "CANCELLED")).toBe(true)
    })
  })

  describe("Rule 8.2: Vehicle Capacity & Overload Validation", () => {
    it("validates trip payload within vehicle capacity", () => {
      const check = validateVehicleCapacity(1500, 780)
      expect(check.isOverloaded).toBe(false)
      expect(check.excessKg).toBe(0)
      expect(check.loadPercentage).toBe(52)
    })

    it("flags overloading when trip weight exceeds vehicle capacity", () => {
      const check = validateVehicleCapacity(1500, 1750)
      expect(check.isOverloaded).toBe(true)
      expect(check.excessKg).toBe(250)
      expect(check.loadPercentage).toBe(117)
    })
  })

  describe("Rule 9.1 & 12.2: Statutory GST Calculations", () => {
    it("calculates intra-state 5% GST split evenly into 2.5% CGST and 2.5% SGST", () => {
      const tax = calculateTax(1000, 5, false)
      expect(tax.taxRate).toBe(5)
      expect(tax.taxAmount).toBe(50)
      expect(tax.cgst).toBe(25)
      expect(tax.sgst).toBe(25)
      expect(tax.igst).toBe(0)
      expect(tax.totalWithTax).toBe(1050)
    })

    it("calculates inter-state 5% GST as 100% IGST", () => {
      const tax = calculateTax(1000, 5, true)
      expect(tax.taxRate).toBe(5)
      expect(tax.taxAmount).toBe(50)
      expect(tax.cgst).toBe(0)
      expect(tax.sgst).toBe(0)
      expect(tax.igst).toBe(50)
      expect(tax.totalWithTax).toBe(1050)
    })
  })

  describe("Rule 25: Unique Document Number Formatting", () => {
    it("generates correct sequential document numbers", () => {
      const orderNo = generateDocumentNumber("ORD", 42, 2026)
      expect(orderNo).toBe("ORD-2026-00042")

      const invNo = generateDocumentNumber("INV", 381, 2026)
      expect(invNo).toBe("INV-2026-00381")
    })
  })
})

