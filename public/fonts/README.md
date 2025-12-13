# Fonts folder

This folder is where you can add local fonts for the app. Drop font files (WOFF2 recommended, TTF ok) into this folder and update the stylesheet or use Next.js's `next/font/local`.

Guidance

- Preferred format: WOFF2 for better compression and performance.
- Recommended file names for Niradei used in the project:
  - Niradei-Regular.woff2
  - Niradei-Bold.woff2
  - Niradei-Regular.ttf
  - Niradei-Bold.ttf
- If you don't have a WOFF2 file, you can convert from TTF using `npx ttf2woff2 public/fonts/Niradei-Bold.ttf`.

Examples

- CSS @font-face (already added in `styles/globals.css`):

  ```css
  @font-face {
    font-family: "Niradei";
    src: url("/fonts/Niradei-Regular.woff2") format("woff2"), url("/fonts/Niradei-Regular.ttf")
        format("truetype");
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: "Niradei";
    src: url("/fonts/Niradei-Bold.woff2") format("woff2"), url("/fonts/Niradei-Bold.ttf")
        format("truetype");
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }
  ```

- Using Next.js `next/font/local` (Next 13+), example in `pages/_app.tsx`:

  ```ts
  import localFont from "next/font/local";

  const niradei = localFont({
    src: [
      { path: "/fonts/Niradei-Regular.woff2", weight: "400" },
      { path: "/fonts/Niradei-Bold.woff2", weight: "700" },
    ],
    display: "swap",
  });

  export default function MyApp() {
    return <div className={niradei.className}>...</div>;
  }
  ```

If you're using Tailwind, map the font to a `fontFamily` entry in `tailwind.config.cjs`. If you prefer base app-wide font, wrap the root element with the font class or apply a `font-family` to `body`.
