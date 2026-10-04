# دعوت‌نامه دیجیتال جشن عقد · Digital Engagement Invitation

A mobile‑first Persian (RTL) engagement (جشن عقد) invitation that opens like a real envelope:
a full‑screen embossed lavender envelope with a navy wax seal → tap → the flap lifts,
the card slides out → the invitation page (names, message, countdown, event details,
Neshan directions, a full‑screen route map, optional background music).

**Zero dependencies.** Plain HTML + CSS + vanilla JavaScript. No build step, no npm, no frameworks.
Total page weight before your photos is ≈ 190 KB (fonts included), and every animation uses
only `transform`/`opacity` so it stays smooth on low‑end phones. `prefers-reduced-motion` is respected.

---

## Project structure

```
index.html                     ← page markup (sections, icons, envelope, card)
src/
  data/weddingData.js          ← ✏️  ALL your wedding info lives here
  styles/main.css              ← design & animations
  scripts/main.js              ← envelope, countdown, music, reveal
  assets/
    fonts/                     ← self‑hosted Vazirmatn / Mirza / Cormorant (woff2)
    images/
      floral-pattern.svg       ← embossed envelope pattern
      we.png                   ← couple photo
      Location.jpeg            ← route map shown in the full-screen viewer
    music/                     ← put your MP3 here (optional)
tools/gen-assets.mjs           ← regenerates the SVG artwork (never required)
README.md
```

## Preview locally

Open the folder in a terminal and run one of these, then visit http://localhost:5173

```bash
python3 -m http.server 5173
```

```bash
npx serve -l 5173 .
```

(Opening `index.html` directly by double‑clicking also works in most browsers, but a local
server is recommended so fonts/audio behave exactly like production.)

---

## Customizing — everything is in `src/data/weddingData.js`

Open `src/data/weddingData.js` in any text editor. Each setting is a simple `key: "value",` line.
Keep the quotes and the trailing comma.

### 1. Couple names

```js
brideName: "آتنا",
groomName: "مهدی",
// Optional Latin names shown under the Persian ones. Use "" to hide.
brideNameLatin: "Atena",
groomNameLatin: "Mahdi",
```

The names also appear on the card inside the envelope, in the closing section and in the browser tab title.

### 2. Date & time

`countdownDate` is the only thing the countdown reads, and the **`+03:30` offset is what pins it to
Iran time** — keep it. Written that way, the countdown targets the same instant for every guest no
matter which country or timezone their phone is set to:

```js
countdownDate: "2026-10-12T18:00:00+03:30",   // 2026-10-12 18:00 Tehran = 14:30 UTC
timeZone: "Asia/Tehran",
date: "دوشنبه ۲۰ مهر ۱۴۰۵",   // leave "" to generate the Persian date from countdownDate
time: "",                      // "" = generated from countdownDate in Iran time → ۱۸:۰۰
timeSuffix: "عصر",             // appended to the generated time
```

Because `time` is empty, the hour is formatted **in `Asia/Tehran`**, so a guest in Italy still sees
۱۸:۰۰ (not their own 16:30). Writing your own string in `time` (e.g. `time: "۱۸:۳۰ عصر"`) overrides it.
If the hour ever changes, update it inside `countdownDate` too so the countdown ends at the right moment.

When the countdown reaches zero the page shows `countdownFinishedText` ("امروز روز عشق ماست").

### 3. Venue & address

```js
venue: "",            // name of the hall — while it is "" the «مکان» row is hidden
address: "البرز، گرمدره، شهرستان کرج، بزرگراه لشگری، دسترسی محلی، سعادتیه، شهید صلواتی، عمارت آمور",
```

### 4. Navigation (Neshan) & the route map

```js
navigationUrl: "https://neshan.org/maps/places/…",   // "" hides the button
navigationLabel: "مسیریابی تا تالار",

routeMapImage: "src/assets/images/Location.jpeg",    // "" hides the route-map card
routeMapTitle: "راهنمای مسیر",
routeMapSubtitle: "مشاهده نقشه دسترسی به تالار",
routeMapAlt: "نقشه مسیرهای دسترسی به تالار",
```

To change the Neshan link: open the place in Neshan → share → copy the link into `navigationUrl`.

To change the route map: drop a new image into `src/assets/images/` and point `routeMapImage` at it.
It is only downloaded the first time a guest opens the viewer, so a detailed map is fine
(keep it under ~400 KB; the current one is 99 KB).

### 5. Couple photo

```js
couplePhoto: "src/assets/images/couple.jpg",   // portrait 3:4 works best
couplePhotoAlt: "عکس عروس و داماد",
```

**Image tip:** the frame follows whatever aspect ratio the file has, so the photo is never cropped or
stretched — just update `couplePhoto`. For the fastest load on mobile, save it as **WebP** or JPG at
~80 % quality (ideally under ~250 KB); [Squoosh](https://squoosh.app) does this in the browser for free.

### 6. Background music

1. Put an MP3 in `src/assets/music/` (keep it small — a 128 kbps, 2–3 minute clip is ≈ 2–3 MB).
2. Point to it:

```js
musicUrl: "src/assets/music/song.mp3",   // "" hides the music button entirely
```

Music starts when the guest taps the envelope (browsers block audio before a tap), loops, and can be
toggled with the round button in the corner. The choice is remembered for the session.

### Other options

| Key | What it does |
|---|---|
| `heroKicker` | Small line above the names |
| `invitationTitle`, `invitationText` | Message section; each array item is one paragraph |
| `countdownTitle`, `eventTitle` | Section headings |
| `closingTitle`, `closingText` | Final section ("مشتاق دیدارتان هستیم") |
| `persianDigits` | `true` → ۱۲۳, `false` → 123 |
| `envelopeHint` | Text on the closed envelope |
| `openingSound` | `true` plays a very quiet paper swish when the envelope opens (generated in the browser, no file) |
| `pageTitle` | Browser tab title (auto from the names when "") |

---

## 7. Deploying

The site is static — upload the folder anywhere. No build step.

**GitHub Pages (free)**
1. Create a repository and push all files (`index.html` must be at the root).
2. Repo → *Settings* → *Pages* → Source: *Deploy from a branch* → branch `main`, folder `/ (root)`.
3. Your invitation is live at `https://<user>.github.io/<repo>/`.

**Netlify / Vercel / Cloudflare Pages (free)**
Drag‑and‑drop the project folder onto [app.netlify.com/drop](https://app.netlify.com/drop), or connect the
repository in Vercel/Cloudflare Pages with no build command and output directory `/`.

**Any Iranian host / cPanel / FTP**
Upload `index.html` and the `src` folder to `public_html`. Make sure the server serves `.woff2`
(most do; in Apache add `AddType font/woff2 .woff2` to `.htaccess` if fonts don't load).

**Custom domain + short link:** put the final URL in a QR code or send it directly in WhatsApp/Telegram —
the page has Open‑Graph‑friendly title/description and looks right in link previews.

---

## Notes

* **Browser support:** current iOS Safari, Android Chrome/Samsung Internet, and desktop browsers. Older
  WebKit fallbacks (`-webkit-clip-path`, no `inset`, `aspect-ratio` fallback) are included.
* **Fonts:** Vazirmatn (body, variable), Mirza (display Persian headings) and Cormorant Garamond
  (the "&" and Latin names) are self‑hosted subsets loaded with `font-display: swap`.
* **The opening:** tapping the seal breaks it, lifts the flap, then draws the invitation card up out of the
  envelope (subtle tilt + settle) while the envelope is lowered away — ~2.4 s in total, CSS transforms only.
  A very quiet Web‑Audio paper swish is synced to the flap, the slide and the settle (`openingSound: false` mutes it).
* **Accessibility:** the seal is a real button (keyboard/Enter opens it), the page is RTL throughout, and
  reduced‑motion users get a simple cross‑fade with no card animation.
* **The route map viewer:** tapping «راهنمای مسیر» opens the map full screen over a dark backdrop —
  fade + 0.97→1 scale in, double‑tap or pinch to zoom (up to 4×), drag to pan, and a rotate button that
  turns a wide map upright to fill a phone screen (it only appears when that actually helps). Closes with the
  ✕, the backdrop or Escape; the page behind it cannot scroll and returns to the same position afterwards.
* **No network calls:** the site never sends data anywhere; it only loads its own fonts, styles and images.
* **Regenerating artwork:** `node tools/gen-assets.mjs .` rebuilds the envelope pattern and the placeholder
  photo; you never need to run it — just replace the placeholder photo.
