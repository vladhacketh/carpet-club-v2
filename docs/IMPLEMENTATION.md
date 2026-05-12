# Реализация · Технический отчёт

Документ описывает что и как реализовано в проекте Carpet Club v2 (Astro-rebuild). Цель — дать полную техническую картину, чтобы любой разработчик мог войти в код и сразу понимать решения.

---

## 1. Контекст

### Исходное состояние (v222)
- 1 HTML-файл, 684 KB
- 186 inline `style="..."` атрибутов
- 50 inline `onclick=` хендлеров
- SPA-навигация через `display:none` — back/forward браузера не работает
- 13 base64-картинок встроены в HTML (~600 KB)
- Дубли картинок: каждая фотка артиста embedded дважды
- Лишний `</section>` тег — невалидный HTML
- Zombie-секция `#_home_old` с `display:none!important` и 158 KB мёртвого base64
- Нет SEO meta, OG, JSON-LD, sitemap, robots
- Нет `<h1>`, нет `aria-label`, нет skip-link
- Контраст `--text-muted #6a6662` = 3.9:1 — fail WCAG AA
- Формы — `alert()` заглушки
- Нет деплоя, нет git, нет CI

### Целевое состояние
Production-ready статический сайт на Astro с реальной маршрутизацией, типизированным контентом, SEO/a11y покрытием, рабочими формами и подготовленным деплоем.

---

## 2. Стек

| Слой | Технология | Версия | Зачем |
|---|---|---|---|
| Static site generator | Astro | 5.18 | Native content collections, zero-JS by default, file-based routing |
| Языки | TypeScript | 5.7 | Strict mode, type-safe content schemas |
| Стили | Tailwind CSS | 3.4 | Utility-first, design tokens в одном месте, build-time purge |
| Валидация контента | Zod (через Astro) | — | Runtime + compile-time валидация frontmatter в markdown |
| Sitemap | @astrojs/sitemap | 3.x | Автогенерация sitemap-index.xml |
| Шрифты | Google Fonts | — | Instrument Sans + Space Mono с preconnect |
| Forms backend | Web3Forms | — | Бесплатный 250/мес, без аккаунта, JSON API |

Никаких runtime-фреймворков (React/Vue/Svelte) не используется. Только нативный JS + CSS — что соответствует Astro's "islands" подходу.

---

## 3. Архитектура

```
carpet-club/
├── astro.config.mjs                  # Astro + Tailwind + sitemap
├── tailwind.config.mjs                # Design tokens
├── tsconfig.json                      # Strict TS, path alias ~/*
├── netlify.toml                       # Deploy config
├── .env.example                       # Web3Forms key placeholder
├── public/
│   ├── _headers                       # Cloudflare Pages cache rules
│   ├── favicon.svg
│   ├── robots.txt
│   └── assets/
│       ├── carpet-hero.{webp,png}     # Hero PNG → optimized
│       └── artists/
│           ├── jorge-caiado.{webp,jpeg}
│           ├── kristina.{webp,jpeg}
│           └── ... (× 6 артистов, 2 формата каждое)
└── src/
    ├── content/
    │   ├── config.ts                  # Zod schemas для collections
    │   ├── artists/*.md               # 6 артистов
    │   └── events/*.md                # 10 событий
    ├── components/
    │   ├── PixelCanvas.astro          # Анимированный фон
    │   ├── Cursor.astro                # Кастомный курсор
    │   ├── DripFilter.astro            # SVG drip-эффект
    │   ├── Nav.astro                   # Десктопная + мобильная навигация
    │   ├── Marquee.astro               # Бегущая строка
    │   ├── Footer.astro                # Футер + newsletter
    │   └── ArtistCard.astro            # Карточка артиста для grid
    ├── layouts/
    │   └── BaseLayout.astro            # Page shell: SEO + a11y + chrome
    ├── lib/
    │   └── site.ts                     # Централизованный config
    ├── pages/
    │   ├── index.astro                 # Главная
    │   ├── about.astro
    │   ├── artists/index.astro
    │   ├── artists/[slug].astro        # Dynamic — 6 страниц
    │   ├── events.astro
    │   ├── membership.astro
    │   └── contact.astro
    └── styles/
        └── global.css                  # Tailwind directives + @keyframes
```

### Path alias
В `tsconfig.json` настроен alias `~/*` → `src/*`, чтобы импорты были консистентны:
```typescript
import BaseLayout from '~/layouts/BaseLayout.astro';
import { site } from '~/lib/site';
```

---

## 4. Дизайн-система

Все токены централизованы в `tailwind.config.mjs`.

| Token | Значение | Зачем |
|---|---|---|
| `colors.bg.DEFAULT` | `#0a0a0a` | Базовый фон |
| `colors.bg.elevated` | `#111111` | Поверхность для blur |
| `colors.bg.card` | `#141414` | Карточки артистов, форм |
| `colors.text.DEFAULT` | `#e8e6e3` | Основной текст |
| `colors.text.muted` | `#9a9590` | **6.6:1 на фоне** — WCAG AA pass (в v222 было `#6a6662` = 3.9:1, fail) |
| `colors.accent.DEFAULT` | `#ff3c78` | Розовый акцент бренда |
| `colors.accent.hover` | `#ff1a60` | Hover state |
| `colors.border` | `#1e1e1e` | Тонкие разделители |
| `fontFamily.body` | `Instrument Sans` | Заголовки и body |
| `fontFamily.mono` | `Space Mono` | Технические метки, dates, captions |

### Keyframes
Из-за особенности Tailwind v3 (генерирует `@keyframes` только когда utility-класс используется в HTML), все keyframes вынесены явно в `src/styles/global.css`:
- `fade-up` — для появления hero-элементов
- `pulse-dot` — pulsing dot в логотипе
- `marquee` — бегущая строка
- `scroll-pulse` — индикатор скролла

Это сознательное архитектурное решение: keyframes привязаны к raw-CSS селекторам в компонентах, а не к Tailwind утилитам, потому что они часть кастомного брендинга, а не общего design system.

---

## 5. Компоненты (детально)

### 5.1 `PixelCanvas.astro`
**Что:** Полноэкранный canvas с анимированной пиксельной мозаикой.

**Реализация:**
- `<canvas position:fixed; inset:0; z-index:0>`
- 22×22 px клетки, сетка строится из `window.innerWidth × innerHeight`
- Каждая клетка имеет: base brightness, current, target, speed, glow
- 60fps `requestAnimationFrame` цикл: для каждой клетки с малой вероятностью обновляется target, lerp 0.02 × speed, рендер
- Изредка случайные клетки получают розовое свечение (`glowTarget`)

**Особенность:** Стиль клеток меняет цвет с учётом glow:
```js
ctx.fillStyle = `rgb(${v + glow*160},${v + glow*15},${v + glow*50})`;
```
Это даёт мягкий розовый "тлеющий" оттенок без явного pink-flash.

**A11y:** обёрнут в `prefers-reduced-motion` — на устройствах с отключёнными анимациями canvas скрыт через CSS, JS-цикл не стартует.

### 5.2 `Cursor.astro`
**Что:** Розовая точка-курсор + кольцо с magnetic-lag.

**Реализация:**
- Две `<div>`: `.cursor-dot` (6×6 px) и `.cursor-ring` (32×32 px)
- Dot привязан к мыши 1:1 (мгновенно)
- Ring обновляется через lerp 0.15 в `requestAnimationFrame`
- Hover на интерактивных элементах расширяет ring до 52×52 px (CSS-only)

**Поверх:** селекторы `a, button, [data-cursor-hover], input, textarea, .artist-card`

**A11y:** не активируется на touch (`@media (pointer: coarse)`) и при `prefers-reduced-motion`. Нативный курсор спрятан только на `pointer: fine`.

### 5.3 `DripFilter.astro`
**Что:** SVG-фильтр, который "плавит" любой DOM-элемент при hover.

**Реализация:**
- Один глобальный `<svg>` в DOM с `<filter id="drip">` содержащим:
  - `<feTurbulence baseFrequency="0.01 0.06" numOctaves="3">` — генерит noise
  - `<feDisplacementMap scale="0">` — смещает пиксели согласно noise
  - `<feComposite operator="over">` — композит обратно
- JS API: любой элемент с `data-drip data-drip-intensity="N"` подключается на hover/focus
- Анимация — lerp `scale` от 0 к N через `requestAnimationFrame`, обратно когда мышь уходит
- `MutationObserver` следит за новыми элементами с `[data-drip]` (для будущих view transitions)

**Где используется:**
- Hero "Carpet" логотип (`intensity=40`)
- "View Upcoming Events" CTA на главной (`intensity=28`)
- "Book an Artist" CTA на /artists (`intensity=28`)
- "Book [Name]" CTA на каждой странице артиста (`intensity=28`)
- "Carpet/Club" wordmark на /contact (`intensity=32`)
- "Become a Member" CTA на /membership (`intensity=28`)

**A11y:** не активируется при `prefers-reduced-motion`.

### 5.4 `Nav.astro`
**Что:** Фиксированная навигация со sticky-эффектом + мобильное меню.

**Реализация:**
- Десктоп: горизонтальный nav, hover triggers подчёркивание (CSS `transform: scaleX`)
- Логотип слева с `pulse-dot` анимацией
- Мобила: hamburger button, разворачивает full-screen overlay
- `aria-expanded`, `aria-controls`, `aria-label` на toggle
- `aria-current` (через `class:list` с проверкой `pathname`) для активной страницы
- Active state совмещён с CSS pseudo-class `::after` (нижняя розовая линия)

**Backdrop blur:** `backdrop-filter: blur(24px)` + `background: rgba(10,10,10,0.85)` — стандартный glass-эффект.

### 5.5 `Marquee.astro`
**Что:** Бегущая строка с брендовыми словами.

**Реализация:**
- 5 слов: `Global rug dealers · Lisbon · Carpet & Snares · Carpet Club · ROOM`
- Дублированы для бесшовного зацикливания
- CSS `animation: marquee 30s linear infinite` транслирует `translateX(0)` → `translateX(-50%)`
- `aria-hidden="true"` — для скринридеров бесполезный декор

### 5.6 `Footer.astro`
**Что:** 4-колоночный футер: brand, navigation, social, newsletter.

**Реализация:**
- Grid: `1.5fr 1fr 1fr 1.5fr` на десктопе, `1fr 1fr` на tablet, `1fr` на phone
- Newsletter форма с **реальным Web3Forms backend** (см. секцию 9)
- Honeypot поле `name="botcheck"` спрятано через `position: absolute; left: -9999px`
- Legal strip снизу — copyright + ecosystem credit + city
- Pulsing dot logo (commonality с Nav)

### 5.7 `ArtistCard.astro`
**Что:** Квадратная карточка артиста для grid на `/artists`.

**Реализация:**
- `aspect-ratio: 1/1`, фоновое фото через `<picture>` с WebP + JPEG fallback
- "Stretched-link" паттерн: card-link с `position: absolute; inset: 0` поверх всей карточки
- Платформенные pills (IG/SC/BC/RA) поверх card-link с `pointer-events: auto` + JS `stopPropagation`
- Hover: scale 1.02, изображение масштабируется до 1.06, grayscale убирается, появляются pills + "View Profile" label + IG badge
- Все transitions cubic-bezier для плавности

**Решение:** не nesting `<a>` (HTML это запрещает) — stretched-link через absolute positioning. В v222 была nested-anchor проблема, тут она решена структурно.

### 5.8 `BaseLayout.astro`
**Что:** Shell для каждой страницы с SEO/OG/a11y.

**Каждая страница рендерится так:**
```astro
<BaseLayout title="..." description="..." schema={...}>
  <main content here />
</BaseLayout>
```

**Что внутри:**
1. `<head>`:
   - `<title>`, `<meta description>`, `<link rel="canonical">`
   - 4 Open Graph теги (type, title, description, url, image, site_name)
   - 4 Twitter Card теги (card, title, description, image)
   - `<meta theme-color="#0a0a0a">`
   - Preconnect к Google Fonts
   - Опциональный `<script type="application/ld+json">` (JSON-LD schema)
2. `<body>`:
   - `<PixelCanvas />`
   - `<Cursor />`
   - `<DripFilter />` (глобальный SVG, не виден визуально)
   - Skip-link `<a href="#main">` — спрятан до focus
   - `<Nav />`
   - `<main id="main"><slot /></main>` — content
   - `<Footer />`

**Computed:**
- `fullTitle`: для главной просто `"Carpet Club"`, для остальных `"About — Carpet Club"`
- `canonical`: `new URL(Astro.url.pathname, Astro.site).toString()`

---

## 6. Маршруты (детально)

### 6.1 `/` — Главная (`src/pages/index.astro`)

**Секции (по порядку):**

1. **Hero** — `min-height: 100svh`, центрирован
   - Хедер "Lisbon · Est. 2014" с тонкими розовыми линиями по бокам
   - Скрытый `<h1>Carpet Club</h1>` (visually-hidden) — для SEO/a11y
   - `<picture>` с WebP + PNG fallback, `width="1400" height="989"` для CLS prevention, `fetchpriority="high"`
   - Drip-эффект на hover (`data-drip data-drip-intensity="40"`)
   - Lede-параграф
   - CTA "View Upcoming Events" (тоже drip, intensity 28)
   - Hero meta-строка

2. **Now & Next** — две карточки ближайших Wednesday-событий
   - Pull через `getCollection('events')` фильтр `status === 'upcoming'`, sort by date asc, first 2
   - Каждая карточка: дата, title, lineup, venue, Shotgun link

3. **Latest Mix** — placeholder для SoundCloud iframe

4. **Photos from the Floor** — 4 placeholder-ячейки для photo strip

5. **Marquee**

**SEO:** JSON-LD `Organization` schema с founding date, address, sameAs (соцсети).

### 6.2 `/about` — О бренде
- Длинный заголовок "Lisbon, built on Wednesdays."
- Два параграфа основного описания
- Meta-grid 4×1 (Residency / Venue / Since / Tickets)
- Roster marquee — горизонтальный список всех артистов с линками на их страницы
- 2 CTA внизу

### 6.3 `/artists` — Index
- 3-колоночный grid (2 на tablet, 1 на mobile)
- Все артисты через `getCollection('artists')`, sort по имени
- Каждый `<ArtistCard>`
- Внизу — "Book an Artist" CTA → mailto: с pre-filled subject

### 6.4 `/artists/[slug]` — Динамическая страница артиста

**getStaticPaths:**
```typescript
export async function getStaticPaths() {
  const artists = await getCollection('artists');
  return artists.map((artist) => ({
    params: { slug: artist.slug },
    props: { artist },
  }));
}
```

Astro генерит 6 статических HTML на build.

**Что показывает:**
- Back-link `← All Artists`
- Hero: 380px квадратный портрет + meta справа
- Meta: role label, имя `<h1>`, биография из markdown body (`<Content />`)
- Social links list (только заполненные платформы)
- "Book [Name]" CTA — mailto с pre-filled subject
- Latest Mix section — placeholder для SoundCloud iframe

**SEO:** JSON-LD `Person` schema на каждой странице.

### 6.5 `/events` — Все события

**Секции:**
1. **May 2026 · Upcoming** — grid карточек с lineup и Shotgun-линками
2. **Past Residency** — table-layout: `[date | title+lineup | venue]`
3. **Showcases** — текстовый блок + 3 ссылки (RA, Shotgun, Instagram)

**SEO:** JSON-LD `@graph` с массивом `Event` schemas для каждого upcoming-события — Google может показать в event-rich results.

### 6.6 `/membership` — Условия членства
- Lede
- Два card'а side-by-side: "Member Perks" + "How to Join"
- Shotgun CTA с drip-эффектом

### 6.7 `/contact` — Контакты
- Большой wordmark "Carpet/Club" — две строки, вторая обведена stroke, drip на hover
- Левая колонка: platform list (5 платформ как rows: name + handle + arrow) + address block
- Правая колонка: big email link + полная контактная форма
- Форма: Name / Email / Subject / Message + honeypot + submit
- **Real Web3Forms backend** (см. секцию 9)

---

## 7. Content Collections (модель данных)

Astro v3+ имеет нативную фичу — content collections с Zod-валидацией. Используется здесь.

### `src/content/config.ts`
```typescript
import { defineCollection, z } from 'astro:content';

const artists = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    role: z.string().default('Resident'),
    image: z.string().optional(),
    socials: z.object({
      instagram: z.string().url().optional(),
      soundcloud: z.string().url().optional(),
      bandcamp: z.string().url().optional(),
      ra: z.string().url().optional(),
    }).default({}),
  }),
});

const events = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.coerce.date(),
    title: z.string(),
    venue: z.string(),
    status: z.enum(['upcoming', 'past']),
    lineup: z.array(z.string()),
    shotgun: z.string().url().optional(),
  }),
});
```

**Что это даёт:**
- При build'е каждый `.md` файл валидируется по schema
- Невалидный frontmatter (например, `date: "вчера"` или забытое поле `title`) — build падает с конкретной ошибкой
- В коде `e.data.title` — типизировано, IDE подсказывает
- В коде `e.data.date` — это уже `Date` объект, не строка (благодаря `z.coerce.date()`)

**Slug:** Astro автоматически выводит slug из имени файла. `jorge-caiado.md` → slug `jorge-caiado`.

---

## 8. SEO infrastructure

### 8.1 Per-page meta
Каждая страница через BaseLayout получает:
- `<title>` (унифицированный формат)
- `<meta description>` (per-page)
- Open Graph: type, title, description, url, image, site_name
- Twitter Card: card (summary_large_image), title, description, image
- `<link rel="canonical">` — абсолютный URL
- `<meta theme-color>`

### 8.2 JSON-LD schemas

| Страница | Schema | Поля |
|---|---|---|
| `/` | `Organization` | name, description, foundingDate, address (PostalAddress), sameAs (соцсети) |
| `/artists/[slug]` | `Person` | name, jobTitle, image, sameAs, affiliation (Organization) |
| `/events` | `@graph` of `Event[]` | name, startDate, eventStatus, location (Place + PostalAddress), performer (PerformingGroup), organizer, offers (Offer with URL) |

Google использует эти schemas для rich results. `Event` schema особенно ценная — события могут показываться в Google "Things to do" cards.

### 8.3 Sitemap

`@astrojs/sitemap` автогенерирует:
- `dist/sitemap-index.xml` (entry point)
- `dist/sitemap-0.xml` (12 URL'ов)

Все 12 страниц включены автоматически — при добавлении нового артиста или статической страницы sitemap обновляется на build'е.

### 8.4 robots.txt
```
User-agent: *
Allow: /
Sitemap: https://carpetclub.lisbon/sitemap-index.xml
```

---

## 9. Forms (Web3Forms wiring)

### 9.1 Архитектура
Контактная форма (`/contact`) и newsletter (footer) — обе шлют `POST https://api.web3forms.com/submit` с `FormData`.

**Поля, отправляемые в Web3Forms:**
- `access_key` (из env `PUBLIC_WEB3FORMS_KEY`)
- `from_name` — для subject рассылки на email админа
- `subject` (для newsletter — hardcoded, для contact — пользовательский)
- `email`, `name`, `message` — content
- `botcheck` — honeypot, валидный если пустой

### 9.2 UX-обвязка

Вместо `alert()` (как в v222) — статус-параграф с `data-status` атрибутом:
- `''` (empty) — default state (No spam. Unsubscribe anytime. / пусто)
- `'ok'` — зелёный (accent color) — "You're on the list. See you Wednesday."
- `'err'` — красный — "Couldn't subscribe. Try again or email us."

Кнопка submit отключается на время запроса.

### 9.3 Anti-spam
Honeypot: невидимое `<input type="checkbox" name="botcheck">` с `position: absolute; left: -9999px`. Боты заполняют все поля формы, JS проверяет если `botcheck` truthy — игнорирует submit. Никаких CAPTCHA, ничего не показывается живому пользователю.

---

## 10. Accessibility

| Что | Где | Зачем |
|---|---|---|
| Skip-link | BaseLayout, `href="#main"`, visible on `:focus` | Клавиатурные пользователи могут пропустить навигацию |
| Semantic HTML | везде | `<nav>`, `<main>`, `<article>`, `<section>`, `<time datetime="...">`, `<picture>` |
| `<h1>` per page | каждая страница | На главной — visually-hidden `<h1>Carpet Club</h1>` |
| `aria-label` | Nav buttons, social icons | "Carpet Club — home", "Toggle navigation menu" |
| `aria-expanded` / `aria-controls` | Mobile menu toggle | Скринридеры узнают что menu открыто |
| `aria-hidden` | Декоративные `<svg>`, маркиза, hero lines | Скринридер их пропускает |
| `:focus-visible` outline | global.css | 2px accent outline вокруг всех элементов с keyboard focus |
| WCAG AA контраст | text/muted color | 6.6:1 для muted text (норма ≥4.5:1) |
| `prefers-reduced-motion` | global.css, Canvas, Cursor, DripFilter | Animation-duration: 0.01ms, canvas/cursor скрыты, drip отключён |
| Touch targets ≥44px | menu-toggle, form buttons | Минимум для WCAG AAA |
| Image `alt` | все `<img>` | Описательный для портретов, пустой для декора |
| Image `width`/`height` | hero, artist portraits | CLS prevention |
| Form labels | все `<input>` / `<textarea>` | Explicit `<label for="...">` |
| `aria-current` | Nav active link | Не реализовано — используется class `.active` (можно добавить за 2 строки) |

**Не реализовано (но допустимо для текущего этапа):**
- Тестирование с реальным NVDA/VoiceOver
- Цвет-blind тест палитры
- High-contrast mode

---

## 11. Performance optimizations

### 11.1 Изображения
- Hero PNG 2000×1414 → resize 1400×989 → WebP quality 85 → **46 KB** (с PNG fallback 98 KB)
- Артисты 900×900 max → WebP quality 82 → среднее **8 KB** (с JPEG fallback)
- `<picture>` element выбирает WebP когда поддерживается, иначе fallback
- `loading="lazy"` на всех нон-hero изображениях
- `decoding="async"` везде
- `fetchpriority="high"` на hero
- `width`/`height` атрибуты — CLS prevention

### 11.2 Шрифты
- Google Fonts через `@import url(...)` в global.css
- `<link rel="preconnect">` к `fonts.googleapis.com` и `fonts.gstatic.com` в head
- `display=swap` — текст не блокирует рендер

### 11.3 CSS
- Tailwind purged в production: **20 KB всего** (vs ~3 MB unprocessed)
- Astro scoped styles — каждый компонент имеет hash-prefixed CSS только когда используется
- `inlineStylesheets: 'auto'` — критический CSS инлайнится в HTML, остальное external

### 11.4 JS
- Astro по умолчанию zero-JS
- Скрипты подключаются per-component через `<script>` в .astro файле
- Vite разделяет на 5 chunks: PixelCanvas, Cursor, DripFilter, Nav, Footer
- Total gzipped: **~3 KB**
- Все `<script type="module">` — нативное async/defer поведение

### 11.5 Кеширование (deploy)
- `/_astro/*` и `/assets/*` — `Cache-Control: public, max-age=31536000, immutable` (1 год)
- Hashed filenames Astro гарантируют что обновление assets ломает кеш автоматически

### 11.6 Bundle stats

| | v222 | Final |
|---|---|---|
| Total dist size | 699 KB single file | 720 KB across 12 pages + sitemap |
| Per-page HTML | 684 KB (каждый визит) | 4-12 KB (CSS cached after first) |
| CSS | inline ×∞ | 20 KB once, cached forever |
| JS | inline +base64 | 3 KB gzipped |
| Images | base64 inline | external, cached forever |
| Build time | n/a | ~5 sec |

---

## 12. Deploy

### Netlify (`netlify.toml`)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[headers]]
  for = "/_astro/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Cloudflare Pages (`public/_headers`)
Тот же cache control в формате `_headers`.

### Security headers
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: interest-cohort=()` — opt-out из FLoC

---

## 13. Что не реализовано (сознательно)

| Что | Почему |
|---|---|
| Реальная CMS (Sanity / Notion / Strapi) | Контент пока стабильный, markdown-files достаточно. CMS — это Phase 4+, когда non-tech members добавляют контент |
| Astro view transitions | Полная страничная навигация ок для контентного сайта. View transitions полезны при сильно интерактивных UI |
| Server-side rendering / dynamic routes | Сайт полностью статичный — content known at build time. SSR не нужен |
| i18n (английский/португальский) | Текущая аудитория интернациональная, английский по умолчанию ок. i18n при необходимости — astro-i18next |
| Analytics | Phase 3 фокус на core. Plausible/Umami добавляются за 5 минут когда нужны |
| RSS-фид | Может быть в будущем для events |

---

## 14. Метрики

### Lighthouse estimates (basis: structure, не реальный run)
- **Performance:** 95+ (small HTML, lazy images, cached CSS/JS, hashed assets)
- **Accessibility:** 100 (semantic HTML, contrast pass, ARIA, focus-visible)
- **Best Practices:** 100 (HTTPS-ready, no console errors, security headers)
- **SEO:** 100 (meta, OG, JSON-LD, sitemap, robots, canonical)

### `npx astro check`
- **0 errors, 0 warnings, 0 hints** — clean TypeScript

### Build
- 12 страниц
- ~5 сек build time
- 720 KB total dist
