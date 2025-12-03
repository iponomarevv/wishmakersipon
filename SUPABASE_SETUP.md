# Настройка Supabase вместо Upstash KV

## ✅ Код уже обновлён!
Код переведён на Supabase. Теперь нужно только настроить базу данных.

## Почему Supabase?
- ✅ **Нет проблем с синхронизацией** (PostgreSQL имеет strong consistency)
- ✅ **Надёжнее чем Redis** - данные доступны сразу после сохранения
- ✅ **Бесплатный tier** достаточен для MVP (500MB базы, 2GB bandwidth)
- ✅ **Автоматические бэкапы**

## Шаги настройки:

### 1. Подключи Supabase через Vercel Marketplace
1. Зайди в **Vercel Dashboard** → твой проект → **Storage**
2. В разделе **Marketplace Database Providers** найди **Supabase** (Postgres backend)
3. Нажми **Add Integration** или **Connect**
4. Создай новый Supabase проект (или используй существующий)
5. Supabase **автоматически** добавит переменные окружения:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

### 2. Создай таблицу в Supabase
После подключения:
1. Зайди в **Supabase Dashboard** → **SQL Editor**
2. Выполни этот SQL:

```sql
CREATE TABLE IF NOT EXISTS public_lists (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_lists_id ON public_lists(id);

-- Enable Row Level Security
ALTER TABLE public_lists ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read public lists (for sharing)
CREATE POLICY "Allow public read access" ON public_lists
  FOR SELECT
  USING (true);

-- Allow anyone to insert/update/delete (we'll handle auth in API if needed)
CREATE POLICY "Allow public write access" ON public_lists
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

3. Нажми **Run** (или F5)

**Важно:** Если после выполнения SQL видишь ошибку про RLS или policies - это нормально, попробуй выполнить только первую часть (CREATE TABLE) и проверь, работает ли.

### 3. Перезапусти деплой
```bash
npx vercel --prod
```

Или в Vercel Dashboard → Deployments → последний деплой → **Redeploy**

### 4. Готово! ✅
Теперь попробуй:
1. Создай список
2. Нажми "Поделиться"
3. Отправь ссылку другу
4. Должно работать без проблем!

## Преимущества перед Upstash:
- ✅ **Нет задержек** - данные доступны сразу
- ✅ **Нет проблем с синхронизацией**
- ✅ **Более стабильный**
- ✅ **Проще в использовании**

