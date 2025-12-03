#!/bin/bash

echo "🔍 Проверка DNS для wishmakers.ru"
echo ""

echo "1. Проверка A-записи:"
dig wishmakers.ru A +short
echo ""

echo "2. Проверка CNAME:"
dig wishmakers.ru CNAME +short
echo ""

echo "3. Проверка через Google DNS (8.8.8.8):"
dig @8.8.8.8 wishmakers.ru A +short
echo ""

echo "4. Проверка через Cloudflare DNS (1.1.1.1):"
dig @1.1.1.1 wishmakers.ru A +short
echo ""

echo "5. Проверка доступности HTTPS:"
curl -I https://wishmakers.ru 2>&1 | head -5
echo ""

echo "✅ Ожидаемый IP для Vercel: 76.76.21.21"
echo "✅ Или CNAME: cname.vercel-dns.com"





