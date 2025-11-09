/**
 * Quote comparison and analysis service
 */

import { VARIANCE_THRESHOLD } from '../constants';
import { Coverage, Quote } from '../models/quote';

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
  const matrix = buildCoverageMatrix(quotes);

  // TODO: Identify coverage gaps (coverages present in some quotes but not others)
  const covGaps = findCoverageGaps([...quotes]);

  // TODO: Find lowest total premium
  const lowestTotalPremium = getLowestTotalPremium([...quotes]);

  // TODO: Calculate significant differences (>20% variance) for same coverage types
  const variances = identifyVariances([...quotes]);

  // TODO: Return structured comparison result
  return {
    quotes: quotes,
    coverageMatrix: matrix,
    insights: {
      lowestTotalPremium: lowestTotalPremium,
      coverageGaps: covGaps,
      significantDifferences: variances
    }
  }
}

// Helper functions you might need:
// - buildCoverageMatrix(quotes: Quote[]): CoverageMatrix
function buildCoverageMatrix(quotes: Quote[]): CoverageMatrix {
  const matrix: CoverageMatrix = {};

  quotes.forEach(quote => {
    quote.coverages.forEach(cov => {
      if (Object.hasOwnProperty(cov.type)) {
        matrix[`${cov.type}`][quote.carrierId] = {
          limit: cov.limit,
          premium: cov.premium,
          deductible: cov.deductible
        }
      } else {
        matrix[`${cov.type}`] = {
          [quote.carrierId]: {
            limit: cov.limit,
            premium: cov.premium,
            deductible: cov.deductible
          }
        }
      }
    });
  });

  return matrix;
}

// - findCoverageGaps(quotes: Quote[]): ComparisonInsights['coverageGaps']
function findCoverageGaps(quotes: Quote[]): ComparisonInsights['coverageGaps'] {
  const quoteWithMostCoverages = quotes.sort((a, b) => -1 * (a.coverages.length - b.coverages.length))[0];
  const allCoverages: Set<string> = new Set(quoteWithMostCoverages.coverages.map(x => x.type));
  let coverageGaps: ComparisonInsights['coverageGaps'] = [];

  for (let i = 1; i < quotes.length; i++) {
    const currQuoteCoverages: Set<string> = new Set(quotes[i].coverages.map(x => x.type));
    const missingCoverages = [...allCoverages.difference(currQuoteCoverages).keys()];
    coverageGaps = coverageGaps.concat(missingCoverages.map(x => ({
      carrier: quotes[i].carrierId,
      missingCoverage: x
    })));
  }

  return coverageGaps;
}

function getLowestTotalPremium(quotes: Quote[]): ComparisonInsights['lowestTotalPremium'] {
  const lowestTotalPremiumQuote = quotes.sort((a, b) => a.totalPremium - b.totalPremium)[0];
  return {
    carrierId: lowestTotalPremiumQuote.carrierId,
    amount: lowestTotalPremiumQuote.totalPremium
  };
}

function identifyVariances(quotes: Quote[]): ComparisonInsights['significantDifferences'] {
  const quoteWithLeastCoverages = quotes.sort((a, b) => a.coverages.length - b.coverages.length)[0];
  const minCoverages = convertCoverageTypeToPremMap(quoteWithLeastCoverages.coverages);
  const variances: ComparisonInsights['significantDifferences'] = [];

  for (let i = 1; i < quotes.length; i++) {
    const currQuoteCoverages = convertCoverageTypeToPremMap(quotes[i].coverages);
    for (let [key, value] of minCoverages.entries()) {
      if (currQuoteCoverages.has(key)) {
        const variance = calculateVariance([value, currQuoteCoverages.get(key)!]);
        if (variance > VARIANCE_THRESHOLD) {
          variances.push({
            coverageType: key,
            carriers: [quoteWithLeastCoverages.carrierId, quotes[i].carrierId],
            variance: variance
          })
        }
      }
    }
  }

  return variances;
}

// - calculateVariance(premiums: number[]): number
function calculateVariance(premiums: number[]): number {
  const prem1 = premiums[0];
  const prem2 = premiums[1];

  let variance = prem1 > prem2 ? prem1 / prem2 - 1 : prem2 / prem1 - 1;
  return variance;
}

function convertCoverageTypeToPremMap(coverages: Coverage[]): Map<string, number> {
  return coverages.reduce((acc, curr) => {
    acc.set(curr.type, { premium: curr.premium });
    return acc;
  }, new Map());
}
