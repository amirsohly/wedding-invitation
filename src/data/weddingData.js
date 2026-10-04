/* =====================================================================
   ✏️  WEDDING DATA — edit everything about your invitation HERE.
   Nothing below needs to be touched anywhere else in the project.
   ===================================================================== */

window.weddingData = {

  /* ---------- Couple ---------- */
  brideName: "آتنا",
  groomName: "مهدی",
  // Optional Latin names shown under the Persian ones. Leave "" to hide.
  brideNameLatin: "Atena",
  groomNameLatin: "Mahdi",
  // Small line above the names.
  heroKicker: "با افتخار و مسرت شما را به جشن پیوند آسمانی‌مان دعوت می‌نماییم",

  /* ---------- Couple photo ---------- */
  // Replace with your own photo (a portrait crop works best with the arched frame).
  couplePhoto: "src/assets/images/we.png",
  couplePhotoAlt: "عکس عروس و داماد",

  /* ---------- Date & time ---------- */
  // The exact ceremony moment. The "+03:30" suffix pins it to Iran time, so the
  // countdown targets the same instant for every guest, in any country
  // (2026-10-12 18:00 Tehran = 14:30 UTC). Never drop the offset.
  countdownDate: "2026-10-12T18:00:00+03:30",
  timeZone: "Asia/Tehran",
  // Shown on the page. Leave "" to generate them from countdownDate in Iran time —
  // that way the page always shows ۱۸:۰۰, even if the guest's phone is set to another country.
  date: "دوشنبه ۲۰ مهر ۱۴۰۵",
  time: "",
  // Appended to the generated time.
  timeSuffix: "عصر",

  /* ---------- Venue ---------- */
  // ✏️ Name of the hall. Leave "" and the «مکان» row hides itself.
  venue: "",
  address: "البرز، گرمدره، شهرستان کرج، بزرگراه لشگری، دسترسی محلی، سعادتیه، شهید صلواتی، عمارت آمور",

  /* ---------- Navigation ---------- */
  // Neshan link for the venue. Leave "" to hide the navigation button.
  navigationUrl: "https://neshan.org/maps/places/24f03e87c1366ed046524ca750d63bb7#c35.737-51.085-15z-0p",
  navigationLabel: "مسیریابی تا تالار",

  /* ---------- Route map ---------- */
  // Opens full-screen when the card is tapped. Leave routeMapImage "" to hide the card.
  routeMapImage: "src/assets/images/Location.jpeg",
  routeMapTitle: "راهنمای مسیر",
  routeMapSubtitle: "مشاهده نقشه دسترسی به تالار",
  routeMapAlt: "نقشه مسیرهای دسترسی به تالار",

  /* ---------- Music ---------- */
  // Path or URL of an MP3. Leave "" to hide the music button.
  // Starts when the envelope is opened (inside the tap, so mobile browsers allow it).
  musicUrl: "src/assets/music/music.mp3",

  /* ---------- Invitation text ---------- */
  invitationTitle: "به نام یگانه معشوق",
  // Each line becomes one paragraph.
  invitationText: [
    "تصویر عشق، تنها نمای ماندگار ذهن ماست.",
    "ما عشق را برای هم نقاشی کردیم به رنگ آبِ زلال؛",
    "اما جشن زندگی را رنگین می‌خواهیم.",
    "حضور شما، رنگین‌کمان رویایی ما را زیباتر خواهد کرد.",
  ],

  /* ---------- Countdown ---------- */
  countdownTitle: "شمارش معکوس تا آغاز جشن",
  countdownFinishedText: "امروز روز عشق ماست",

  /* ---------- Event block ---------- */
  eventTitle: "جشن عقد",

  /* ---------- Closing ---------- */
  closingTitle: "مشتاق دیدارتان هستیم",
  closingText: "حضور گرم شما، زیباترین هدیه‌ی این شب برای ماست.",

  /* ---------- Options ---------- */
  // Show numbers with Persian digits (۱۲۳) instead of Latin digits (123).
  persianDigits: true,
  // Text on the closed envelope.
  envelopeHint: "برای باز کردن دعوت‌نامه لمس کنید",
  // Very subtle paper "swish" when the envelope opens (generated in the browser, no audio file).
  openingSound: true,
  // Browser tab title. Leave "" to build it from the names automatically.
  pageTitle: "",
};
