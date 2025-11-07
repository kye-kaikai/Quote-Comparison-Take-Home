/**
 * Core data models for normalized insurance quotes
 */

export interface Quote {
  carrierId: string;
  carrierName: string;
  quoteDate: Date;
  effectiveDate: Date;
  expirationDate: Date;
  totalPremium: number;
  coverages: Coverage[];
}

export interface Coverage {
  type: string;           // Normalized coverage type (e.g., "General Liability")
  limit: number;          // Numeric limit value
  premium: number;        // Coverage-specific premium
  deductible?: number;    // Optional deductible
}

// TODO: Add validation schemas using Zod if needed
// TODO: Add helper functions for data transformation

