import { test, expect } from '@jest/globals';
import { buildCoverageMatrix, compareQuotes, findCoverageGaps, getLowestTotalPremium, identifyVariances } from '../src/services/index';

const quotes = [{
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
}, {
    carrierId: 'carrier-c',
    carrierName: 'CostPlus Insurance Partners',
    quoteDate: new Date("2024-01-20"),
    effectiveDate: new Date("2024-02-29"),
    expirationDate: new Date("2025-02-28"),
    totalPremium: 5850,
    coverages: [
        {
            type: 'General Liability',
            limit: 1000000,
            premium: 1575,
            deductible: 1000
        },
        {
            type: 'Professional Liability',
            limit: 2000000,
            premium: 2275,
            deductible: 2500
        },
        {
            type: 'Property Insurance',
            limit: 500000,
            premium: 900,
            deductible: 500
        },
        {
            type: 'Cyber Liability',
            limit: 1000000,
            premium: 1100,
            deductible: 5000
        }
    ]
}];

test('get full comparison report', () => {
    const comparison = compareQuotes(quotes);
    expect(comparison).toStrictEqual({
        "quotes": [
            {
                "carrierId": "carrier-a",
                "carrierName": "Acme Insurance Co",
                "quoteDate": "2024-01-14T00:00:00.000Z",
                "effectiveDate": "2024-03-01T00:00:00.000Z",
                "expirationDate": "2025-03-01T00:00:00.000Z",
                "totalPremium": 6625.5,
                "coverages": [
                    {
                        "type": "General Liability",
                        "limit": 1000000,
                        "premium": 1250,
                        "deductible": 1000
                    },
                    {
                        "type": "Professional Liability",
                        "limit": 2000000,
                        "premium": 2100.5,
                        "deductible": 2500
                    },
                    {
                        "type": "Property Insurance",
                        "limit": 500000,
                        "premium": 875,
                        "deductible": 500
                    },
                    {
                        "type": "Workers Compensation",
                        "limit": 1000000,
                        "premium": 1450,
                        "deductible": 0
                    },
                    {
                        "type": "Cyber Liability",
                        "limit": 1000000,
                        "premium": 950,
                        "deductible": 5000
                    }
                ]
            },
            {
                "carrierId": "carrier-c",
                "carrierName": "CostPlus Insurance Partners",
                "quoteDate": "2024-01-20T00:00:00.000Z",
                "effectiveDate": "2024-02-29T00:00:00.000Z",
                "expirationDate": "2025-02-28T00:00:00.000Z",
                "totalPremium": 5850,
                "coverages": [
                    {
                        "type": "General Liability",
                        "limit": 1000000,
                        "premium": 1575,
                        "deductible": 1000
                    },
                    {
                        "type": "Professional Liability",
                        "limit": 2000000,
                        "premium": 2275,
                        "deductible": 2500
                    },
                    {
                        "type": "Property Insurance",
                        "limit": 500000,
                        "premium": 900,
                        "deductible": 500
                    },
                    {
                        "type": "Cyber Liability",
                        "limit": 1000000,
                        "premium": 1100,
                        "deductible": 5000
                    }
                ]
            }
        ],
        "coverageMatrix": {
            "General Liability": {
                "carrier-a": {
                    "limit": 1000000,
                    "premium": 1250,
                    "deductible": 1000
                },
                "carrier-c": {
                    "limit": 1000000,
                    "premium": 1575,
                    "deductible": 1000
                }
            },
            "Professional Liability": {
                "carrier-a": {
                    "limit": 2000000,
                    "premium": 2100.5,
                    "deductible": 2500
                },
                "carrier-c": {
                    "limit": 2000000,
                    "premium": 2275,
                    "deductible": 2500
                }
            },
            "Property Insurance": {
                "carrier-a": {
                    "limit": 500000,
                    "premium": 875,
                    "deductible": 500
                },
                "carrier-c": {
                    "limit": 500000,
                    "premium": 900,
                    "deductible": 500
                }
            },
            "Workers Compensation": {
                "carrier-a": {
                    "limit": 1000000,
                    "premium": 1450,
                    "deductible": 0
                }
            },
            "Cyber Liability": {
                "carrier-a": {
                    "limit": 1000000,
                    "premium": 950,
                    "deductible": 5000
                },
                "carrier-c": {
                    "limit": 1000000,
                    "premium": 1100,
                    "deductible": 5000
                }
            }
        },
        "insights": {
            "lowestTotalPremium": {
                "carrierId": "carrier-c",
                "amount": 5850
            },
            "coverageGaps": [
                {
                    "carrier": "carrier-c",
                    "missingCoverage": "Workers Compensation"
                }
            ],
            "significantDifferences": [
                {
                    "coverageType": "General Liability",
                    "carriers": [
                        "carrier-a",
                        "carrier-c"
                    ],
                    "variance": 26
                }
            ]
        }
    });
});

test('build coverage matrix', () => {
    const matrix = buildCoverageMatrix(quotes);
    const matrixCoverages: string[] = Object.getOwnPropertyNames(matrix);
    expect(matrixCoverages).toStrictEqual([
        'General Liability',
        'Professional Liability',
        'Property Insurance',
        'Workers Compensation',
        'Cyber Liability'
    ]);
    // expect - full coverage matrix to match an expected result
});

test('find coverage gaps', () => {
    const gaps = findCoverageGaps(quotes);
    expect(gaps).toStrictEqual([{
        "carrier": 'carrier-c',
        "missingCoverage": 'Workers Compensation'
    }]);
});

test('get lowest total premium', () => {
    const lowestTotalPrem = getLowestTotalPremium(quotes);
    expect(lowestTotalPrem).toStrictEqual({ "amount": 5850, "carrierId": "carrier-c" })
});

test('identify variances', () => {
    const diffs = identifyVariances(quotes);
    expect(diffs.length).toEqual(1);
    expect(diffs[0].coverageType).toEqual('General Liability');
    expect(diffs[0].carriers).toContain('carrier-a');
    expect(diffs[0].carriers).toContain('carrier-c');
    expect(diffs[0].variance).toEqual(26);
});