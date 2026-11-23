import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { equipmentRouter } from './routes/equipment.js';
import { requestsRouter } from './routes/requests.js';
import { conflictsRouter } from './routes/conflicts.js';
import { aiRouter } from './routes/ai.js';
import { analyticsRouter } from './routes/analytics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // Efficiency: Gzip compression for all JSON & static responses
  app.use(compression());

  // Security Headers: Helmet with strict Content-Type nosniff and tailored CSP
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      noSniff: true,
    })
  );

  // CORS
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-faculty-name'],
    })
  );

  // Security: Strict JSON body limit (100kb)
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // Rate Limiting for API routes
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requests per 15 minutes per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again after a few minutes.',
    },
  });
  app.use('/api/', apiLimiter);

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'LabSync API',
      version: '1.0.0',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    });
  });

  // Mount API routers
  app.use('/api/equipment', equipmentRouter);
  app.use('/api/requests', requestsRouter);
  app.use('/api/conflicts', conflictsRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/analytics', analyticsRouter);

  // Serve static client assets in production
  const clientDistCandidates = [
    path.resolve(__dirname, '../../client/dist'),
    path.resolve(__dirname, '../client/dist'),
    path.resolve(process.cwd(), 'client/dist'),
  ];

  let clientDistPath: string | null = null;
  for (const candidate of clientDistCandidates) {
    if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, 'index.html'))) {
      clientDistPath = candidate;
      break;
    }
  }

  if (clientDistPath) {
    // Serve static assets with 1d cache headers, but keep index.html uncached
    app.use(
      express.static(clientDistPath, {
        maxAge: '1d',
        setHeaders: (res: Response, filePath: string) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          } else {
            res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
          }
        },
      })
    );

    // Handle React SPA routes with uncached index.html
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api/')) {
        return next();
      }
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.join(clientDistPath!, 'index.html'));
    });
  }

  // 404 handler for unmatched API routes
  app.use('/api/*', (_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found',
    });
  });

  // Global Error Handler - Never leaks stack traces
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled server error:', err.message);
    res.status(500).json({
      success: false,
      error: err.message || 'An internal server error occurred',
    });
  });

  return app;
}
