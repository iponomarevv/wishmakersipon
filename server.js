// server.js для Google Cloud Run
const express = require('express');
const path = require('path');
const { fileURLToPath } = require('url');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.static('dist'));

// API Routes - проксируем к существующим API endpoints
// В Cloud Run API endpoints будут работать как обычные Express routes
app.use('/api', async (req, res, next) => {
  // Если API endpoints находятся в отдельных файлах, импортируй их здесь
  // Например: require('./api/lists/index')(req, res);
  // Или используй динамический импорт для Vercel-style handlers
  
  // Временное решение: возвращаем 404 для API routes
  // Нужно будет адаптировать Vercel Serverless Functions под Express
  res.status(404).json({ error: 'API endpoint not found' });
});

// SPA fallback - все остальные запросы отдаём index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});

