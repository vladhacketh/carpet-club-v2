# Carpet Club

Lisbon-based event brand — Wednesday residency at Rūmu. Static site built with Astro.

> **Production URL:** https://www.carpetclub.pt

---

## 📚 Documentation

| Документ | Для кого | О чём |
|---|---|---|
| **[IMPLEMENTATION.md](./docs/IMPLEMENTATION.md)** | Разработчик | Что и как реализовано: стек, архитектура, компоненты, SEO, a11y, performance |
| **[PRODUCTION-CHECKLIST.md](./docs/PRODUCTION-CHECKLIST.md)** | Тот кто запускает в прод | Что нужно сделать до запуска: ключи, домен, deploy, verify |
| **[CONTENT-GUIDE.md](./docs/CONTENT-GUIDE.md)** | Владелец / контент-менеджер | Как добавлять события, артистов, фото — без программирования |

---

## Quick start

```bash
# Install
npm install

# Set up env (Web3Forms key for forms)
cp .env.example .env
# edit .env with your real key — see PRODUCTION-CHECKLIST step 1

# Dev — http://localhost:4321
npm run dev

# Production build
npm run build

# Preview built site locally
npm run preview

# Type-check (should be 0 errors / 0 warnings / 0 hints)
npx astro check
```

---

## Stack at a glance

- **Astro 5** static site generator
- **TypeScript** strict mode
- **Tailwind CSS** for styling
- **Content Collections** (Zod-validated markdown)
- **@astrojs/sitemap** auto-generated
- **Web3Forms** for contact + newsletter forms

Подробности → [IMPLEMENTATION.md](./docs/IMPLEMENTATION.md)

---

## Project structure (high level)

```
.
├── docs/                  ← Документация (3 файла)
├── public/
│   └── assets/            ← Изображения
├── src/
│   ├── content/           ← КОНТЕНТ (артисты, события)
│   ├── components/        ← UI компоненты
│   ├── layouts/           ← Page shells
│   ├── lib/site.ts        ← Глобальный config
│   ├── pages/             ← Маршруты
│   └── styles/global.css
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── netlify.toml
```

Подробности → [IMPLEMENTATION.md § 3](./docs/IMPLEMENTATION.md#3-архитектура)

---

## License

Private. © Carpet Club / Carpet & Snares.
