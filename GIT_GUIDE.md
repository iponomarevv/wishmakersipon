# Как поделиться репозиторием

## 📍 Текущий репозиторий:
**GitHub:** https://github.com/iponomarevv/wishmakersipon

## 🔗 Как поделиться:

### Вариант 1: Прямая ссылка
Просто отправь ссылку:
```
https://github.com/iponomarevv/wishmakersipon
```

### Вариант 2: Сделать публичным
1. Зайди на https://github.com/iponomarevv/wishmakersipon
2. Settings → Danger Zone → Change visibility
3. Make public

### Вариант 3: Добавить коллаборатора
1. Settings → Collaborators
2. Add people
3. Введи username или email

## 📤 Закоммитить и запушить изменения:

### 1. Добавить все изменения:
```bash
git add .
```

### 2. Закоммитить:
```bash
git commit -m "Update: добавлена поддержка Supabase, исправлены баги"
```

### 3. Запушить в текущую ветку (AmoCrm):
```bash
git push origin AmoCrm
```

### 4. Или запушить в main:
```bash
git checkout main
git merge AmoCrm
git push origin main
```

## 📋 Что будет закоммичено:

### Новые файлы:
- `api/` - API endpoints для Supabase
- `apiClient.ts` - клиент для работы с API
- `SECURITY.md` - документация по безопасности
- `SUPABASE_SETUP.md` - инструкция по настройке Supabase
- И другие файлы...

### Изменённые файлы:
- `App.tsx` - основная логика приложения
- `components/` - компоненты React
- `vite.config.ts` - конфигурация сборки
- И другие...

## ⚠️ Важно:

1. **Не коммитьте:**
   - `.env` файлы (содержат секретные ключи)
   - `node_modules/` (устанавливается через npm)
   - `dist/` (собирается автоматически)
   - `.vercel/` (локальные настройки Vercel)

2. **Проверьте перед коммитом:**
   ```bash
   git status
   ```

3. **Если нужно отменить изменения:**
   ```bash
   git restore <file>
   ```

## 🚀 Быстрая команда (всё сразу):

```bash
git add .
git commit -m "Update: Supabase integration and bug fixes"
git push origin AmoCrm
```

