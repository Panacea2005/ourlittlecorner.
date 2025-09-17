<div align="center">

# ourlittlecorner.

Warm little spaces for memories, notes, and days that matter.

`Next.js` • `TypeScript` • `Tailwind` • `Supabase` • `Spotify previews`

</div>

---

## 🌸 What is this?

A cozy personal site where you can:

- Capture moments in Albums
- Write Journals with handwritten vibes and a song that sets the mood (30s Spotify preview)
- Mark Special Days (birthdays, anniversaries, others) and see them recur every year

Everything is simple, soft, and focused on feeling good to use.

---

## ✨ Features

- Albums: upload images, organize into folders, rename, move, paginate
- Journals: handwritten title and content, select a Spotify track to “stick” with the note, themed card and modal
- Special Days: quick month/year jump, recurring highlights for birthdays/anniversaries
- Auth + Data: Supabase Auth and Postgres with sensible RLS
- UI: Tailwind + a gentle design system; handwriting uses Google’s Reenie Beanie

---

## 🧩 Tech

- Next.js 15 + App Router
- TypeScript, Tailwind CSS
- Supabase (Auth, SQL, Storage)
- Spotify 30s previews via the Web API (client credentials)

---

## 🚀 Getting Started

1) Install
```bash
pnpm install
# or npm install / yarn
```

2) Set environment variables (`.env.local`)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Spotify API (Client Credentials)
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
```

3) Database & storage
- Open `lib/scripts.sql` in Supabase SQL editor and run it. It creates:
  - `profiles`, `gallery_items`, `special_days`, `journals`
  - RLS policies, triggers, and helpful indexes
  - Public buckets `avatars`, `gallery`

4) Dev
```bash
pnpm dev
# visit http://localhost:3000
```

---

## 🗂️ App Map

- `app/albums`: gallery with folders, upload, move, search, pagination
- `app/journals`: create notes with a selected song, handwritten UI, themed modal
- `app/special-days`: monthly calendar, year/month selectors, recurring birthday/anniversary
- `app/api/spotify`: token + search endpoints used for previews

---

## 📝 Journals UX

- Create/Edit dialog mirrors the reading modal for a seamless feel
- Title and content use the handwritten font while typing
- Selected song provides the visual theme and a Spotify-style preview
- Only the author sees Edit/Delete in the modal

---

## 📅 Special Days UX

- Two controls only: Month and Year
- Birthdays/Anniversaries highlight every year (by month/day)
- “Other” highlights the exact date only

---

## 🎨 Fonts

- Body: Inter
- Handwritten: Reenie Beanie (via `next/font`) exposed as `--font-handwriting`

---

## 🧪 Commands

```bash
pnpm dev     # start dev server
pnpm build   # production build
pnpm start   # start production server
pnpm lint    # lint
```

---

## 📦 Deploy

Deploy on Vercel/Netlify. Set the same environment variables there (`.env` values). Make sure the Supabase SQL has been executed once.

---

## 💚 Notes

This is a personal corner—keep it simple, warm, and yours. If you’d like tweaks to spacing, colors, or fonts, Tailwind classes make it easy to experiment.

