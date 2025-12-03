# Диагностика проблем с доступностью домена

## Проблема: Приложение не открывается на десктопе без VPN

### Возможные причины:

1. **DNS не настроен правильно**
2. **Домен не подключен к Vercel**
3. **Провайдер блокирует домен**
4. **Проблемы с SSL сертификатом**

## Решение:

### 1. Проверь настройки DNS в Vercel

1. Зайди в https://vercel.com/dashboard
2. Выбери проект `wishmakersipon`
3. Перейди в **Settings** → **Domains**
4. Убедись, что домен `wishmakers.ru` добавлен
5. Проверь DNS записи, которые нужно добавить у регистратора домена

### 2. Настрой DNS записи у регистратора домена

⚠️ **ВАЖНО:** Если у тебя уже есть A-запись для корневого домена, её нужно сначала УДАЛИТЬ, иначе CNAME не добавится!

**Шаг 1: Удали старые записи**
- Найди и удали все A-записи для `@` (корневого домена)
- Подожди 5-10 минут после удаления

**Шаг 2: Добавь новую запись**

**Вариант A (CNAME - предпочтительно, если регистратор поддерживает):**
```
Type: CNAME
Name: @ (или оставь пустым)
Value: cname.vercel-dns.com.
TTL: 3600
```

**Вариант B (A-запись, если CNAME не поддерживается для корневого домена):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

Или несколько A-записей для балансировки:
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600

Type: A
Name: @
Value: 76.76.21.98
TTL: 3600

Type: A
Name: @
Value: 66.33.60.67
TTL: 3600
```

**Для поддоменов (www):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com.
TTL: 3600
```

### 3. Если регистратор не поддерживает CNAME для корневого домена

Используй поддомен (например, `app.wishmakers.ru`):

1. **Добавь CNAME для поддомена:**
   ```
   Type: CNAME
   Name: app
   Value: cname.vercel-dns.com.
   TTL: 3600
   ```

2. **В Vercel:**
   - Settings → Domains
   - Добавь домен `app.wishmakers.ru`

3. **В BotFather:**
   - Укажи домен `app.wishmakers.ru` вместо `wishmakers.ru`

### 4. Проверь DNS записи

Выполни в терминале:
```bash
# Проверь A-запись
dig wishmakers.ru A

# Проверь CNAME
dig wishmakers.ru CNAME

# Проверь с разных DNS серверов
dig @8.8.8.8 wishmakers.ru A
dig @1.1.1.1 wishmakers.ru A
```

### 5. Проверь доступность домена

```bash
# Проверь доступность
curl -I https://wishmakers.ru

# Проверь SSL сертификат
openssl s_client -connect wishmakers.ru:443 -servername wishmakers.ru
```

### 6. Если домен заблокирован провайдером

Если домен заблокирован на уровне провайдера (Роскомнадзор и т.д.):

1. **Используй альтернативный домен:**
   - Добавь домен через Vercel (например, `wishmakers.app` или другой)
   - Настрой его в BotFather

2. **Используй Cloudflare:**
   - Перенеси DNS на Cloudflare
   - Включи Cloudflare Proxy (может помочь обойти блокировки)

3. **Используй поддомен:**
   - Создай поддомен (например, `app.wishmakers.ru`)
   - Настрой его в Vercel

### 7. Проверь настройки в BotFather

1. Открой [@BotFather](https://t.me/BotFather)
2. Выбери `/mybots` → `@Wishmakers_bot`
3. Проверь **Bot Settings** → **Domain**
4. Убедись, что указан правильный домен: `wishmakers.ru`

### 8. Альтернативное решение - используй Vercel домен

Если домен не работает, можно временно использовать Vercel домен:

1. В Vercel Dashboard → Settings → Domains
2. Скопируй автоматический домен (например, `wishmakersipon.vercel.app`)
3. Настрой его в BotFather как временное решение

## Быстрая проверка:

1. Открой https://wishmakers.ru в браузере
2. Если не открывается - проверь DNS
3. Если открывается, но показывает ошибку - проверь консоль браузера (F12)
4. Если открывается в мобильном, но не в десктопе - возможно проблема с кэшем браузера

## Команды для диагностики:

```bash
# Проверь DNS
nslookup wishmakers.ru
dig wishmakers.ru

# Проверь доступность
ping wishmakers.ru
curl -I https://wishmakers.ru

# Проверь SSL
openssl s_client -connect wishmakers.ru:443
```

