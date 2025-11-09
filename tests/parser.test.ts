import { parseQuote } from '../src/parsers/index';
import { test, expect } from '@jest/globals';

const expectedParsedCarrierA = {
    carrierId: 'carrier-a',
    carrierName: 'Acme Insurance Co',
    quoteDate: new Date("2024-01-15"),
    effectiveDate: new Date("2024-03-01"),
    expirationDate: new Date("2025-03-01"),
    totalPremium: 6625.5,
    coverages: [
        {
            type: 'General Liability',
            limit: 1000000,
            premium: 1250,
            deductible: 1000
        },
        {
            type: 'Professional Liability',
            limit: 2000000,
            premium: 2100.5,
            deductible: 2500
        },
        {
            type: 'Property Insurance',
            limit: 500000,
            premium: 875,
            deductible: 500
        },
        {
            type: 'Workers Compensation',
            limit: 1000000,
            premium: 1450,
            deductible: 0
        },
        {
            type: 'Cyber Liability',
            limit: 1000000,
            premium: 950,
            deductible: 5000
        }
    ]
};

test('rawData overrides file path', async () => {
    const rawData: string = 'Quote_ID,Carrier_Name,Quote_Date,Policy_Start,Policy_End,Coverage_Type,Limit_Amount,Premium_Cost,Deductible\r\n' +
        'QA-2024-001,Acme Insurance Co,2024-01-15,03/01/2024,03/01/2025,General Liability,"$1,000,000","$1,250.00","$1,000"\r\n' +
        'QA-2024-001,Acme Insurance Co,2024-01-15,03/01/2024,03/01/2025,Professional Liability,"$2,000,000","$2,100.50","$2,500"\r\n' +
        'QA-2024-001,Acme Insurance Co,2024-01-15,03/01/2024,03/01/2025,Property Insurance,"$500,000","$875.00","$500"\r\n' +
        'QA-2024-001,Acme Insurance Co,2024-01-15,03/01/2024,03/01/2025,Workers Compensation,"$1,000,000","$1,450.00",""\r\n' +
        'QA-2024-001,Acme Insurance Co,2024-01-15,03/01/2024,03/01/2025,Cyber Liability,"$1,000,000","$950.00","$5,000"';
    expect(await parseQuote({ carrier: 'carrier-a', filePath: "./data/carrier-a-quote.csv", rawData: rawData })).toBe(expectedParsedCarrierA);
});

test('carrier parameter only', async () => {
    expect(await parseQuote({ carrier: 'carrier-a' })).toBe(expectedParsedCarrierA);
});

test('carrier parameter and file path parameter', async () => {
    expect(await parseQuote({ carrier: 'carrier-a', filePath: "./data/carrier-a-quote.csv" })).toBe(expectedParsedCarrierA);
});

test('empty carrier parameter throws error', async () => {
    await expect(parseQuote({ carrier: '', filePath: "./data/carrier-a-quote.csv" })).rejects.toThrowError();
});

test('unknown carrier parameter throws error', async () => {
    await expect(parseQuote({ carrier: 'carrier-d', filePath: "./data/carrier-d-quote.csv" })).rejects.toThrowError();
});