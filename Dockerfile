# Dockerfile для Google Cloud Run
FROM node:18-alpine AS builder

WORKDIR /app

# Копировать package files
COPY package*.json ./

# Установить зависимости
RUN npm ci

# Копировать исходный код
COPY . .

# Собрать приложение
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Копировать package files
COPY package*.json ./

# Установить только production зависимости
RUN npm ci --only=production

# Копировать собранное приложение
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/api ./api

# Создать простой сервер для Cloud Run
RUN echo 'const express = require("express"); \
const path = require("path"); \
const app = express(); \
const PORT = process.env.PORT || 8080; \
app.use(express.static("dist")); \
app.use(express.json()); \
app.get("*", (req, res) => { \
  res.sendFile(path.join(__dirname, "dist", "index.html")); \
}); \
app.listen(PORT, () => { \
  console.log(`Server running on port ${PORT}`); \
});' > server.js

# Expose port
EXPOSE 8080

# Запустить сервер
CMD ["node", "server.js"]

