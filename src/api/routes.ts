/**
 * API routes for quote comparison
 */

import { Router, Request, Response } from 'express';
import { ParseOptions, parseQuote } from '../parsers';
import { APIErrMsgs, compareQuotes } from '../services';
import { Quote } from '../models/quote';

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
  // TODO: Validate request body
  const body = req.body;
  const reqQuotes = body.quotes;
  if (!body || !reqQuotes || !reqQuotes.length) {
    res.status(400).json({
      error: 'Bad Request Exception',
      message: APIErrMsgs.REQ_MISSING_QUOTES
    });
    return;
  }

  const quoteCarriers = reqQuotes.map((x: ParseOptions) => x.carrier);
  if (quoteCarriers.some((x: string | undefined | null) => !x)) {
    res.status(400).json({
      error: 'Bad Request Exception',
      message: APIErrMsgs.REQ_HAS_INVALID_QUOTES
    });
    return;
  }

  try {
    // TODO: Parse each quote using parseQuote()
    const quoteTasks: Promise<Quote>[] = [];
    reqQuotes.forEach((quote: ParseOptions) => {
      quoteTasks.push(parseQuote(quote));
    })

    const quotes = await Promise.all(quoteTasks);

    // TODO: Compare quotes using compareQuotes()
    const comparison = compareQuotes(quotes);

    // TODO: Optionally generate AI summary if ?summarize=true

    // TODO: Return comparison result
    res.status(200).json(comparison);
    return;
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    return;
  }
});

// TODO: Add other routes as needed (e.g., health check, list carriers)

export default router;

