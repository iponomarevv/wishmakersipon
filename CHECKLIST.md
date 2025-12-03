# Чеклист: Проверка работы шаринга списков

## ✅ Что уже сделано:
- [x] Код переведён на Supabase
- [x] Таблица `public_lists` создана
- [x] Переменные окружения установлены
- [x] Деплой выполнен

## 🔍 Что проверить:

### 1. Проверь тестовый endpoint
Открой в браузере:
```
https://wishmakers.ru/api/test-supabase
```

Должно вернуть:
```json
{
  "success": true,
  "connection": true,
  "tableExists": true,
  "write": true,
  "read": true
}
```

Если `success: false` или `tableExists: false` - значит таблица не создана или RLS блокирует доступ.

### 2. Проверь RLS policies
В Supabase Dashboard → SQL Editor выполни:

```sql
-- Проверь, включён ли RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'public_lists';

-- Если rowsecurity = true, но нет policies - создай их:
ALTER TABLE public_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public_lists
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public write access" ON public_lists
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### 3. Проверь логи при сохранении
1. Создай новый список
2. Нажми "Поделиться"
3. В Vercel Dashboard → Deployments → последний деплой → Functions → `/api/lists/index` → Logs
4. Ищи строки с `[POST /api/lists]`
5. Должно быть: `✅ List saved successfully` и `✅ Verified: list is accessible`

### 4. Проверь логи при загрузке
1. Попроси друга открыть ссылку
2. В Vercel Dashboard → Functions → `/api/lists/[id]` → Logs
3. Ищи строки с `[GET /api/lists/...]`
4. Должно быть: `✅ List found in Supabase`

## 🐛 Если не работает:

### Проблема: "List not found"
**Решение:**
1. Проверь, что список сохранился - смотри логи POST запроса
2. Проверь RLS policies - выполни SQL выше
3. Проверь, что ID в ссылке совпадает с ID сохранённого списка

### Проблема: "Permission denied" или "RLS"
**Решение:**
Выполни SQL для настройки RLS policies (см. выше)

### Проблема: Индикатор загрузки не исчезает
**Решение:**
Проверь логи - возможно, сохранение не завершается успешно

## 📝 Что делать дальше:
1. Выполни SQL для RLS policies (если ещё не выполнил)
2. Проверь тестовый endpoint `/api/test-supabase`
3. Создай список и поделись им
4. Проверь логи в Vercel Dashboard




