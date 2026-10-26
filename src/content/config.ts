import { defineCollection, z } from 'astro:content';

const artists = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    role: z.string().default('Resident'),
    image: z.string().optional(),
    mix: z.string().url().optional(),
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
    // Featured events appear under "Upcoming" on the Showcases page.
    featured: z.boolean().default(false),
    hours: z.string().optional(),
  }),
});

export const collections = { artists, events };
