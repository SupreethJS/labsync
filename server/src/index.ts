import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';

const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = '0.0.0.0';

const app = createApp();

const server = app.listen(PORT, HOST, () => {
  console.log(`====================================================`);
  console.log(`🚀 LabSync Server running at http://${HOST}:${PORT}`);
  console.log(`📡 Health Check: http://${HOST}:${PORT}/api/health`);
  console.log(`🤖 Gemini AI Engine: ${process.env.GEMINI_API_KEY ? 'Active (API Key loaded)' : 'Fallback Mode (Deterministic Heuristics Active)'}`);
  console.log(`====================================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server cleanly...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
