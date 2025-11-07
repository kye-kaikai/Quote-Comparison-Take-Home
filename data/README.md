# Sample Quote Data

This directory contains sample insurance quotes from three different carriers. Each carrier uses different formats and field names, simulating the real-world challenge of integrating data from multiple sources.

## Files

### carrier-a-quote.csv
**Format:** CSV  
**Carrier:** Acme Insurance Co  
**Quote ID:** QA-2024-001

**Field Mapping:**
- `Quote_ID` → Quote identifier
- `Carrier_Name` → Carrier name
- `Quote_Date` → Date quote was generated
- `Policy_Start` → Effective date (MM/DD/YYYY format)
- `Policy_End` → Expiration date (MM/DD/YYYY format)
- `Coverage_Type` → Coverage type (full names)
- `Limit_Amount` → Coverage limit (currency format with $ and commas)
- `Premium_Cost` → Premium amount (currency format with $ and commas)
- `Deductible` → Deductible amount (currency format, may be empty)

**Characteristics:**
- Uses full coverage type names (e.g., "General Liability")
- Currency values include dollar signs and commas
- Date format: MM/DD/YYYY
- Includes all 5 coverage types

---

### carrier-b-quote.json
**Format:** JSON  
**Carrier:** BestRate Insurance Group  
**Quote ID:** QB-2024-445

**Structure:**
```json
{
  "quoteId": "string",
  "carrier": { "id": "string", "name": "string" },
  "dates": {
    "quoted": "ISO8601",
    "effectiveDate": "ISO8601",
    "expirationDate": "ISO8601"
  },
  "coverages": [
    {
      "coverage": {
        "type": "string (abbreviation)",
        "description": "string"
      },
      "limits": {
        "perOccurrence": number,
        "aggregate": number
      },
      "pricing": {
        "premium": number,
        "deductible": number
      }
    }
  ],
  "totalPremium": number
}
```

**Characteristics:**
- Uses abbreviated coverage types (GL, PROP, WC, CYBER)
- Currency values are plain numbers (no formatting)
- Date format: ISO 8601
- Missing Professional Liability coverage (intentional gap)
- Includes pre-calculated total premium

---

### carrier-c-quote.csv
**Format:** CSV  
**Carrier:** CostPlus Insurance Partners  
**Quote ID:** QC-789-2024

**Field Mapping:**
- `QuoteNumber` → Quote identifier
- `InsuranceCompany` → Carrier name
- `DateQuoted` → Date quote was generated (MM/DD/YYYY)
- `EffectiveDate` → Effective date (YYYY-MM-DD format)
- `ExpirationDate` → Expiration date (YYYY-MM-DD format)
- `CoverageDescription` → Coverage type (concatenated names, no spaces)
- `LimitValue` → Coverage limit (plain decimal number)
- `AnnualPremium` → Premium amount (plain decimal number)
- `DeductibleAmount` → Deductible amount (plain decimal number)

**Characteristics:**
- Uses concatenated coverage type names (e.g., "GenLiability", "ProfessionalLiab")
- Currency values are plain decimals with .00
- Mixed date formats (MM/DD/YYYY for quote date, YYYY-MM-DD for policy dates)
- Missing Workers Compensation coverage (intentional gap)
- Generally higher premiums than other carriers

---

## Intentional Inconsistencies

These data files include realistic inconsistencies you'll need to handle:

### 1. Field Name Variations
- Quote ID: `Quote_ID`, `quoteId`, `QuoteNumber`
- Carrier: `Carrier_Name`, `carrier.name`, `InsuranceCompany`
- Premium: `Premium_Cost`, `pricing.premium`, `AnnualPremium`

### 2. Coverage Type Name Variations
| Normalized Name | Carrier A | Carrier B | Carrier C |
|----------------|-----------|-----------|-----------|
| General Liability | "General Liability" | "GL" | "GenLiability" |
| Professional Liability | "Professional Liability" | N/A | "ProfessionalLiab" |
| Property Insurance | "Property Insurance" | "PROP" | "PropertyCoverage" |
| Workers Compensation | "Workers Compensation" | "WC" | N/A |
| Cyber Liability | "Cyber Liability" | "CYBER" | "CyberInsurance" |

### 3. Date Format Variations
- **Carrier A:** `MM/DD/YYYY` (e.g., "03/01/2024")
- **Carrier B:** ISO 8601 (e.g., "2024-03-01T00:00:00Z")
- **Carrier C:** Mixed - `MM/DD/YYYY` and `YYYY-MM-DD`

### 4. Currency Format Variations
- **Carrier A:** Dollar sign with commas (e.g., "$1,250.00")
- **Carrier B:** Plain numbers (e.g., 1150.00)
- **Carrier C:** Plain decimals (e.g., 1575.00)

### 5. Coverage Gaps
- **Carrier B:** Missing "Professional Liability" (should be detected as gap)
- **Carrier C:** Missing "Workers Compensation" (should be detected as gap)

### 6. Price Variations
For comparable coverage (General Liability, $1M limit):
- Carrier A: $1,250.00
- Carrier B: $1,150.00 (best price)
- Carrier C: $1,575.00 (37% more than Carrier B - should trigger "significant difference" alert)

## Expected Normalization

After parsing and normalization, all quotes should conform to the common `Quote` schema:

```typescript
{
  carrierId: string,
  carrierName: string,
  quoteDate: Date,
  effectiveDate: Date,
  expirationDate: Date,
  totalPremium: number,
  coverages: [
    {
      type: string,        // Normalized name
      limit: number,       // Numeric value
      premium: number,     // Numeric value
      deductible?: number  // Numeric value or undefined
    }
  ]
}
```
