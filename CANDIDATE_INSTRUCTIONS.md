# Quick Start Guide for Candidates

Welcome! This document will help you get started quickly.

## What You're Building

A quote comparison API that:
1. Parses insurance quotes from 3 carriers (CSV & JSON formats)
2. Normalizes inconsistent data into a common schema
3. Compares quotes side-by-side
4. Identifies coverage gaps and price differences

## Setup (5 minutes)

```bash
# Install dependencies
npm install

# Verify the server starts (it won't do much yet - that's your job!)
npm run dev

# In another terminal, test the health endpoint
curl http://localhost:3000/health
```

Expected response: `{"status":"ok","timestamp":"..."}`

## Your Task Checklist

Work through these in order:

### Phase 1: Parsing & Normalization (60-75 min)
- [ ] Implement `parseQuote()` in `src/parsers/index.ts`
  - [ ] Parse Carrier A CSV format
  - [ ] Parse Carrier B JSON format  
  - [ ] Parse Carrier C CSV format
- [ ] Create helper functions for:
  - [ ] Normalizing coverage type names
  - [ ] Parsing currency strings to numbers
  - [ ] Parsing dates in multiple formats

**Test Your Work:**
```bash
# Example: Try parsing a file
node -e "const {parseQuote} = require('./dist/parsers'); parseQuote({carrier: 'carrier-a', filePath: './data/carrier-a-quote.csv'}).then(console.log)"
```

### Phase 2: Comparison Logic (45-60 min)
- [ ] Implement `compareQuotes()` in `src/services/comparisonService.ts`
  - [ ] Build coverage matrix (side-by-side comparison)
  - [ ] Find lowest total premium
  - [ ] Identify coverage gaps
  - [ ] Calculate significant differences (>20% variance)

### Phase 3: API Endpoint (30-45 min)
- [ ] Implement `POST /api/compare` in `src/api/routes.ts`
  - [ ] Validate request body
  - [ ] Parse all quotes
  - [ ] Run comparison
  - [ ] Return results

**Test Your Work:**
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

### Phase 4: Testing (20-30 min)
- [ ] Write tests in `tests/` directory
  - [ ] Parser tests (at least one per carrier)
  - [ ] Comparison logic tests
  - [ ] API endpoint test

Run tests with: `npm test`

### Phase 5: Documentation (10-15 min)
- [ ] Update README with:
  - [ ] Your assumptions and trade-offs
  - [ ] What you'd do with more time
  - [ ] Any known limitations

### Bonus (if time allows)
- [ ] Add `?summarize=true` query parameter
- [ ] Call OpenAI API to generate plain-English summary

## Key Files to Review

1. **`data/README.md`** - Detailed data format documentation (READ THIS FIRST!)
2. **`src/models/quote.ts`** - Your target schema
3. **`data/carrier-*.{csv,json}`** - Sample data with intentional inconsistencies

## Common Pitfalls to Avoid

❌ Don't try to handle every edge case - focus on the sample data  
❌ Don't spend too long on perfect abstractions - working code > perfect code  
❌ Don't forget to handle empty/missing fields  
❌ Don't over-engineer - this is a 2-3 hour exercise

✅ Do normalize coverage type names (see data/README.md)  
✅ Do handle multiple date formats  
✅ Do parse currency strings correctly  
✅ Do write at least basic tests  
✅ Do document your assumptions

## Data Quirks to Handle

- **Coverage types**: "General Liability" = "GL" = "GenLiability"
- **Currency**: "$1,250.00" = "1250.00" = 1250.00
- **Dates**: "03/01/2024" = "2024-03-01T00:00:00Z" = "2024-03-01"
- **Missing fields**: Empty strings, null, or undefined

## Expected Results

When you compare all 3 carriers, you should find:
- ✅ Carrier B has lowest total premium ($4,250)
- ✅ Carrier B is missing "Professional Liability"
- ✅ Carrier C is missing "Workers Compensation"
- ✅ General Liability varies by >20% (Carrier C is most expensive)

## Time Management Tips

- **If you're at 1 hour:** You should have basic parsing working
- **If you're at 2 hours:** You should have comparison logic working
- **If you're at 2.5 hours:** You should have the API working and be writing tests
- **If you're at 3+ hours:** Wrap up, document what's left, and submit

## Questions?

Email: pratik@sagentins.com

## Final Submission

Make sure your repo includes:
1. All code changes committed
2. Updated README with your notes
3. At least some basic tests
4. Instructions still work (we'll run `npm install`, `npm test`, `npm run dev`)

Good luck!
