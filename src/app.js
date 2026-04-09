const express = require('express');
const cors = require('cors');
const { AppError } = require('./errors/AppError');
const { getTrackDataHandler } = require('./handlers/getTrackDataHandler');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(cors({
  origin: ['http://localhost:8000'],
}));

function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

app.get('/get-track-data/:track', asyncHandler(getTrackDataHandler));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: 'not_found',
    message: `Маршрут ${req.method} ${req.originalUrl} не найден`,
  });
});

app.use((error, _req, res, _next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      ok: false,
      error: error.code,
      message: error.message,
      details: error.details,
    });
  }

  console.error(error);

  return res.status(500).json({
    ok: false,
    error: 'internal_error',
    message: 'Внутренняя ошибка сервера',
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
