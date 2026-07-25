# Knight Wisdom V1

A responsive, dark Next.js starter for **KnightWisdom.com**. It includes a brand homepage, reusable cards and shared site chrome, plus baseline metadata for search and social sharing.

## Run locally or on a LAN

1. Install Node.js 20.9 or newer.
2. In this folder, run `npm install`.
3. Start the development server with `npm run dev -- --hostname 0.0.0.0`.
4. Open `http://localhost:3000` on this computer. For another device on the same network, open `http://YOUR-COMPUTER-LAN-IP:3000` (for example, `http://192.168.1.20:3000`). Ensure your firewall permits incoming connections on port 3000.

## Production check

Run `npm run build`, then `npm run start -- --hostname 0.0.0.0`.

## Project map

- `app/page.tsx` — homepage composition and content
- `app/globals.css` — design system and responsive styles
- `components/` — reusable header, footer, category, guide, and icon components
- `app/layout.tsx` — global SEO metadata
