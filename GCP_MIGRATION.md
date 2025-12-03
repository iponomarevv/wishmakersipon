# Миграция на Google Cloud Platform

## 🎯 Цель
Перенести Wishmakers приложение с Vercel на Google Cloud Platform.

## 📊 Текущая архитектура (Vercel)

- **Frontend:** React приложение на Vercel
- **Backend:** Vercel Serverless Functions (`/api/*`)
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel Edge Network

## 🏗️ Новая архитектура (GCP)

### Вариант 1: Cloud Run (рекомендуется) ⭐
- **Frontend + Backend:** Cloud Run (контейнеризация)
- **Database:** Cloud SQL (PostgreSQL) или оставить Supabase
- **CDN:** Cloud CDN
- **Storage:** Cloud Storage (для статики)

### Вариант 2: App Engine
- **Frontend + Backend:** App Engine (управляемый сервис)
- **Database:** Cloud SQL (PostgreSQL)
- **Storage:** Cloud Storage

### Вариант 3: Гибридный
- **Frontend:** Cloud Storage + Cloud CDN (статический хостинг)
- **Backend:** Cloud Functions или Cloud Run
- **Database:** Cloud SQL или Supabase

## 🚀 План миграции (Cloud Run)

### Шаг 1: Подготовка проекта

1. **Создать Dockerfile:**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Копировать package files
COPY package*.json ./
RUN npm ci --only=production

# Копировать исходный код
COPY . .

# Собрать приложение
RUN npm run build

# Expose port
EXPOSE 8080

# Запустить приложение
CMD ["npm", "run", "start"]
```

2. **Обновить package.json:**
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "vite build"
  }
}
```

3. **Создать server.js для Cloud Run:**
```javascript
// server.js
const express = require('express');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from dist
app.use(express.static('dist'));

// API routes
app.use('/api', require('./api-server'));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Шаг 2: Настройка GCP

1. **Создать проект в GCP:**
```bash
# Установить Google Cloud SDK
# https://cloud.google.com/sdk/docs/install

# Войти в GCP
gcloud auth login

# Создать проект
gcloud projects create wishmakers-gcp --name="Wishmakers"

# Установить проект по умолчанию
gcloud config set project wishmakers-gcp

# Включить необходимые API
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable storage-api.googleapis.com
```

2. **Создать Cloud SQL (PostgreSQL):**
```bash
# Создать Cloud SQL instance
gcloud sql instances create wishmakers-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

# Создать базу данных
gcloud sql databases create wishmakers --instance=wishmakers-db

# Создать пользователя
gcloud sql users create wishmakers-user \
  --instance=wishmakers-db \
  --password=YOUR_PASSWORD
```

3. **Настроить переменные окружения:**
```bash
# В Cloud Run Console или через gcloud
gcloud run services update wishmakers \
  --set-env-vars="SUPABASE_URL=..." \
  --set-env-vars="SUPABASE_ANON_KEY=..." \
  --set-env-vars="SUPABASE_SERVICE_ROLE_KEY=..."
```

### Шаг 3: Деплой на Cloud Run

1. **Собрать и задеплоить:**
```bash
# Собрать Docker image
gcloud builds submit --tag gcr.io/wishmakers-gcp/wishmakers

# Деплой на Cloud Run
gcloud run deploy wishmakers \
  --image gcr.io/wishmakers-gcp/wishmakers \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

2. **Настроить домен:**
```bash
# Связать домен
gcloud run domain-mappings create \
  --service wishmakers \
  --domain wishmakers.ru \
  --region us-central1
```

### Шаг 4: Настройка CI/CD

1. **Cloud Build (автоматический деплой):**
```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/wishmakers', '.']
  
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/wishmakers']
  
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'wishmakers'
      - '--image'
      - 'gcr.io/$PROJECT_ID/wishmakers'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
```

2. **Подключить GitHub:**
- Cloud Build → Triggers → Connect Repository
- Выбрать GitHub репозиторий
- Настроить автоматический деплой при push

## 💰 Стоимость (примерная)

### Cloud Run:
- **Free tier:** 2 миллиона запросов/месяц
- **После free tier:** $0.40 за миллион запросов
- **CPU/Memory:** $0.00002400 за vCPU-секунду, $0.00000250 за GiB-секунду

### Cloud SQL:
- **db-f1-micro:** ~$7.67/месяц
- **db-g1-small:** ~$25.60/месяц

### Cloud Storage:
- **Free tier:** 5GB
- **После free tier:** $0.020 за GB/месяц

**Итого для MVP:** ~$10-30/месяц (с free tier)

## 🔄 Альтернатива: Оставить Supabase

Можно оставить Supabase как базу данных и использовать только Cloud Run для хостинга:

```bash
# Минимальная миграция
1. Создать Dockerfile
2. Деплой на Cloud Run
3. Оставить Supabase (не мигрировать базу)
4. Обновить CORS настройки в Supabase
```

## 📝 Чеклист миграции

- [ ] Создать GCP проект
- [ ] Установить Google Cloud SDK
- [ ] Создать Dockerfile
- [ ] Настроить server.js
- [ ] Создать Cloud SQL (или оставить Supabase)
- [ ] Настроить переменные окружения
- [ ] Собрать и задеплоить на Cloud Run
- [ ] Настроить домен
- [ ] Настроить CI/CD
- [ ] Протестировать приложение
- [ ] Обновить DNS записи
- [ ] Мониторинг и логи

## 🛠️ Полезные команды

```bash
# Просмотр логов
gcloud run services logs read wishmakers --region us-central1

# Обновление сервиса
gcloud run services update wishmakers --region us-central1

# Просмотр переменных окружения
gcloud run services describe wishmakers --region us-central1

# Удаление сервиса
gcloud run services delete wishmakers --region us-central1
```

## 🔐 Безопасность

1. **Service Account:**
```bash
# Создать service account
gcloud iam service-accounts create wishmakers-sa

# Назначить роли
gcloud projects add-iam-policy-binding wishmakers-gcp \
  --member="serviceAccount:wishmakers-sa@wishmakers-gcp.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"
```

2. **Secrets Manager:**
```bash
# Сохранить секреты
echo -n "your-secret" | gcloud secrets create supabase-key --data-file=-

# Использовать в Cloud Run
gcloud run services update wishmakers \
  --update-secrets=SUPABASE_KEY=supabase-key:latest
```

## 📚 Ресурсы

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [GCP Free Tier](https://cloud.google.com/free)

## ⚠️ Важные замечания

1. **Telegram Mini App:** Убедись, что домен настроен правильно для Telegram
2. **CORS:** Настроить CORS в Cloud Run для Supabase
3. **HTTPS:** Cloud Run автоматически предоставляет HTTPS
4. **Масштабирование:** Cloud Run автоматически масштабируется до 0 при отсутствии трафика

