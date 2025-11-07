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

