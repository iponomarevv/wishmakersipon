# 🔑 Добавление SSH ключа в GitHub

## ✅ SSH ключ создан!

Твой публичный SSH ключ:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAID5lgubyAwKbmgMmdc1IOuFTgLOUBqBAfeIz1T95JX0G ponomarev.mos@gmail.com
```

## 📋 Шаги для добавления ключа в GitHub:

### 1. Скопировать ключ
Ключ уже скопирован выше (или выполни команду):
```bash
cat ~/.ssh/id_ed25519.pub
```

### 2. Добавить ключ в GitHub

1. Зайди на: **https://github.com/settings/keys**
2. Нажми кнопку **"New SSH key"** (зелёная кнопка справа)
3. Заполни форму:
   - **Title:** `MacBook Air` (или любое название)
   - **Key:** Вставь скопированный ключ (весь текст начиная с `ssh-ed25519...`)
4. Нажми **"Add SSH key"**

### 3. Проверить подключение

После добавления ключа проверь:
```bash
ssh -T git@github.com
```

Должно появиться:
```
Hi iponomarevv! You've successfully authenticated, but GitHub does not provide shell access.
```

### 4. Запушить изменения

После успешной проверки:
```bash
git push origin main
```

## 🚀 Быстрая команда (после добавления ключа):

```bash
# Проверить подключение
ssh -T git@github.com

# Запушить изменения
git push origin main
```

## 📝 Если что-то не работает:

1. **Проверить, что ключ добавлен:**
   - https://github.com/settings/keys
   - Должен быть виден твой ключ

2. **Проверить SSH подключение:**
   ```bash
   ssh -T git@github.com
   ```

3. **Если ошибка "Permission denied":**
   - Убедись, что ключ скопирован полностью
   - Проверь, что в GitHub нет лишних пробелов

