# CDEK Tracker

Минимальный `Express`-сервис для получения трекинг-данных CDEK по номеру отправления.

Сервис принимает трек-номер, валидирует его, открывает трекинг-страницу CDEK для получения необходимых cookies и затем запрашивает JSON из публичного endpoint CDEK. В ответ клиент получает данные без дополнительного преобразования.

## Возможности

- Маршрут `GET /get-track-data/:track`
- Проверка входного трек-номера
- Endpoint `GET /health` для healthcheck
- Обработка `404` и ошибок upstream-сервиса
- Локальный запуск и запуск через Docker

## Стек

- Node.js 20+
- Express 5
- Axios
- Docker / Docker Compose

## Структура проекта

```text
.
├── src/
│   ├── app.js
│   ├── errors/
│   ├── handlers/
│   └── services/
├── Dockerfile
├── Dockerfile.dev
├── docker-compose.yml
├── docker-compose.dev.yml
└── package.json
```

## API

### `GET /health`

Проверка доступности сервиса.

Пример ответа:

```json
{
  "ok": true
}
```

### `GET /get-track-data/:track`

Возвращает данные по трек-номеру из CDEK.

Пример запроса:

```bash
curl http://localhost:3000/get-track-data/10244207758
```

Если входные данные некорректны, сервис возвращает JSON-ошибку в формате:

```json
{
  "ok": false,
  "error": "validation_error",
  "message": "Описание ошибки"
}
```

Если внешний сервис CDEK недоступен или вернул ошибку, сервис возвращает ошибку категории `upstream_error`.

## Локальный запуск

Требования:

- Node.js 20 или выше
- npm

Установка зависимостей:

```bash
npm install
```

Запуск в dev-режиме:

```bash
npm run dev
```

Запуск в обычном режиме:

```bash
npm start
```

По умолчанию сервис доступен на `http://localhost:3000`.

## Переменные окружения

- `PORT` - порт приложения, по умолчанию `3000`

## Запуск через Docker

Production-сборка:

```bash
docker compose up --build
```

Dev-сборка с пробросом `./src` в контейнер:

```bash
docker compose -f docker-compose.dev.yml up --build
```

После запуска сервис будет доступен на порту `${PORT:-3000}` хоста.

## Примечания
