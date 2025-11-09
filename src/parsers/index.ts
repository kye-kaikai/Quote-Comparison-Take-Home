/**
 * Quote parsers for different carrier formats
 * 
 * This module should handle:
 * - CSV parsing (Carrier A and C)
 * - JSON parsing (Carrier B)
 * - Data normalization into common Quote schema
 */

import { FileHelper, ParserErrorMsgs, RecognizedCarriers, RecognizedCoverage } from '../services';
import { Coverage, Quote } from '../models/quote';

export interface ParseOptions {
  carrier: string;
  filePath?: string;
  rawData?: string;
}

/**
 * Main parser function that routes to carrier-specific parsers
 * 
 * @param options - Parse options including carrier type and data source
 * @returns Promise<Quote> - Normalized quote object
 */
export async function parseQuote(options: ParseOptions): Promise<Quote> {
  const { carrier, filePath, rawData } = options;

  // Validate carrier before parsing data
  if (!carrier || !RecognizedCarriers.carrierToFilePaths.has(carrier)) {
    throw new Error(ParserErrorMsgs.UNKNOWN_CARRIER);
  }

  let dataToParse: string = rawData ?? '';
  if (dataToParse) {
    try {
      const _ = JSON.parse(dataToParse);
    } catch (error) {
      dataToParse = await FileHelper.convertCSVRawData(dataToParse);
    }
  } else {
    dataToParse = await FileHelper.readDataFromFile(carrier, filePath)
  }

  // TODO: Implement parser routing logic
  // TODO: Add carrier-specific parsing functions
  // TODO: Handle CSV and JSON formats
  // TODO: Normalize field names and data types
  return await routeCarrierParsing(carrier, dataToParse);
}

// Helper functions you might need:
async function routeCarrierParsing(carrier: string, dataToParse: string): Promise<Quote> {
  let quote: Quote;
  switch (carrier) {
    case 'carrier-a':
      quote = await parseCarrierA(dataToParse);
      break;
    case 'carrier-b':
      quote = await parseCarrierB(dataToParse);
      break;
    default:
      quote = await parseCarrierC(dataToParse);
  }

  return quote;
}

// TODO: Implement parseCarrierA(data: string): Promise<Quote>
async function parseCarrierA(data: string): Promise<Quote> {
  const carrierData: any[] = JSON.parse(data);
  const coverages: Coverage[] = [];

  carrierData.forEach((row: any) => {
    coverages.push({
      type: normalizeCoverageType(row.Coverage_Type),
      limit: normalizeCurrency(parseCurrency(row.Limit_Amount)),
      premium: normalizeCurrency(parseCurrency(row.Premium_Cost)),
      deductible: normalizeCurrency(parseCurrency(row.Deductible))
    });
  });

  return {
    carrierId: 'carrier-a',
    carrierName: carrierData[0].Carrier_Name,
    quoteDate: parseDate(carrierData[0].Quote_Date),
    effectiveDate: parseDate(carrierData[0].Policy_Start),
    expirationDate: parseDate(carrierData[0].Policy_End),
    totalPremium: normalizeCurrency(coverages.reduce((acc, curr) => acc += curr.premium, 0)),
    coverages: coverages
  };
}

// TODO: Implement parseCarrierB(data: string): Promise<Quote>
async function parseCarrierB(data: string): Promise<Quote> {
  const carrierData: any = JSON.parse(data);

  return {
    carrierId: 'carrier-b',
    carrierName: carrierData.carrier.name,
    quoteDate: parseDate(carrierData.dates.quoted),
    effectiveDate: parseDate(carrierData.dates.effectiveDate),
    expirationDate: parseDate(carrierData.dates.expirationDate),
    totalPremium: normalizeCurrency(carrierData.totalPremium),
    coverages: carrierData.coverages.map((x: any) => ({
      type: normalizeCoverageType(x.coverage.type),
      limit: normalizeCurrency(x.limits.perOccurrence),
      premium: normalizeCurrency(x.pricing.premium),
      deductible: normalizeCurrency(x.pricing.deductible)
    }))
  };
}

// TODO: Implement parseCarrierC(data: string): Promise<Quote>
async function parseCarrierC(data: string): Promise<Quote> {
  const carrierData: any[] = JSON.parse(data);
  const coverages: Coverage[] = [];

  carrierData.forEach((row: any) => {
    coverages.push({
      type: normalizeCoverageType(row.CoverageDescription),
      limit: normalizeCurrency(Number(row.LimitValue)),
      premium: normalizeCurrency(Number(row.AnnualPremium)),
      deductible: normalizeCurrency(Number(row.DeductibleAmount))
    });
  });

  return {
    carrierId: 'carrier-c',
    carrierName: carrierData[0].InsuranceCompany,
    quoteDate: parseDate(carrierData[0].DateQuoted),
    effectiveDate: parseDate(carrierData[0].EffectiveDate),
    expirationDate: parseDate(carrierData[0].ExpirationDate),
    totalPremium: normalizeCurrency(coverages.reduce((acc, curr) => acc += curr.premium, 0)),
    coverages: coverages
  };
}

// - normalizeCoverageType(type: string): string
function normalizeCoverageType(type: string): string {
  return RecognizedCoverage[`${type}` as keyof typeof RecognizedCoverage] ?? type;
}

// - parseCurrency(value: string): number
function parseCurrency(value: string): number {
  const parsedVal: string = value.replace(/[^0-9\.]/g, '');
  return Number(parsedVal);
}

function normalizeCurrency(value: number): number {
  return Number(value.toFixed(2));
}

// - parseDate(value: string): Date
function parseDate(value: string): Date {
  const dateTimeParts: string[] = value.split('T');
  const date = new Date(dateTimeParts[0]);
  const formattedDate: Date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  return formattedDate;
}
