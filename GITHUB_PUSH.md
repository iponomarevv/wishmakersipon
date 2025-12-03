# Как обновить репозиторий на GitHub

## ✅ Готово к push!

Ты сейчас на ветке `main` со всеми изменениями. Теперь нужно запушить на GitHub.

## 🔐 Варианты аутентификации:

### Вариант 1: SSH ключ (рекомендуется)

```bash
# 1. Проверить, есть ли SSH ключ
ls -la ~/.ssh/id_rsa.pub

# 2. Если нет - создать
ssh-keygen -t ed25519 -C "your_email@example.com"
# Нажми Enter для всех вопросов

# 3. Скопировать публичный ключ
cat ~/.ssh/id_rsa.pub
# Скопируй весь вывод

# 4. Добавить ключ в GitHub:
# https://github.com/settings/keys → New SSH key → Вставить ключ

# 5. Изменить remote на SSH
git remote set-url origin git@github.com:iponomarevv/wishmakersipon.git

# 6. Запушить
git push origin main
```

### Вариант 2: GitHub Desktop

1. Открыть GitHub Desktop
2. Выбрать репозиторий
3. Нажать "Push origin"

### Вариант 3: Personal Access Token

```bash
# 1. Создать токен на GitHub:
# Settings → Developer settings → Personal access tokens → Generate new token
# Выбрать scope: repo

# 2. Использовать токен при push
git push https://YOUR_TOKEN@github.com/iponomarevv/wishmakersipon.git main
```

## 🚀 После настройки аутентификации:

```bash
git push origin main
```

## 📋 Что будет запушено:

- ✅ 42 файла с изменениями
- ✅ Supabase интеграция
- ✅ Документация по безопасности
- ✅ GCP миграция setup
- ✅ API endpoints

## 🔄 Если нужно вернуться к AmoCrm:

```bash
git checkout -b AmoCrm
```
