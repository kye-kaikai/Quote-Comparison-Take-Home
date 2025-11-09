/**
 * Quote parsers for different carrier formats
 * 
 * This module should handle:
 * - CSV parsing (Carrier A and C)
 * - JSON parsing (Carrier B)
 * - Data normalization into common Quote schema
 */

import * as fs from 'fs';
import csv from 'csv-parser';
import { parse } from 'csv-parse';
import { FileHelper, ParserErrorMsgs, RecognizedCarriers, RecognizedCoverage, RecognizedQuoteFiles } from '../services';
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
      dataToParse = convertCSVRawData(dataToParse);
    }
  } else {
    dataToParse = await readDataFromFile(carrier, filePath)
  }

  // TODO: Implement parser routing logic
  // TODO: Add carrier-specific parsing functions
  // TODO: Handle CSV and JSON formats
  // TODO: Normalize field names and data types
  return await routeCarrierParsing(carrier, dataToParse);
}

async function readDataFromFile(carrier: string, filePath: string | undefined): Promise<string> {
  const mappedFilePath: string = RecognizedCarriers.carrierToFilePaths.get(carrier)!;
  const trueFilePath: string = (filePath ?? mappedFilePath).toLowerCase();
  const fileExt: string = FileHelper.getFileExt(trueFilePath);

  if (!fileExt) {
    throw new Error(ParserErrorMsgs.MISSING_FILE_EXT);
  } else if (!RecognizedQuoteFiles.fileExts.has(fileExt)) {
    throw new Error(ParserErrorMsgs.INVALID_FILE_EXT);
  }

  if (!fs.existsSync(trueFilePath)) {
    throw new Error(ParserErrorMsgs.MISSING_QUOTE_FILE);
  }

  if (fileExt === RecognizedQuoteFiles.CSV) {
    return await csvReader(trueFilePath);
  } else {
    return jsonReader(trueFilePath);
  }
}

// Helper functions you might need:
async function csvReader(path: string): Promise<string> {
  let allData: any[] = [];

  return new Promise((res, _) => {
    fs.createReadStream(path)
      .pipe(csv())
      .on('data', (data: any) => {
        if (Object.keys(data).length > 0) {
          allData.push(data)
        }
      })
      .on('end', () => {
        res(JSON.stringify(allData));
      });
  });
}

function jsonReader(path: string): string {
  return JSON.stringify(require(path));
}

function convertCSVRawData(data: string): string {
  return JSON.stringify(parse(data, {
    columns: true,
    skip_empty_lines: true
  }));
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

// - parseDate(value: string): Date
function parseDate(value: string): Date {
  const dateTimeParts: string[] = value.split('T');
  return new Date(dateTimeParts[0]);
}

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
      limit: parseCurrency(row.Limit_Amount),
      premium: parseCurrency(row.Premium_Cost),
      deductible: parseCurrency(row.Deductible)
    });
  });

  return {
    carrierId: 'carrier-a',
    carrierName: carrierData[0].Carrier_Name,
    quoteDate: parseDate(carrierData[0].Quote_Date),
    effectiveDate: parseDate(carrierData[0].Policy_Start),
    expirationDate: parseDate(carrierData[0].Policy_End),
    totalPremium: coverages.reduce((acc, curr) => acc += curr.premium, 0),
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
    totalPremium: carrierData.totalPremium,
    coverages: carrierData.coverages.map((x: any) => ({
      type: normalizeCoverageType(x.coverage.type),
      limit: x.limits.aggregate,
      premium: x.pricing.premium,
      deductible: x.pricing.deductible
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
      limit: Number(row.LimitValue),
      premium: Number(row.AnnualPremium),
      deductible: Number(row.DeductibleAmount)
    });
  });

  return {
    carrierId: 'carrier-c',
    carrierName: carrierData[0].InsuranceCompany,
    quoteDate: parseDate(carrierData[0].DateQuoted),
    effectiveDate: parseDate(carrierData[0].EffectiveDate),
    expirationDate: parseDate(carrierData[0].ExpirationDate),
    totalPremium: coverages.reduce((acc, curr) => acc += curr.premium, 0),
    coverages: coverages
  };
}