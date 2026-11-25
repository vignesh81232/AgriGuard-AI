# Gemini leaf diagnosis

AgriGuard sends the selected leaf photo and optional note to the server, which
calls Google's `gemini-3.5-flash-lite` vision model. The API key stays on the
server and is never bundled into browser code. Gemini can auto-detect a crop or
analyze a selected crop from tomato, corn, potato, rice, wheat, apple, and grape.

## Run locally

1. Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/apikey).
2. Copy `.env.example` to `.env` and set `GEMINI_API_KEY` in `.env`.
3. Run `npm run dev` and open the Vite URL printed in the terminal.

The development command starts both the Vite frontend and the API server. Never
commit `.env` or paste an API key into frontend code or chat.

## Deploy on Render

Create a **Web Service** (not a Static Site) with:

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Environment variable: `GEMINI_API_KEY` (set it in Render's dashboard)

The server serves the built frontend and the `/api/diagnose` endpoint from the
same origin. The diagnosis endpoint is rate-limited to 15 requests per IP every
15 minutes.

## Generate a leaf illustration

The comparison panel can optionally create an AI-edited, healthy-looking
illustration from the uploaded leaf. It runs only when the user taps **Generate
illustration**, uses Google's `gemini-nano-banana-2.1` image model, and is
limited to 3 requests per IP every 15 minutes. Image generation may incur
additional charges under Google's Gemini API pricing.

The result is labeled as an AI-generated illustration; it is not a verified
healthy reference or a real recovery photo, and fine details may differ. The
uploaded photo is sent to Google Gemini again for this optional edit.

Gemini's confidence is an AI estimate, not a calibrated probability. Results
are screening guidance, not a confirmed diagnosis; verify disease and treatment
decisions with a local agricultural expert. The model prompt requests only
conservative, non-chemical care suggestions.
