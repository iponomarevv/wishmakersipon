# Быстрая настройка KV через Marketplace (Upstash)

## ⚠️ ВАЖНО: Vercel изменил политику!
KV теперь доступен **только через Marketplace**, а не напрямую.

## Решение (через Upstash):

### 1. Открой Vercel Dashboard
👉 https://vercel.com/dashboard

### 2. Выбери проект
- Найди проект **wishmakersipon**
- Кликни на него

### 3. Перейди в Storage
- В боковом меню слева найди **Storage**
- Ты увидишь: "KV and Postgres are now available through the Marketplace"

### 4. Настрой Upstash (Serverless Redis)
- В разделе **Marketplace Database Providers** найди **Upstash**
- Нажми на карточку **Upstash** (Serverless DB - Redis, Vector, Queue, Search)
- Нажми **Add Integration** или **Connect**
- Создай аккаунт Upstash (если нет) - **бесплатно**
- Создай новую Redis Database:
  - **Name**: `wishmakers-redis`
  - **Region**: ближайший к тебе
  - **Type**: **Free**
- Нажми **Create**

### 5. Автоматическое подключение
- Upstash автоматически добавит переменные окружения:
  - `KV_REST_API_URL`
  - `KV_REST_API_TOKEN`
- Ничего дополнительно делать не нужно!

### 4. Проверь автоматическое подключение
После создания KV:
- Vercel **автоматически** добавит переменные окружения к проекту
- Ничего дополнительно делать не нужно!

### 5. Перезапусти деплой
- В меню проекта выбери **Deployments**
- Найди последний деплой
- Нажми **⋯** (три точки) → **Redeploy**
- Или выполни в терминале: `npx vercel --prod`

### 6. Готово! ✅
Теперь попробуй снова:
1. Создай список
2. Нажми "Поделиться"
3. Должно работать без ошибок!

---

## Проверка через терминал (опционально)

```bash
# Проверить переменные окружения
npx vercel env ls

# Должны быть:
# KV_REST_API_URL
# KV_REST_API_TOKEN
```

---

## Если не работает:

1. **Проверь, что KV создан:**
   - Vercel Dashboard → Storage → должен быть список с твоим KV

2. **Проверь переменные окружения:**
   - Settings → Environment Variables
   - Должны быть: `KV_REST_API_URL` и `KV_REST_API_TOKEN`

3. **Проверь логи:**
   - Deployments → выбери деплой → Functions → `/api/lists`
   - Посмотри, есть ли ошибки

4. **Подожди 1-2 минуты:**
   - После создания KV может потребоваться время для синхронизации

---

## Стоимость
- **Бесплатно** для небольших проектов (256 MB данных)
- Этого достаточно для MVP


