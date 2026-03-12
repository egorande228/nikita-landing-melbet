# Hossam MelBet Landing Setup Guide

Этот файл нужен как единый источник правды для нового проекта.
Рабочая папка: `/Users/egorande/Documents/Melbet landing Akram/melbet-landing-separate`
GitHub: `https://github.com/egorande228/hossam-melbet-landing`

## 1. Локальный запуск

```bash
cd "/Users/egorande/Documents/Melbet landing Akram/melbet-landing-separate"
python3 -m http.server 5600
```

Открыть: `http://localhost:5600`

## 2. Деплой в Cloudflare Pages

Рекомендуемые настройки:

- Framework preset: `None`
- Build command: пусто
- Build output directory: `/`
- Production branch: `main`

После деплоя:

1. Добавить домены:
   - основной: `<NEW_DOMAIN>`
   - дополнительный: `www.<NEW_DOMAIN>`
2. Проверить для обоих: `Active` + `SSL enabled`
3. Включить редирект `www -> root` (301).
4. SSL/TLS режим: `Full (strict)`.

## 3. Контакты и лиды

Что заменить перед релизом:

- WhatsApp (`wa.me/...`) в `index.html` и `contact.html`
- Telegram (`t.me/...`) в `index.html` и `contact.html`
- Email в `index.html`
- `data-sheet-endpoint` в `contact.html` (Google Apps Script URL)

Важно:

- `js/contact.js` отправляет лиды в endpoint из `data-sheet-endpoint`
- успех отправки трекается событием GA4 `form_sent`

## 4. Аналитика (GA4)

Сейчас в проекте подключён `gtag.js`.
Перед релизом заменить Measurement ID:

- в `index.html`
- в `contact.html`

События, которые уже отправляются:

- `form_sent` (успешная отправка формы)
- `click_whatsapp`
- `click_telegram`

После запуска в GA4:

1. `Admin -> Events`
2. Найти `form_sent`
3. Включить `Mark as key event`

## 5. SEO и индексирование

В проекте уже есть:

- `robots.txt`
- `sitemap.xml`
- canonical/OG/Twitter/schema в `index.html` и `contact.html`
- favicon в корне: `/favicon.png`

Перед релизом заменить домен на новый в:

- `index.html` (canonical, og:url, schema url)
- `contact.html` (canonical, og:url, schema url)
- `robots.txt` (`Sitemap: https://<NEW_DOMAIN>/sitemap.xml`)
- `sitemap.xml` (все `loc`)

Search Console шаги:

1. Добавить `Доменный ресурс` (`<NEW_DOMAIN>`)
2. Подтвердить DNS TXT через Cloudflare
3. Отправить `sitemap.xml`
4. Запросить индексацию:
   - `https://<NEW_DOMAIN>/`
   - `https://<NEW_DOMAIN>/contact`

## 6. Git workflow

```bash
git status -sb
git add .
git commit -m "your message"
git push origin main
```

Не коммитить мусорные файлы:

- `.DS_Store`

## 7. Быстрый чеклист перед публикацией

- сайт открывается на desktop/mobile;
- форма отправляет лид в нужную таблицу;
- контакты актуальные;
- GA4 Realtime видит `form_sent`, `click_whatsapp`, `click_telegram`;
- `form_sent` отмечен как key event;
- sitemap принят в Search Console;
- URL главной и `/contact` отправлены на индексацию.

