import "dotenv/config";
import express from "express";
import { rateLimit } from "express-rate-limit";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  diagnoseWithGemini,
  generateHealthyCounterpart,
  GeminiError,
} from "./server/gemini.js";

const app = express();
const port = Number(process.env.PORT || 3001);
const supportedCrops = new Set(["tomato", "corn", "potato", "rice", "wheat", "apple", "grape"]);
const supportedLanguages = new Set(["en", "hi", "es", "kn"]);
const imagePattern = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/;
const distPath = resolve("dist");
const indexPath = resolve(distPath, "index.html");

app.set("trust proxy", 1);
app.use(express.json({ limit: "4mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, geminiConfigured: Boolean(process.env.GEMINI_API_KEY) });
});

app.post(
  "/api/diagnose",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "gemini-rate-limited" },
  }),
  async (request, response) => {
    const body = request.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return response.status(400).json({ error: "invalid-request" });
    }

    const match =
      typeof body.imageDataUrl === "string" ? imagePattern.exec(body.imageDataUrl) : null;
    if (!match || Math.floor((match[2].length * 3) / 4) > 2_500_000) {
      return response.status(400).json({ error: "invalid-image" });
    }

    const selectedCrop = body.crop === null ? null : body.crop;
    if (selectedCrop !== null && !supportedCrops.has(selectedCrop)) {
      return response.status(400).json({ error: "invalid-request" });
    }
    if (
      typeof body.issue !== "string" ||
      body.issue.length > 300 ||
      typeof body.language !== "string" ||
      !supportedLanguages.has(body.language)
    ) {
      return response.status(400).json({ error: "invalid-request" });
    }

    try {
      const diagnosis = await diagnoseWithGemini({
        image: match[2],
        mimeType: match[1],
        selectedCrop,
        issue: body.issue.trim(),
        language: body.language,
      });
      return response.json(diagnosis);
    } catch (error) {
      if (error instanceof GeminiError) {
        return response.status(error.status).json({ error: error.code });
      }
      console.error("Unexpected Gemini diagnosis failure.");
      return response.status(502).json({ error: "gemini-unavailable" });
    }
  },
);

app.post(
  "/api/healthy-counterpart",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "image-generation-rate-limited" },
  }),
  async (request, response) => {
    const body = request.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return response.status(400).json({ error: "invalid-request" });
    }

    const match =
      typeof body.imageDataUrl === "string" ? imagePattern.exec(body.imageDataUrl) : null;
    if (!match || Math.floor((match[2].length * 3) / 4) > 2_500_000) {
      return response.status(400).json({ error: "invalid-image" });
    }

    const selectedCrop = body.crop === null ? null : body.crop;
    if (selectedCrop !== null && !supportedCrops.has(selectedCrop)) {
      return response.status(400).json({ error: "invalid-request" });
    }

    try {
      const generated = await generateHealthyCounterpart({
        image: match[2],
        mimeType: match[1],
        crop: selectedCrop,
      });
      return response.json({
        imageDataUrl: `data:${generated.mimeType};base64,${generated.data}`,
      });
    } catch (error) {
      if (error instanceof GeminiError) {
        return response.status(error.status).json({ error: error.code });
      }
      console.error("Unexpected Gemini image-generation failure.");
      return response.status(502).json({ error: "image-generation-unavailable" });
    }
  },
);

if (existsSync(indexPath)) {
  app.use(express.static(distPath));
  app.use((request, response, next) => {
    if (request.method !== "GET" || request.path.startsWith("/api/")) return next();
    return response.sendFile(indexPath);
  });
}

app.use((error, _request, response, next) => {
  if (response.headersSent) return next(error);
  if (error?.type === "entity.too.large") {
    return response.status(413).json({ error: "invalid-image" });
  }
  if (error instanceof SyntaxError && "body" in error) {
    return response.status(400).json({ error: "invalid-request" });
  }
  console.error("Unexpected server request failure.");
  return response.status(500).json({ error: "server-error" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`AgriGuard API listening on port ${port}`);
});
