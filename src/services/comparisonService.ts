/**
 * Quote comparison and analysis service
 */

import { Quote } from '../models/quote';

export interface CoverageMatrix {
  [coverageType: string]: {
    [carrierId: string]: {
      limit: number;
      premium: number;
      deductible?: number;
    };
  };
}

export interface ComparisonInsights {
  lowestTotalPremium: {
    carrierId: string;
    amount: number;
  };
  coverageGaps: Array<{
    carrier: string;
    missingCoverage: string;
  }>;
  significantDifferences: Array<{
    coverageType: string;
    carriers: string[];
    variance: number; // Percentage difference
  }>;
}

export interface ComparisonResult {
  quotes: Quote[];
  coverageMatrix: CoverageMatrix;
  insights: ComparisonInsights;
}

/**
 * Compare multiple insurance quotes and generate insights
 * 
 * @param quotes - Array of normalized Quote objects
 * @returns ComparisonResult with side-by-side comparison and insights
 */
export function compareQuotes(quotes: Quote[]): ComparisonResult {
  // TODO: Build coverage matrix showing side-by-side comparison
  // TODO: Identify coverage gaps (coverages present in some quotes but not others)
  // TODO: Find lowest total premium
  // TODO: Calculate significant differences (>20% variance) for same coverage types
  // TODO: Return structured comparison result
  
  throw new Error('Not implemented');
}

// Helper functions you might need:
// - buildCoverageMatrix(quotes: Quote[]): CoverageMatrix
// - findCoverageGaps(quotes: Quote[]): ComparisonInsights['coverageGaps']
// - calculateVariance(premiums: number[]): number

