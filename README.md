# Quote Comparison Engine - Take Home Problem

**Time Estimate:** 2-3 hours

---

## Problem Description

You're building the foundation of a quote comparison tool for insurance brokers. In production, carriers send quotes as PDFs with varying layouts and formats. We use document extraction services (OCR + LLM-based extraction) to convert these PDFs into structured data. **Your work begins after that extraction step.**

You'll receive quotes in different formats (CSV, JSON) with inconsistent field names and data structures. Your task is to build a system that:

1. **Parses** quotes from different carriers (CSV and JSON formats)
2. **Normalizes** the data into a common schema
3. **Compares** quotes side-by-side via an API
4. **Identifies** coverage gaps and pricing differences

This simulates real-world challenges our engineering team faces when integrating data from multiple insurance carriers.

---

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone this repository
git clone <repository-url>
cd quote-comparison-engine

# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Run the development server
npm run dev
```

The server will start on `http://localhost:3000`

### Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

---

## Project Structure

```
quote-comparison-engine/
├── src/
│   ├── parsers/
│   │   └── index.ts              # TODO: Implement parser logic
│   ├── models/
│   │   └── quote.ts              # Base types/interfaces (partially complete)
│   ├── services/
│   │   └── comparisonService.ts  # TODO: Implement comparison logic
│   ├── api/
│   │   └── routes.ts             # TODO: Implement Express routes
│   └── index.ts                  # Entry point (basic setup provided)
├── data/
│   ├── carrier-a-quote.csv       # Sample quote from Carrier A
│   ├── carrier-b-quote.json      # Sample quote from Carrier B
│   ├── carrier-c-quote.csv       # Sample quote from Carrier C
│   └── README.md                 # Data format documentation
├── tests/
│   └── .gitkeep                  # Add your tests here
├── package.json                  # Dependencies pre-configured
├── tsconfig.json                 # TypeScript config
├── .eslintrc.js                  # Linting config
└── README.md                     # This file
```

---

## Technical Requirements

### 1. Data Parsing

Implement parsers in `src/parsers/` that can handle:

- **Carrier A (CSV)**: Uses columns like `Coverage_Type`, `Limit_Amount`, `Premium_Cost`
- **Carrier B (JSON)**: Uses nested structure with `coverage.type`, `coverage.limit`, `pricing.premium`
- **Carrier C (CSV)**: Uses different naming: `CoverageDescription`, `LimitValue`, `AnnualPremium`

**Your parser should:**
- Accept file path or raw data string
- Detect or accept carrier type
- Return normalized `Quote` objects
- Handle common data issues (missing fields, formatting inconsistencies)

See `data/README.md` for detailed information about each carrier's format.

### 2. Data Normalization

The common `Quote` schema is partially defined in `src/models/quote.ts`:

```typescript
interface Quote {
  carrierId: string;
  carrierName: string;
  quoteDate: Date;
  effectiveDate: Date;
  expirationDate: Date;
  totalPremium: number;
  coverages: Coverage[];
}

interface Coverage {
  type: string;           // Normalized coverage type
  limit: number;          // Numeric limit value
  premium: number;        // Coverage-specific premium
  deductible?: number;    // Optional deductible
}
```

**Normalization requirements:**
- Standardize coverage type names (e.g., "General Liability", "GL", "GenLiability" → "General Liability")
- Convert string currency values to numbers
- Parse dates into consistent format
- Handle currency formatting variations ($1,000.00 vs 1000.00)

### 3. Comparison API

Implement a REST API in `src/api/routes.ts`:

**Endpoint:** `POST /api/compare`

**Request Body:**
```json
{
  "quotes": [
    { "carrier": "carrier-a", "filePath": "./data/carrier-a-quote.csv" },
    { "carrier": "carrier-b", "filePath": "./data/carrier-b-quote.json" },
    { "carrier": "carrier-c", "filePath": "./data/carrier-c-quote.csv" }
  ]
}
```

**Response:**
```json
{
  "comparison": {
    "quotes": [],
    "coverageMatrix": {
      "General Liability": {
        "carrier-a": {
          "limit": 1000000,
          "premium": 1250.00,
          "deductible": 1000
        },
        "carrier-b": {
          "limit": 1000000,
          "premium": 1150.00,
          "deductible": 1000
        }
      }
    },
    "insights": {
      "lowestTotalPremium": {
        "carrierId": "carrier-b",
        "amount": 4250.00
      },
      "coverageGaps": [
        {
          "carrier": "carrier-b",
          "missingCoverage": "Professional Liability"
        }
      ],
      "significantDifferences": [
        {
          "coverageType": "General Liability",
          "carriers": ["carrier-a", "carrier-c"],
          "variance": 26.0
        }
      ]
    }
  }
}
```

### 4. Analysis & Insights

Your comparison service should identify:

- **Coverage Gaps**: Coverages present in some quotes but not others
- **Best Value**: Lowest premium for equivalent coverage
- **Significant Differences**: Premiums that vary by >20% for the same coverage type
- **Total Premium Comparison**: Overall cost ranking

### 5. Bonus: LLM Summary (Optional)

If time permits, add an optional `?summarize=true` query parameter that:
- Calls OpenAI API (we'll provide API key via env var)
- Generates a plain-English summary like:

> "Carrier B offers the lowest total premium at $4,250. However, they're missing Professional Liability coverage which Carriers A and C include. For General Liability, Carrier C is 30% more expensive than the others with similar limits."

---

## Sample Data Characteristics

The `data/` folder contains realistic but simplified quotes:

- **3 carriers**, each with 3-5 common coverage types
- **Intentional inconsistencies**:
  - Different field names
  - Different date formats
  - Currency with/without symbols and commas
  - Coverage type name variations
- **Coverage gaps**: At least one carrier missing one coverage type
- **Price variances**: Deliberate differences to test comparison logic

See `data/README.md` for detailed documentation of each carrier's format.

---

## Development Tips

1. **Start with parsers**: Get comfortable with the data formats first
2. **Normalize early**: Convert all data to the common schema as soon as possible
3. **Test incrementally**: Write tests as you build each component
4. **Focus on working code**: We value pragmatism over perfection
5. **Document assumptions**: If you make trade-offs, explain why

### Suggested Development Order

1. Implement basic CSV and JSON parsing
2. Build normalization logic (coverage types, currency, dates)
3. Create the comparison service
4. Implement the API endpoint
5. Add tests for core functionality
6. (Optional) Add LLM summary feature

---

## API Testing Examples

### Health Check
```bash
curl http://localhost:3000/health
```

### Compare Quotes
```bash
curl -X POST http://localhost:3000/api/compare \
  -H "Content-Type: application/json" \
  -d '{
    "quotes": [
      { "carrier": "carrier-a", "filePath": "./data/carrier-a-quote.csv" },
      { "carrier": "carrier-b", "filePath": "./data/carrier-b-quote.json" },
      { "carrier": "carrier-c", "filePath": "./data/carrier-c-quote.csv" }
    ]
  }'
```

### Compare with AI Summary (Bonus)
```bash
curl -X POST http://localhost:3000/api/compare?summarize=true \
  -H "Content-Type: application/json" \
  -d '{
    "quotes": [
      { "carrier": "carrier-a", "filePath": "./data/carrier-a-quote.csv" },
      { "carrier": "carrier-b", "filePath": "./data/carrier-b-quote.json" }
    ]
  }'
```

---

## Evaluation Criteria

We'll evaluate your submission based on:

1. **Correctness**: Does it parse and compare the sample data correctly?
2. **Code Quality**: Is it readable, maintainable, and well-organized?
3. **Error Handling**: Does it handle edge cases and errors gracefully?
4. **Testing**: Are there meaningful tests covering core functionality?
5. **Documentation**: Can we understand your approach and run your code?

We're NOT looking for:
- Perfect code (we value working solutions)
- Complete feature set (focus on core requirements)
- Production-ready error handling (basic is fine)
- Extensive test coverage (meaningful tests > 100% coverage)

---

## Deliverables

Please submit:

1. **Code**: Complete implementation pushed to a Git repository
2. **Tests**: At least basic test coverage for core functionality
3. **Updated README**: Include:
   - How to install dependencies ✅ (already included above)
   - How to run the application ✅ (already included above)
   - How to run tests ✅ (already included above)
   - API usage examples ✅ (already included above)
   - **Any assumptions or trade-offs you made**
   - **If you didn't complete everything, what you'd do with more time**
4. **Time log** (optional but appreciated): Rough breakdown of time spent

---

## Submission

Please submit:
- Link to your Git repository (ensure it's public or add us as collaborators)
- Any additional notes or context about your approach

**Questions?** Email me at pratik@sagentins.com

---

## Notes for Candidates

- This problem is designed to take 2-3 hours. If you're going over, don't worry - just document what you'd do with more time.
- Focus on demonstrating your problem-solving approach rather than building a perfect solution.
- Real-world insurance data is messy - your normalization logic doesn't need to be exhaustive.
- We're interested in how you think about data integration challenges.

Good luck! We're excited to see your approach to solving real insurance brokerage challenges.

### My Documentation
1. Assumptions
  * Assumed that CSV files always only contain 1 unique quote (based on the quote ID)
    - Drawback to this assumption is that if the extraction procedure took an additional and different quote, then the comparison engine would consider its premium and limit values when analyzing and gathering insights; thereby, causing inaccurate data from being reported.
  * Assumed that the only two valid file types are CSV and JSON files
    - Drawback of this assumption would be that if Excel (xls, excel) files were valid, then the API endpoint would fail; however, I do have a check on the file extension and throw an error with a corresponding message indicating that only CSVs and JSON are allowed.
  * Assumed that if a file path is provided, then it is the true (and valid) file path for the provided carrier
    - Drawback of this assumption is that this can possibly cause the incorrect carrier quote file from being read and leading to an unexpected behavior with compare API endpoint.
2. Tradeoffs
  * Manual Mapping of Coverage Types vs Fuzzy Matching Coverage Types
    - The benefit of manually mapping coverage types is ensuring accuracy within the comparison report, as there would be a direct one-for-one as to how to identify gaps and to calculate variances; however, the downside of this is that it requires more work on the developer and/or business to make the correct determinations as to how the coverage types should be matched. When this problem is scaled to a larger number of carriers, this would not be an appropriate approach. This is more beneficial for smaller scaled data, especially during MVPs, experiements, and/or POCs. Fuzzy matching would be more appropriate but with the downside of losing out on accuracy. Therefore, this makes the fuzzy matching threshold very important.
  * Transformation of Carrier Quote Properties to Normalized Quote Properties vs Manually Mapping Carrier Quote Properties to Normalized Quote Properties
    - I wanted to perform the transformation of carrier quote data early on by mapping the property names of the provided quote data to the property names of the Quote interface. The idea, or purpose, behind this was to account for additional carriers being added to the sample data, where they may share identical properties to the sample data carriers. For instance, if "carrier-d" was added into the sample data and it also contained "Premium_Cost" ("carrier-a") as its premium field, then it would prevent a future developer from having to manually map that property name again. However, the exercise of doing this was very similar to what my implementation ended up at, with me manually mapping the property names directly within the parsing functions. The benefit of the former approach is that it's a one-time activity to mapping a unique property; however, a major downside would be if the carrier quote properties change causing maintenance to be a big hassle. The latter approach also faces this same issue, so a possible alternative approach would be to perform a semantic-based mapping where a model would have to understand that "Policy_Start" = "effectiveDate" => "EffectiveDate"; however, this makes the transformation logic much more complex.
  * Variance checks all possible pairs naively
    - Although the variance calculations will capture all of the significant differences in coverage, it's written naively to check for all possible combination pairs of coverages. Due to this brute force approach, when the data scales up, the comparison engine won't perform as well due to the slowdown it would see if variance computations. In order to optimize for this, a sliding-window sort of approach may help with the performance, as it should theoretically capture all possible pairs.
3. What if I had more time?
  * I ended up using more time than what was suggested. The time log will indicate where and why I spent the time the way I did for each section; however, to summarize, the general theme was that I became too focused on the abstraction (going against the development tips). Consequentially, this led to more debugging on my end.
4. Time Log
  * Parsing & Normalization: ~3-4hrs
    - Planning time for abstraction and generalization, and experimenting with different approaches mentioned below
    - Attempt to manually map property names to the normalized Quote property names (as indicated in *Tradeoffs (2nd bullet point)*)
    - Switching between CSV reader and manually converting raw CSV data (with a standard transformation to an array of objects)
      - Didn't properly account for quoted data in CSV files, which led to some research as to how it could be possible with REGEX
      - Eventually arrived at the former
      - The goal for this problem that took a significant amount of my time was determining how I can pass a string of data in a standard way to each parsing function (parseCarrierA, parseCarrierB, parseCarrierC)
    - Debugging issues with CSV reader
    - Debugging errors with parsing raw CSV data
    - Debugging errors with local timezone in date (maybe should've considered using something like luxon library)
    - Issues with properly typing object-defined maps with string literals and properly accessing their property values
    - Manual testing to see what results were coming back from the parsing and normalization for each file
  * Comparison Logic: ~1hr 20min
    - Incorrect variance calculations
      - Initial attempt involved just trying to check the variance of the quote with the least coverages, thinking it would be beneficial for performance, but it led to the miss in checking all combination pairs of carrier quotes' variances 
      - Debugging issues for variance calculations
  * API Endpoint: ~1hr
    - Testing of comparison logic based on the sample data and comparing it with the sample response within the repository
  * Test Cases: ~40min-1hr
    - Jest testing with Express