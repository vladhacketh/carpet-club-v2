/**
 * Centralized site configuration.
 *
 * Edit values here, then any change propagates everywhere
 * (layouts, JSON-LD schemas, forms, sitemap, robots).
 */

export const site = {
  /** Production URL. Set this to your real domain when you deploy. */
  url: 'https://www.carpetclub.pt',

  /** Brand */
  name: 'Carpet Club',
  tagline: 'Lisbon-based event brand. Weekly events and curated showcases rooted in electronic music and club culture.',
  founded: 2014,

  /** Venue + address */
  venue: 'Rūmu',
  city: 'Lisbon',
  country: 'PT',
  address: {
    street: 'Rua da Misericórdia, 14',
    unit: 'Piso S/L, Loja 28',
    postalCode: '1200-273',
    locality: 'Lisboa',
  },

  /** Contact */
  bookingsEmail: 'kristina.carpetevents@gmail.com',

  /** Social */
  social: {
    instagram: 'https://instagram.com/carpetclub_/',
    soundcloud: 'https://soundcloud.com/carpetandsnares',
    bandcamp: 'https://carpetandsnaresrecords.bandcamp.com',
    ra: 'https://ra.co/promoters/55088',
    shotgun: 'https://shotgun.live/en/venues/carpet-snares-records',
  },

  /**
   * Web3Forms access key for contact + newsletter forms.
   * Sign up free at https://web3forms.com/ — no account needed,
   * just enter your email and get a key.
   *
   * For local dev, set WEB3FORMS_ACCESS_KEY in .env
   * For production (Netlify/Vercel/Cloudflare Pages), set it as an env var in their dashboard.
   */
  web3formsKey: import.meta.env.PUBLIC_WEB3FORMS_KEY || '',
} as const;
