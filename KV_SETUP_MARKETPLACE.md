# Настройка KV через Vercel Marketplace (Upstash)

## Проблема
Vercel KV теперь доступен только через Marketplace. Нужно использовать Upstash Redis.

## Решение (пошагово):

### 1. Открой Vercel Dashboard
👉 https://vercel.com/dashboard

### 2. Выбери проект
- Найди проект **wishmakersipon**
- Кликни на него

### 3. Перейди в Storage
- В боковом меню слева найди **Storage**
- Ты увидишь сообщение: "KV and Postgres are now available through the Marketplace"

### 4. Настрой Upstash через Marketplace
- В разделе **Marketplace Database Providers** найди **Upstash**
- Нажми на карточку **Upstash** (Serverless DB - Redis, Vector, Queue, Search)
- Нажми кнопку **Add Integration** или **Connect**

### 5. Создай Redis Database
- Если у тебя нет аккаунта Upstash, создай его (бесплатно)
- Создай новую Redis Database:
  - **Name**: `wishmakers-redis` (или любое другое)
  - **Region**: выбери ближайший (например, `us-east-1`)
  - **Type**: **Free** (для MVP достаточно)
- Нажми **Create**

### 6. Подключи к Vercel
- После создания базы, Upstash автоматически добавит переменные окружения в Vercel:
  - `KV_REST_API_URL`
  - `KV_REST_API_TOKEN`
- Эти переменные будут работать с `@vercel/kv` автоматически!

### 7. Проверь переменные окружения
- В Vercel Dashboard → Settings → Environment Variables
- Должны быть:
  - `KV_REST_API_URL` (начинается с `https://`)
  - `KV_REST_API_TOKEN` (длинная строка)

### 8. Перезапусти деплой
- В меню проекта выбери **Deployments**
- Найди последний деплой
- Нажми **⋯** (три точки) → **Redeploy**
- Или выполни в терминале: `npx vercel --prod`

### 9. Готово! ✅
Теперь попробуй:
1. Создай список
2. Нажми "Поделиться"
3. Должно работать без ошибок!

---

## Альтернатива: Использовать другой провайдер

Если Upstash не подходит, можно использовать:
- **Redis** (Serverless Redis) - тоже хороший вариант
- **Supabase** - но нужно будет изменить код

Но **Upstash** - самый простой и бесплатный вариант для MVP.

---

## Стоимость Upstash Free Tier
- **10,000 команд в день** (достаточно для MVP)
- **256 MB данных**
- **Бесплатно навсегда**

---

## Если что-то не работает:

1. **Проверь переменные окружения:**
   ```bash
   npx vercel env ls
   ```
   Должны быть `KV_REST_API_URL` и `KV_REST_API_TOKEN`

2. **Проверь логи:**
   - Deployments → выбери деплой → Functions → `/api/lists`
   - Посмотри, есть ли ошибки

3. **Подожди 1-2 минуты:**
   - После подключения может потребоваться время для синхронизации




