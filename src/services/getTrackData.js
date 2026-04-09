const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const { ValidationError, UpstreamError } = require('../errors/AppError');

const TRACK_CODE_PATTERN = /^[A-Za-z0-9-]+$/;
const CDEK_TRACK_INFO_URL = 'https://www.cdek.ru/api-site/track/info/';
const CDEK_TRACKING_PAGE_URL = 'https://www.cdek.ru/ru/tracking/';
const CDEK_REQUEST_TIMEOUT_MS = 15000;
const CDEK_DEFAULT_HEADERS = {
  accept: 'application/json, text/plain, */*',
  'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
  referer: CDEK_TRACKING_PAGE_URL,
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
  'x-requested-with': 'XMLHttpRequest',
};

function validateTrackCode(trackCode) {
  const normalizedTrackCode = String(trackCode || '').trim();

  if (!normalizedTrackCode) {
    throw new ValidationError('Параметр track обязателен');
  }

  if (normalizedTrackCode.length < 5 || normalizedTrackCode.length > 100) {
    throw new ValidationError('Параметр track должен быть длиной от 5 до 100 символов');
  }

  if (!TRACK_CODE_PATTERN.test(normalizedTrackCode)) {
    throw new ValidationError(
      'Параметр track может содержать только латинские буквы, цифры и дефис'
    );
  }

  return normalizedTrackCode;
}

function createUpstreamError(message, error) {
  if (error.response) {
    return new UpstreamError(message, {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data,
    });
  }

  if (error.code) {
    return new UpstreamError(message, {
      code: error.code,
    });
  }

  return new UpstreamError(message, {
    reason: error.message,
  });
}

async function getTrackData(trackCode) {
  const normalizedTrackCode = validateTrackCode(trackCode);
  const jar = new CookieJar();
  const session = wrapper(
    axios.create({
      jar,
      timeout: CDEK_REQUEST_TIMEOUT_MS,
      responseType: 'json',
      headers: CDEK_DEFAULT_HEADERS,
      validateStatus: (status) => status >= 200 && status < 400,
    })
  );

  try {
    await session.get(CDEK_TRACKING_PAGE_URL, {
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'x-requested-with': undefined,
      },
    });

    const response = await session.get(CDEK_TRACK_INFO_URL, {
      params: {
        track: normalizedTrackCode,
        locale: 'ru',
      },
    });

    return response.data;
  } catch (error) {
    throw createUpstreamError('Не удалось получить данные трека из CDEK', error);
  }
}

module.exports = {
  getTrackData,
  validateTrackCode,
};
