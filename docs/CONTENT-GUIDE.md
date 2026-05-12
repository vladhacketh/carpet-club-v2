# Content Guide · Гайдлайны по наполнению контентом

Документ для человека, который будет регулярно обновлять сайт — добавлять события, артистов, фото. Программирования здесь нет, только редактирование текстовых файлов.

---

## 1. Что где лежит

```
carpet-club/
├── src/content/         ← ВЕСЬ ТЕКСТОВЫЙ КОНТЕНТ
│   ├── artists/         ← один файл на одного артиста
│   └── events/          ← один файл на одно событие
│
├── public/assets/       ← ВСЕ ИЗОБРАЖЕНИЯ
│   ├── artists/         ← фото артистов
│   ├── photos/          ← фото для главной (Photo Strip)
│   ├── carpet-hero.png  ← главный логотип
│   └── carpet-hero.webp
│
└── src/lib/site.ts      ← email, соцсети, адрес — глобальные настройки
```

**Главное правило:** трогай только `src/content/`, `public/assets/`, `src/lib/site.ts`. Всё остальное — компоненты, стили, layouts — это код, не контент.

---

## 2. Frontmatter Reference

"Frontmatter" — это YAML-блок в начале markdown-файла между `---` и `---`. Это структурированные данные о записи.

### 2.1 Артисты — поля frontmatter

Файл: `src/content/artists/<slug>.md`

| Поле | Обязательное | Тип | Описание | Пример |
|---|---|---|---|---|
| `name` | ✅ | строка | Имя как будет показано на сайте | `"Jorge Caiado"` |
| `role` | — | строка | Резидент, Гость, и т.д. По умолчанию "Resident" | `"Resident"` или `"Guest"` |
| `image` | — | строка | Путь к фото от корня `public/`. Без — карточка будет с пустым местом | `"/assets/artists/jorge-caiado.jpeg"` |
| `socials.instagram` | — | URL | Ссылка на Instagram (полная) | `"https://www.instagram.com/jcaiado/"` |
| `socials.soundcloud` | — | URL | Ссылка на SoundCloud | `"https://soundcloud.com/jcaiado"` |
| `socials.bandcamp` | — | URL | Ссылка на Bandcamp | `"https://carpetandsnaresrecords.bandcamp.com"` |
| `socials.ra` | — | URL | Ссылка на Resident Advisor profile | `"https://ra.co/dj/jorgecaiado"` |

**Полный пример:**
```markdown
---
name: "Jorge Caiado"
role: "Resident"
image: "/assets/artists/jorge-caiado.jpeg"
socials:
  instagram: "https://www.instagram.com/jcaiado/"
  soundcloud: "https://soundcloud.com/jcaiado"
  ra: "https://ra.co/dj/jorgecaiado"
---

Jorge Caiado has been a fixture of the Lisbon scene since the early 2000s,
shaping the sound of Carpet & Snares from day one.

His sets weave deep house, classics, and contemporary cuts — always
unpredictable, always rooted in dancefloor tradition.

Catch him resident every other Wednesday at Rūmu.
```

**Имя файла = slug в URL.** `jorge-caiado.md` → страница `/artists/jorge-caiado`.

Slug правила:
- Только латиница, цифры, дефис
- Lowercase
- Без пробелов, точек, специальных символов

---

### 2.2 События — поля frontmatter

Файл: `src/content/events/<YYYY-MM-DD-slug>.md`

| Поле | Обязательное | Тип | Описание | Пример |
|---|---|---|---|---|
| `date` | ✅ | дата | Формат `YYYY-MM-DD` БЕЗ кавычек | `2026-06-03` |
| `title` | ✅ | строка | Название события | `"Carpet Club presents Jane Fitz"` |
| `venue` | ✅ | строка | Площадка | `"Rūmu"` |
| `status` | ✅ | enum | `"upcoming"` или `"past"` | `"upcoming"` |
| `lineup` | ✅ | список | Массив исполнителей | См. ниже |
| `shotgun` | — | URL | Ссылка на тикеты | `"https://shotgun.live/en/events/jane-fitz/tickets"` |

**lineup** — это список, каждый элемент с дефиса и кавычек:
```yaml
lineup:
  - "Jane Fitz"
  - "Kristina"
  - "Bernardo Vaz"
```

**Полный пример:**
```markdown
---
date: 2026-06-03
title: "Carpet Club presents Jane Fitz"
venue: "Rūmu"
status: "upcoming"
lineup:
  - "Jane Fitz"
  - "Kristina"
shotgun: "https://shotgun.live/en/events/carpet-club-jane-fitz/tickets"
---
```

**Имя файла:**
- Префикс с датой: `2026-06-03-...`
- Slug после: `carpet-club-jane-fitz`
- Расширение `.md`
- **Итого:** `2026-06-03-carpet-club-jane-fitz.md`

---

## 3. Сценарии

### Сценарий A: Добавить новое событие

**Когда:** новая среда в Room, новый showcase, специальное событие.

**Шаги:**

1. Открыть `src/content/events/` в VS Code
2. **File → New File** (или правый клик в Explorer → New File)
3. Имя: `YYYY-MM-DD-короткое-имя.md`
4. Содержимое — скопировать из примера выше, заменить значения
5. Сохранить (Ctrl+S или Cmd+S)

**Verify:** Если запущен `npm run dev` — событие появится автоматически на `/events`.

**Если событие в будущем без подтверждённого lineup:**
```yaml
lineup:
  - "Lineup TBA"
```

**Если ещё нет ссылки на Shotgun:** просто не добавлять поле `shotgun:` — кнопка "Tickets" не появится, но событие будет видно.

---

### Сценарий B: Перевести событие из upcoming в past

**Когда:** событие прошло, нужно перенести в архив.

**Шаги:**

1. Открыть файл события в `src/content/events/`
2. Найти строку `status: "upcoming"`
3. Заменить на `status: "past"`
4. Сохранить

**Результат:** событие исчезает из верхнего блока на `/events`, появляется в "Past Residency" таблице ниже. Также пропадает из "Now & Next" на главной.

**Можно ли удалять старые события?** Можно, но лучше оставлять — past residency формирует историю бренда (важно для SEO и доверия).

---

### Сценарий C: Добавить нового артиста

**Когда:** новый резидент или гость на сезон.

**Шаги:**

#### 1. Подготовка фото

- Найти квадратное или близкое к квадратному фото артиста
- Размер: 900×900 px минимум, можно больше (всё равно ресайзнется)
- Лицо в верхней трети композиции (карточка кропится с object-position: center 30%)
- Без подписей, водяных знаков, дат

#### 2. Конвертировать в WebP

Открыть https://squoosh.app/ → drag-drop фото → справа выбрать WebP → quality 80-85 → Download.

Также сохранить JPEG как fallback (~quality 80).

#### 3. Положить в проект

Файлы:
- `public/assets/artists/<slug>.webp` (основной)
- `public/assets/artists/<slug>.jpeg` (fallback)

Где `<slug>` — латинскими буквами, без пробелов: `dj-example`.

#### 4. Создать markdown файл

`src/content/artists/<slug>.md`:

```markdown
---
name: "DJ Example"
role: "Guest"
image: "/assets/artists/dj-example.jpeg"
socials:
  instagram: "https://instagram.com/djexample/"
  soundcloud: "https://soundcloud.com/djexample"
---

Bio paragraph 1 — кто такой, откуда, что играет.

Bio paragraph 2 — relevant achievements / labels / residencies.
```

#### 5. Verify

Открыть `/artists` — новая карточка появится в гриде (порядок по алфавиту имени).

Открыть `/artists/dj-example` — личная страница работает.

---

### Сценарий D: Обновить биографию артиста

**Когда:** новая info, обновлённый бэкграунд, hot takes.

**Шаги:**

1. Открыть `src/content/artists/<slug>.md`
2. Скроллить ниже `---` (под frontmatter)
3. Редактировать markdown-текст

**Markdown синтаксис который точно работает:**

```markdown
Обычный абзац. Текст с **жирным** и *курсивом*.

Новый абзац через пустую строку.

[Ссылка на что-то](https://example.com)

> Цитата выделенным блоком.
```

Что НЕ работает (не пытайся):
- HTML внутри markdown (будет escape'нуто)
- Картинки внутри bio (это не поддерживается текущим компонентом)
- Embed'ы (SoundCloud, YouTube) — отдельный механизм

---

### Сценарий E: Обновить ссылки в соцсетях / email / адресе

**Когда:** артист сменил Instagram, новый email для bookings, переехал офис.

**Глобальные ссылки (соцсети Carpet Club, адрес, email):**

Открыть `src/lib/site.ts`:

```typescript
export const site = {
  url: 'https://carpetclub.com',

  bookingsEmail: 'kristina.carpetevents@gmail.com',  // ← поправить

  address: {
    street: 'Rua da Misericórdia, 14',  // ← поправить
    unit: 'Piso S/L, Loja 28',
    postalCode: '1200-273',
    locality: 'Lisboa',
  },

  social: {
    instagram: 'https://instagram.com/carpetclub_/',  // ← поправить
    soundcloud: 'https://soundcloud.com/carpetandsnares',
    bandcamp: 'https://carpetandsnaresrecords.bandcamp.com',
    ra: 'https://ra.co/promoters/55088',
    shotgun: 'https://shotgun.live/en/venues/carpet-snares-records',
  },
};
```

Изменение здесь обновит все места на сайте, где это упоминается: футер, контакты, schema.org, structured data.

**Соцсети конкретного артиста:**

Открыть `src/content/artists/<slug>.md`, обновить `socials.instagram` и т.д. в frontmatter.

---

### Сценарий F: Заменить hero "Carpet" логотип

**Когда:** ребрендинг, новая версия лого.

**Шаги:**

1. Подготовить PNG с прозрачным фоном, ~1400×990 px (16:11), белый или text цвет
2. Конвертировать в WebP через squoosh.app — обязательно с поддержкой прозрачности
3. Сохранить как `public/assets/carpet-hero.webp` (новый)
4. Также сохранить PNG как `public/assets/carpet-hero.png` (fallback)
5. **Перезаписать существующие файлы** с теми же именами

Без правки кода — компонент уже использует эти файлы.

---

### Сценарий G: Добавить фото в Photo Strip на главной

**Когда:** есть свежие фото с прошедших ивентов.

**Шаги:**

1. Подготовить 4 фото — квадратные, любого высокого разрешения
2. Конвертировать в WebP, ~80-150 KB каждое
3. Сохранить как `public/assets/photos/01.webp`, `02.webp`, `03.webp`, `04.webp`
4. Открыть `src/pages/index.astro`, найти секцию `photo-section`
5. Заменить:

```astro
<div class="photo-strip">
  {[1, 2, 3, 4].map((i) => (
    <div class="photo-cell" aria-hidden="true">
      <span>Photo {i}</span>
    </div>
  ))}
</div>
```

на:

```astro
<div class="photo-strip">
  <img src="/assets/photos/01.webp" alt="Wednesday night at Rūmu — January 2026" loading="lazy" />
  <img src="/assets/photos/02.webp" alt="Carpet & Friends" loading="lazy" />
  <img src="/assets/photos/03.webp" alt="Late night dancefloor" loading="lazy" />
  <img src="/assets/photos/04.webp" alt="DJ booth view" loading="lazy" />
</div>
```

Также в `<style>` той же страницы найти `.photo-cell` и заменить на `.photo-strip img` где нужно.

**Атрибут `alt` обязателен** — это для SEO (Google Images) и accessibility.

---

### Сценарий H: Подключить SoundCloud iframe на главной

**Когда:** есть свежий mix Carpet Club для главной страницы.

**Шаги:**

1. Открыть трек в SoundCloud
2. Нажать `Share` → `Embed`
3. Скопировать `src` URL из iframe-кода (длинная строка, начинается с `https://w.soundcloud.com/player/?url=...`)
4. Открыть `src/pages/index.astro`, найти `<div class="mix-placeholder">`
5. Заменить целый div на:

```astro
<iframe
  width="100%"
  height="166"
  scrolling="no"
  frameborder="no"
  src="ВСТАВЬ_СЮДА_СКОПИРОВАННЫЙ_SRC&color=%23ff3c78"
  loading="lazy"
  title="Latest Carpet Club mix"
></iframe>
```

**Цвет волны:** `&color=%23ff3c78` в URL делает её розовой под бренд.

---

### Сценарий I: Поменять цвет акцента / шрифт

**Когда:** ребрендинг или эксперимент с дизайном.

**Цвет:**

Открыть `tailwind.config.mjs`:
```javascript
accent: {
  DEFAULT: '#ff3c78',  // ← основной розовый
  dim: 'rgba(255, 60, 120, 0.08)',
  hover: '#ff1a60',
},
```

Поменять значения, пересобрать (`npm run build`). **Не забудь обновить `dim` и `hover` соразмерно** — это transparent и darker варианты основного.

**Шрифт:**

1. Найти шрифты на https://fonts.google.com/
2. В `src/styles/global.css` обновить `@import url(...)` строку
3. В `tailwind.config.mjs` обновить:
```javascript
fontFamily: {
  body: ['"Your New Body Font"', 'sans-serif'],
  mono: ['"Your New Mono Font"', 'monospace'],
},
```

Что нельзя менять без последствий:
- Размеры (clamp значения) — выверены под конкретные шрифты, новые шрифты могут переполнять контейнеры
- letter-spacing — то же

---

## 4. Markdown синтаксис

Полный референс: https://www.markdownguide.org/basic-syntax/

**Что нужно знать на каждый день:**

```markdown
**Жирный**
*Курсив*

[Ссылка](https://example.com)

# Большой заголовок
## Поменьше
### Ещё поменьше

- Маркированный список
- Второй пункт

1. Нумерованный
2. Второй

> Цитата

`код в строке`

---

Горизонтальная линия (три дефиса)
```

**В контексте артистов:**
- Используй абзацы (пустая строка между ними)
- Можно **жирным** выделить ключевые слова
- *Курсивом* — название лейбла, имя клуба
- [Ссылками] оборачивай ключевые упоминания (Resident Advisor profile, Beatport release)

---

## 5. Подготовка изображений

### Рекомендации по размерам и форматам

| Тип | Размер | Формат | Quality | Где |
|---|---|---|---|---|
| Hero "Carpet" логотип | 1400×990 px | WebP + PNG fallback | WebP 85, PNG optimized | `public/assets/` |
| Артисты | 900×900 px | WebP + JPEG fallback | WebP 82, JPEG 80 | `public/assets/artists/` |
| Photo Strip | 800×800 px | WebP only | 80 | `public/assets/photos/` |
| OG image | 1200×630 px | PNG | optimized | `public/og-default.png` |
| Favicon | 32×32 px | SVG | — | `public/favicon.svg` |

### Инструменты

**Squoosh** (https://squoosh.app/) — drag-drop конвертер. Без аккаунта, в браузере, бесплатно. Поддерживает WebP, AVIF, MozJPEG, optimized PNG.

**Photopea** (https://photopea.com/) — Photoshop в браузере, free, для кропа и базовых правок.

**Figma** — для создания OG image и других дизайн-ассетов.

### Что НЕ делать

- ❌ Не загружать прямые фото с iPhone (3MB+) — обязательно сжимать в WebP
- ❌ Не использовать JPEG для прозрачного фона — превратится в чёрный
- ❌ Не использовать GIF — старый формат, тяжёлый, заменяется на видео или PNG sequence
- ❌ Не использовать HEIC (iPhone формат) — не поддерживается в браузерах

---

## 6. Чек-лист перед публикацией изменений

После любого изменения контента — перед `git push` или `npm run build`:

```
[ ] Все frontmatter поля заполнены корректно
[ ] Дата событий в формате YYYY-MM-DD (без кавычек)
[ ] Все URL начинаются с https://
[ ] Все image: пути начинаются со /assets/
[ ] Изображения положены в правильную папку и нужного размера
[ ] alt тексты у всех картинок
[ ] Open localhost:4321, кликнул по новой странице — выглядит ок
[ ] Mobile preview (Chrome DevTools) — выглядит ок
[ ] npm run build прошёл без ошибок
```

---

## 7. Что НЕ трогать (без разработчика)

Эти файлы и папки — это **код**, не контент:

```
src/components/    ← компоненты (PixelCanvas, Cursor, Nav, etc.)
src/layouts/       ← layouts (BaseLayout)
src/pages/         ← страницы (логика рендеринга)
src/styles/        ← глобальные стили
astro.config.mjs   ← конфиг сборщика
tailwind.config.mjs ← дизайн-токены
tsconfig.json      ← TypeScript конфиг
package.json       ← зависимости
package-lock.json  ← зафиксированные версии
node_modules/      ← установленные библиотеки
.astro/            ← кеш билдера
dist/              ← результат сборки
```

Изменения здесь требуют программирования — если что-то нужно поменять в дизайне, поведении, layout — это задача разработчика.

---

## 8. Workflow для регулярных обновлений

**Каждую неделю** (перед средой):
1. Перевести прошлое событие из `upcoming` в `past`
2. Опубликовать новое событие на следующую среду

**Раз в 1-2 месяца:**
1. Обновить SoundCloud iframe на главной (новый mix)
2. Обновить Photo Strip (свежие фото с ивентов)
3. Если новый артист — добавить

**Раз в квартал:**
1. Проверить ссылки на соцсети артистов (профили иногда удаляются/мигрируют)
2. Verify Shotgun URLs — Shotgun иногда меняет slug pattern
3. Прогнать Lighthouse — проверить что perf не упал

**Раз в год:**
1. Обновить адрес если переезжаешь
2. Renew домен
3. Renew SSL (на Netlify/Cloudflare обычно автоматически)

---

## 9. Troubleshooting

### Build падает с ошибкой "Invalid content entry"

Astro нашёл невалидный frontmatter в одном из markdown файлов.

В терминале будет конкретный путь к файлу и сообщение:
> `[InvalidContentEntryDataError] events → 2026-06-03-foo data does not match collection schema`

Открыть тот файл, проверить:
- Все обязательные поля присутствуют
- Дата без кавычек, формат `YYYY-MM-DD`
- URL'ы валидные (начинаются с `https://`)
- Lineup это **массив** — каждый элемент с дефиса и кавычек

### Картинка артиста не показывается

Проверить:
- Путь в frontmatter начинается со `/assets/`
- Файл физически лежит в `public/assets/artists/`
- Имя файла **точно** совпадает (case-sensitive)
- Расширение совпадает (jpeg vs jpg vs png)

### Все nav-ссылки 404 на собранном dist

Это нормально, если открываешь `dist/index.html` через двойной клик (`file://`). Браузер ищет `/about` от корня диска, а не папки.

Решение: запустить локальный сервер:
```bash
cd dist
python -m http.server 8080
# или
npx serve .
```

### Форма не отправляется

1. Проверить `.env` существует, в нём `PUBLIC_WEB3FORMS_KEY=реальный-ключ`
2. **Перезапустить** `npm run dev` (env переменные читаются на старте, hot-reload их не подхватывает)
3. Открыть DevTools → Network → submit форму — посмотреть статус запроса на `api.web3forms.com`
4. На production: проверить env var в Netlify/Cloudflare dashboard, потом передеплоить

### Сайт обновился но я не вижу изменений

- Если local: hard refresh (Ctrl+Shift+R / Cmd+Shift+R) — снимает CSS кеш
- Если production: подожди 1-2 минуты после push, проверь deploy status в Netlify
- Если открыл через PWA / homepage shortcut — может быть закеширован service worker

---

## 10. Когда нужен разработчик

Эти задачи **не для самостоятельного решения** — попроси dev'а:

- Изменение визуального дизайна (цвета можно сама, layout — нет)
- Добавление новой страницы со своим routing-ом (например `/press`, `/about/team`)
- Интеграция CMS (Sanity, Notion)
- Кастомные интерактивные компоненты
- Email-маркетинг integration (Mailchimp, Buttondown)
- Аналитика setup
- SEO аудит и оптимизация после запуска
- Multi-language (English / Português)
- Performance оптимизация если site становится медленным

Контент, события, артисты, фото, SoundCloud, мелкие правки текста — **это всё ты сама** через файлы выше.
