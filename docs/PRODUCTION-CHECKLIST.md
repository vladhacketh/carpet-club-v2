# Production Checklist · Что нужно сделать до запуска

> Historical launch checklist. The site is now deployed at https://www.carpetclub.pt on Vercel; verify current production needs against `AGENTS.md` and the code before following these steps.

Документ покрывает что осталось сделать руками, чтобы сайт работал в продакшне с настоящим доменом и реальным контентом. Каждый пункт — действие за 5-30 минут.

Структура:
- **Required** — без этого сайт не работает
- **Recommended** — для качества и доверия
- **Nice-to-have** — улучшения после запуска

---

## REQUIRED (без этого нельзя в прод)

### 1. Зарегистрироваться на Web3Forms и получить access key
**Время:** 2 минуты
**Стоимость:** 0 ₽ (250 сообщений/месяц free tier)

1. Открыть https://web3forms.com/
2. Ввести email владельца (тот, на который будут приходить сообщения с форм) — `kristina.carpetevents@gmail.com`
3. На почту придёт письмо с **access key** — длинная UUID-строка
4. Сохранить ключ

**Что произойдёт без этого:** Форма на `/contact` и newsletter в футере покажут ошибку "Form not configured yet". Кнопки видны, но submit не работает.

---

### 2. Настроить переменную окружения `PUBLIC_WEB3FORMS_KEY`

**Локально (для разработки):**
```bash
cd carpet-club
cp .env.example .env
# открыть .env, заменить your-access-key-here на реальный ключ
npm run dev
```

**На Netlify:**
1. Site settings → Environment variables → Add a variable
2. Key: `PUBLIC_WEB3FORMS_KEY`
3. Value: твой ключ из шага 1
4. Save
5. Trigger deploy → Deploy site (без этого env var не подхватится)

**На Cloudflare Pages:**
1. Settings → Environment variables
2. Production: добавить `PUBLIC_WEB3FORMS_KEY`
3. Preview: добавить туда же (или оставить пустым если не нужен превью deploy)
4. Save → следующий deploy подхватит

**Verify:** Открыть сайт, заполнить контактную форму, нажать Send. На email должно прийти письмо с темой "Carpet Club — Contact form" и содержимым формы.

---

### 3. Купить настоящий домен
**Время:** 5 минут
**Стоимость:** ~$10-15/год (для `.com`, `.club`), ~$30+ для премиум (.lisbon)

**Рекомендуемые регистраторы:**
- **Cloudflare Registrar** (https://www.cloudflare.com/products/registrar/) — продаёт по wholesale цене, без накруток
- **Porkbun** (https://porkbun.com/) — честные цены, бесплатный WHOIS privacy
- **Namecheap** (https://namecheap.com/) — старый известный, чуть дороже

**Варианты:**
- `carpetclub.com` — классика, если свободен
- `carpetclub.events` — тематический TLD
- `carpet.club` — короткий
- `carpetclub.pt` — португальский
- `carpetclub.lisbon` — премиум (~$50+/год, опционально)

**Что НЕ делать:**
- Не покупать у GoDaddy — у них самые дорогие продления и агрессивный апселл
- Не покупать на 10 лет вперёд — текущая цена не зафиксирует следующее продление
- Не игнорировать "domain privacy" — обязательно включить (на Cloudflare/Porkbun это бесплатно)

---

### 4. Обновить URL домена в коде

После покупки в **двух файлах** заменить `https://carpetclub.lisbon` на свой:

**`astro.config.mjs`:**
```javascript
export default defineConfig({
  site: 'https://carpetclub.com',  // ← сюда
  ...
});
```

**`src/lib/site.ts`:**
```typescript
export const site = {
  url: 'https://carpetclub.com',  // ← и сюда
  ...
};
```

Без этого: canonical URL, OG image URL, JSON-LD schemas и sitemap будут содержать placeholder-домен.

---

### 5. Подключить домен к hosting

**Netlify:**
1. Site settings → Domain management → Add custom domain
2. Ввести `carpetclub.com`
3. Netlify покажет DNS records для добавления:
   - `A` record: `75.2.60.5` (или CNAME на `apex-loadbalancer.netlify.com`)
   - `CNAME` для `www`: `carpetclub.com.netlify.app`
4. В Cloudflare/Porkbun DNS dashboard: добавить эти records
5. Дождаться SSL certificate (5-15 минут — автоматически через Let's Encrypt)

**Cloudflare Pages (если домен на Cloudflare):**
1. Pages → Custom domains → Add domain
2. Cloudflare сам пропишет DNS records — занимает 2 минуты

**Verify:** через 5-15 минут открыть `https://carpetclub.com` — должно загрузиться с зелёным замком (SSL).

---

### 6. Развернуть собранный билд

**Способ 1 — Netlify Drop (быстрый, без git):**
1. `npm run build` локально
2. https://app.netlify.com/drop
3. Перетащить папку `dist/` на страницу
4. Получить URL `*.netlify.app`
5. Залогиниться → Claim site (чтобы URL остался постоянным)
6. Добавить env var (см. шаг 2)
7. Подключить domain (см. шаг 5)

**Способ 2 — Git + auto-deploy (правильный для долгосрочной работы):**
1. Создать GitHub repo (private)
2. Push весь проект
3. Netlify → "New site from Git" → выбрать repo
4. Build settings auto-detected из `netlify.toml`
5. Env vars добавить вручную
6. Custom domain подключить

После этого процесс обновлений:
```bash
# поправил контент
git add .
git commit -m "Add June event lineup"
git push
# через 1-2 минуты сайт обновлён автоматически
```

---

## RECOMMENDED (для качества)

### 7. Верифицировать Shotgun URL'ы существующих событий
**Время:** 5 минут

Текущие 4 URL'а в `src/content/events/*.md` для May 2026 — best-guess slugs, не верифицированы. Открыть каждую в браузере:

- `2026-05-06`: https://shotgun.live/en/events/tini-presents-the-gang-momo-trosman/tickets
- `2026-05-13`: https://shotgun.live/en/events/carpet-club-pedro-goya-nebulaee/tickets
- `2026-05-20`: https://shotgun.live/en/events/rhythm-by-nature-tripmastaz-sapu/tickets
- `2026-05-27`: https://shotgun.live/en/events/carpet-friends-kaesar-kristina/tickets

Если 404 — открыть реальный event на shotgun.live, скопировать URL, обновить `shotgun: "..."` в frontmatter.

---

### 8. Заменить generic-биографии артистов на реальный текст
**Время:** 30 минут (~5 минут на каждого)

Сейчас все 6 артистов имеют один и тот же placeholder:
> "X is part of the Carpet & Snares residency family. For booking inquiries and detailed bio, please reach out via the contact page."

Заменить в каждом файле `src/content/artists/<slug>.md` под frontmatter:
- 2-4 параграфа реальной биографии
- Можно с **жирным**, *курсивом*, [ссылками](url)
- Поддерживается полный markdown

Без этого: страницы артистов работают, но контент слабый — не даёт SEO-сигналов, нет повода Google показывать сайт в рейтинге.

---

### 9. Добавить SoundCloud embeds в Mix slots

**На главной (`src/pages/index.astro`):**

Найти `<div class="mix-placeholder">` и заменить на:
```html
<iframe
  width="100%"
  height="166"
  scrolling="no"
  frameborder="no"
  src="https://w.soundcloud.com/player/?url=URL_ENCODED_TRACK&color=%23ff3c78&inverse=false&auto_play=false"
  loading="lazy"
  title="Latest Carpet Club mix">
</iframe>
```

Где взять URL: SoundCloud → нужный трек → Share → Embed → копировать iframe целиком, оттуда взять только `src`.

**На страницах артистов (`src/pages/artists/[slug].astro`):**

Текущий placeholder показывает "SoundCloud embed slot. Paste a track URL..." — заменить на per-artist iframe, или добавить поле `latestMix:` в schema и привязать к frontmatter.

---

### 10. Подложить реальные фото в Photo Strip
**Время:** 15 минут

Сейчас 4 ячейки на главной показывают "Photo 1, Photo 2..." placeholder'ы.

1. Подготовить 4 фото с прошлых ивентов:
   - Квадратные (или близкие к квадрату), любая высокая разрешка
   - Конвертировать в WebP через https://squoosh.app/ (~80-150 KB каждое)
   - Сохранить как `01.webp`, `02.webp`, `03.webp`, `04.webp`
2. Положить в `public/assets/photos/`
3. В `src/pages/index.astro` найти `<div class="photo-strip">`. Заменить на:
```astro
<div class="photo-strip">
  <img src="/assets/photos/01.webp" alt="Wednesday night at Rūmu — January 2026" loading="lazy" />
  <img src="/assets/photos/02.webp" alt="Carpet & Friends" loading="lazy" />
  <img src="/assets/photos/03.webp" alt="Late night dancefloor" loading="lazy" />
  <img src="/assets/photos/04.webp" alt="DJ booth view" loading="lazy" />
</div>
```

`alt` тексты важны для SEO (Google Images индекс) и accessibility.

---

### 11. Создать OG image (1200×630)
**Время:** 10 минут

Сейчас в `BaseLayout.astro` дефолтный путь `/og-default.png` — файл не существует. В соцсетях когда кто-то делится ссылкой на сайт, превью будет пустое.

1. Создать в Figma/Canva изображение 1200×630 px:
   - Тёмный фон (#0a0a0a)
   - "Carpet Club" большим шрифтом + accent #ff3c78
   - Под ним: "Lisbon · Wednesday Residency · Rūmu"
   - Бренд marks для распознаваемости
2. Экспортировать как `og-default.png`
3. Положить в `public/og-default.png`

**Verify:** https://www.opengraph.xyz/ — вставить свой URL, проверить превью.

---

### 12. Custom 404 page
**Время:** 15 минут

Создать `src/pages/404.astro`:
```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
---
<BaseLayout title="Not Found">
  <section style="min-height: 100svh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 24px;">
    <div>
      <p style="font-family: var(--font-mono); color: var(--accent); letter-spacing: 5px; margin-bottom: 16px;">404</p>
      <h1 style="font-size: clamp(48px, 8vw, 96px); margin-bottom: 24px;">Lost on the dancefloor</h1>
      <a href="/" class="hero-cta">← Back to home</a>
    </div>
  </section>
</BaseLayout>
```

Astro автоматически возьмёт `404.astro` как fallback для несуществующих URL.

---

### 13. Подключить аналитику
**Время:** 10 минут

**Plausible** (рекомендую) — privacy-friendly, без cookie-баннера, $9/мес или self-hosted free:
1. Sign up на https://plausible.io/
2. Add site → ввести домен
3. Скопировать `<script>` тег
4. Вставить в `src/layouts/BaseLayout.astro` перед `</head>`

**Cloudflare Web Analytics** (free, native если домен на CF):
1. Cloudflare dashboard → Analytics → Web Analytics
2. Add site → копировать beacon snippet

**Не рекомендую Google Analytics** — требует cookie-баннер (GDPR), грузит ~50 KB JS, тяжёлый.

---

## NICE-TO-HAVE (улучшения после запуска)

### 14. Newsletter миграция на Mailchimp/Buttondown
Когда подписчиков набирается **50-100+** — Web3Forms неудобен (нет групповой рассылки). Мигрировать на:
- **Buttondown** ($9/мес после 100 подписчиков, очень чистый UX)
- **Mailchimp** (free до 500 подписчиков, но интерфейс монструозный)
- **Beehiiv** (free до 2500, новый, для медиа-брендов)

В коде заменить `https://api.web3forms.com/submit` на endpoint провайдера.

---

### 15. CMS интеграция (Sanity/Notion)

Когда контент начнёт обновлять non-developer person — миграция на CMS:
- **Sanity** (https://sanity.io/) — free до 10 users, GROQ queries, real-time
- **Notion as CMS** через Astro integration — если уже работаешь в Notion
- **Decap CMS** (бывший Netlify CMS) — git-based, бесплатный, но грубый UI

Astro имеет официальные интеграции — миграция занимает 1-2 дня.

---

### 16. Mailing list / RSS-feed для событий

Создать `src/pages/rss.xml.ts` — отдаёт RSS со всеми upcoming events. Подписчики добавляют в Feedly/Inoreader.

Astro имеет `@astrojs/rss` integration — 20 строк кода.

---

### 17. Booking page с реальной формой
Сейчас "Book an Artist" → mailto:. Альтернатива: страница `/book` с подробной формой (artist dropdown, date picker, venue type, budget range) → отправка через Web3Forms.

---

### 18. Multi-language (English / Portuguese)

Если португальская аудитория важна:
- `astro-i18next` integration
- Контент в `src/content/artists/<slug>.{en,pt}.md`
- Language switcher в Nav

---

### 19. Performance audit и оптимизация

После запуска прогнать **реальный** Lighthouse:
```bash
npx @lhci/cli autorun --collect.url=https://carpetclub.com
```

Метрики, на которые смотреть:
- LCP (Largest Contentful Paint) — должно быть <2.5s
- CLS (Cumulative Layout Shift) — <0.1
- FID/INP (interaction delay) — <100ms

Если LCP плохой — hero image слишком тяжёлая, конвертировать в AVIF (`Pillow → AVIF` или `avifenc`).

---

### 20. Дополнительная anti-spam защита

Если honeypot пропускает спам:
- Cloudflare Turnstile (CAPTCHA замена, невидимая) — Web3Forms поддерживает
- hCaptcha — то же
- Rate limiting на Cloudflare уровне

---

## Pre-deploy checklist

Перед каждым деплоем в прод:

```bash
# 1. Type-check
npx astro check
# Должно быть: 0 errors, 0 warnings, 0 hints

# 2. Production build
npm run build
# Должно: 12 page(s) built, без warnings

# 3. Preview локально
npm run preview
# Открыть http://localhost:4321, кликнуть везде

# 4. Verify (вручную):
# - Все nav-ссылки ведут на правильные страницы
# - Browser back/forward работает
# - Hero "Carpet" логотип плавится на hover
# - Все 6 артистов open'аются по /artists/<slug>
# - Past Residency table показывает прошедшие события
# - Mobile menu открывается-закрывается
# - Контактная форма submit'ит (после конфигурации Web3Forms)
# - Footer newsletter submit'ит

# 5. SEO checks
# - View source на любой странице — есть <meta description>, OG, canonical, JSON-LD
# - /sitemap-index.xml открывается и содержит 12 URL'ов
# - /robots.txt открывается

# 6. Lighthouse
# Chrome DevTools → Lighthouse → Analyze
# Target: 90+ во всех 4 категориях
```

---

## Post-deploy verification

После каждого деплоя в прод:

1. Открыть основные страницы — `/`, `/events`, `/artists`, `/contact`
2. Submit'нуть контактную форму — пришло ли письмо
3. Submit'нуть newsletter из футера — пришло ли письмо
4. Открыть https://www.google.com/search?q=site:carpetclub.com — Google индексирует?
5. https://search.google.com/test/rich-results — JSON-LD валидный?
6. https://www.opengraph.xyz/ — OG превью выглядит как должно
7. https://www.ssllabs.com/ssltest/ — SSL A или A+
8. Lighthouse на главной — 90+

---

## Roadmap summary

| Приоритет | Что | Время | Готово к запуску? |
|---|---|---|---|
| 🔴 Required #1 | Web3Forms ключ | 2 мин | Без этого формы не работают |
| 🔴 Required #2 | Env var в hosting | 1 мин | — |
| 🔴 Required #3 | Купить домен | 5 мин | — |
| 🔴 Required #4 | Обновить URL в коде | 1 мин | — |
| 🔴 Required #5 | Подключить домен к hosting | 5 мин | — |
| 🔴 Required #6 | Deploy build | 5 мин | После этого сайт виден всему миру |
| 🟡 Recommended #7 | Verify Shotgun URLs | 5 мин | Сайт работает без этого, но события могут 404 |
| 🟡 Recommended #8 | Реальные био артистов | 30 мин | Влияет на SEO |
| 🟡 Recommended #9 | SoundCloud iframes | 10-30 мин | Контент-driven |
| 🟡 Recommended #10 | Фото в Photo Strip | 15 мин | Визуал главной |
| 🟡 Recommended #11 | OG image | 10 мин | Шеринг в соцсетях |
| 🟡 Recommended #12 | 404 page | 15 мин | UX когда юзер ошибся URL |
| 🟡 Recommended #13 | Аналитика | 10 мин | Метрики аудитории |
| 🟢 Nice-to-have #14-20 | После запуска | Часы-дни | — |

**Минимум для запуска: ~20 минут работы.** (#1-6)

**Хороший production-grade сайт: ~3 часа работы.** (#1-13)
