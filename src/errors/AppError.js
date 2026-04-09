class AppError extends Error {
  constructor(message, options = {}) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = options.statusCode || 500;
    this.code = options.code || 'internal_error';
    this.details = options.details;
  }
}

class ValidationError extends AppError {
  constructor(message, details) {
    super(message, {
      statusCode: 400,
      code: 'validation_error',
      details,
    });
  }
}

class UpstreamError extends AppError {
  constructor(message, details) {
    super(message, {
      statusCode: 502,
      code: 'upstream_error',
      details,
    });
  }
}

module.exports = {
  AppError,
  ValidationError,
  UpstreamError,
};
