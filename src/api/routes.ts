/**
 * API routes for quote comparison
 */

import { Router, Request, Response } from 'express';

const router = Router();

/**
 * POST /api/compare
 * 
 * Compare multiple insurance quotes
 * 
 * Request body:
 * {
 *   quotes: [
 *     { carrier: "carrier-a", filePath: "./data/carrier-a-quote.csv" },
 *     { carrier: "carrier-b", filePath: "./data/carrier-b-quote.json" }
 *   ]
 * }
 * 
 * Optional query params:
 * - summarize=true : Generate AI summary (bonus feature)
 */
router.post('/compare', async (req: Request, res: Response) => {
  try {
    // TODO: Validate request body
    // TODO: Parse each quote using parseQuote()
    // TODO: Compare quotes using compareQuotes()
    // TODO: Optionally generate AI summary if ?summarize=true
    // TODO: Return comparison result
    
    res.status(501).json({ error: 'Not implemented' });
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// TODO: Add other routes as needed (e.g., health check, list carriers)

export default router;

