/**
 * Entry point for the Quote Comparison Engine API
 */

import express, { Express, Request, Response } from 'express';
import comparisonRoutes from './api/routes';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic logging middleware
app.use((req: Request, _res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', comparisonRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Quote Comparison Engine running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

export default app;

