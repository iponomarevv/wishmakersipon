# 🚀 Быстрый старт: Миграция на Google Cloud Platform

## Шаг 1: Установка Google Cloud SDK

```bash
# macOS
brew install google-cloud-sdk

# Или скачай с https://cloud.google.com/sdk/docs/install
```

## Шаг 2: Настройка проекта

```bash
# Войти в GCP
gcloud auth login

# Создать проект (или использовать существующий)
gcloud projects create wishmakers-gcp --name="Wishmakers"

# Установить проект по умолчанию
gcloud config set project wishmakers-gcp

# Включить необходимые API
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## Шаг 3: Деплой на Cloud Run

### Вариант A: Быстрый деплой (без Docker)

```bash
# Собрать приложение локально
npm run build

# Деплой через gcloud (требует адаптации)
gcloud run deploy wishmakers \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Вариант B: Деплой с Docker (рекомендуется)

```bash
# Собрать и задеплоить
gcloud run deploy wishmakers \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars="SUPABASE_URL=your-url" \
  --set-env-vars="SUPABASE_ANON_KEY=your-key" \
  --set-env-vars="SUPABASE_SERVICE_ROLE_KEY=your-key"
```

## Шаг 4: Настройка переменных окружения

```bash
# Через консоль GCP или gcloud
gcloud run services update wishmakers \
  --region us-central1 \
  --set-env-vars="SUPABASE_URL=https://xxx.supabase.co" \
  --set-env-vars="SUPABASE_ANON_KEY=xxx" \
  --set-env-vars="SUPABASE_SERVICE_ROLE_KEY=xxx"
```

## Шаг 5: Настройка домена

```bash
# Связать домен
gcloud run domain-mappings create \
  --service wishmakers \
  --domain wishmakers.ru \
  --region us-central1
```

## Шаг 6: Настройка CI/CD (опционально)

1. Зайди в [Cloud Build Console](https://console.cloud.google.com/cloud-build)
2. Triggers → Connect Repository
3. Выбери GitHub репозиторий
4. Настрой автоматический деплой при push в main

## 📊 Мониторинг

```bash
# Просмотр логов
gcloud run services logs read wishmakers --region us-central1

# Просмотр метрик
gcloud run services describe wishmakers --region us-central1
```

## 💰 Стоимость

- **Free tier:** 2 миллиона запросов/месяц
- **После free tier:** ~$0.40 за миллион запросов
- **CPU/Memory:** Минимальные затраты при низком трафике

## ⚠️ Важно

1. **API Endpoints:** Нужно адаптировать Vercel Serverless Functions под Express
2. **Telegram:** Убедись, что домен настроен правильно
3. **CORS:** Настроить CORS для Supabase
4. **HTTPS:** Cloud Run автоматически предоставляет HTTPS

## 🔄 Откат на Vercel

Если что-то пойдёт не так, можно вернуться на Vercel:
```bash
npx vercel --prod
```

## 📚 Документация

- [Cloud Run Quickstart](https://cloud.google.com/run/docs/quickstarts/build-and-deploy)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)
- [Cloud Run Best Practices](https://cloud.google.com/run/docs/tips)

