import assert from "node:assert/strict";
import test from "node:test";
import {
  diagnoseWithGemini,
  extractGeneratedImage,
  GeminiError,
  generateHealthyCounterpart,
  normalizeGeminiDiagnosis,
} from "./gemini.js";

const healthyLeaf = {
  isLeaf: true,
  crop: "rice",
  healthStatus: "healthy",
  condition: "No clear disease signs",
  confidence: 82,
  severity: "unknown",
  summary: "The visible leaf looks healthy, though a photo cannot confirm plant health.",
  symptoms: [],
  careAdvice: ["Continue monitoring new leaves for changes."],
};

test("normalizes a valid model result and keeps healthy severity consistent", () => {
  const result = normalizeGeminiDiagnosis(healthyLeaf);

  assert.equal(result.crop, "rice");
  assert.equal(result.healthStatus, "healthy");
  assert.equal(result.severity, "healthy");
  assert.equal(result.confidence, 82);
});

test("rejects a model confidence outside the requested range", () => {
  assert.throws(
    () => normalizeGeminiDiagnosis({ ...healthyLeaf, confidence: 120 }),
    (error) => error instanceof GeminiError && error.code === "gemini-unavailable",
  );
});

test("rejects a model result with no care guidance", () => {
  assert.throws(
    () => normalizeGeminiDiagnosis({ ...healthyLeaf, careAdvice: [] }),
    (error) => error instanceof GeminiError && error.code === "gemini-unavailable",
  );
});

test("sends the image to the configured Gemini vision model", async (context) => {
  const previousKey = process.env.GEMINI_API_KEY;
  const originalFetch = globalThis.fetch;
  context.after(() => {
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
    globalThis.fetch = originalFetch;
  });

  process.env.GEMINI_API_KEY = "test-key-not-for-network";
  let requestUrl = "";
  let requestBody;
  globalThis.fetch = async (url, options) => {
    requestUrl = String(url);
    requestBody = JSON.parse(options.body);
    return new Response(
      JSON.stringify({
        candidates: [{ content: { parts: [{ text: JSON.stringify(healthyLeaf) }] } }],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };

  const result = await diagnoseWithGemini({
    image: "YQ==",
    mimeType: "image/jpeg",
    selectedCrop: "rice",
    issue: "",
    language: "en",
  });

  assert.match(requestUrl, /models\/gemini-3\.5-flash-lite:generateContent$/);
  assert.equal(requestBody.contents[0].parts[1].inlineData.data, "YQ==");
  assert.equal(result.crop, "rice");
});

test("extracts generated image data from Interactions API model output steps", () => {
  const inputImage = { type: "image", data: "YQ==", mime_type: "image/jpeg" };
  const image = { type: "image", data: "aW1n", mime_type: "image/png" };

  assert.deepEqual(
    extractGeneratedImage({
      steps: [
        { type: "user_input", content: [inputImage] },
        { type: "model_output", content: [{ type: "text", text: "Done." }, image] },
      ],
    }),
    { data: "aW1n", mimeType: "image/png" },
  );
});

test("rejects an Interactions API response without a supported image", () => {
  assert.throws(
    () => extractGeneratedImage({ steps: [{ type: "model_output", content: [] }] }),
    (error) =>
      error instanceof GeminiError && error.code === "image-generation-unavailable",
  );
});

test("extracts the SDK output_image convenience field", () => {
  assert.deepEqual(
    extractGeneratedImage({
      output_image: { data: "aW1n", mime_type: "image/png" },
    }),
    { data: "aW1n", mimeType: "image/png" },
  );
});

test("sends the original leaf to the on-demand Gemini image model", async (context) => {
  const previousKey = process.env.GEMINI_API_KEY;
  const originalFetch = globalThis.fetch;
  context.after(() => {
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
    globalThis.fetch = originalFetch;
  });

  process.env.GEMINI_API_KEY = "test-key-not-for-network";
  let requestUrl = "";
  let requestBody;
  globalThis.fetch = async (url, options) => {
    requestUrl = String(url);
    requestBody = JSON.parse(options.body);
    return new Response(
      JSON.stringify({
        steps: [
          {
            type: "model_output",
            content: [{ type: "image", data: "aW1n", mime_type: "image/png" }],
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };

  const result = await generateHealthyCounterpart({
    image: "YQ==",
    mimeType: "image/jpeg",
    crop: "potato",
  });

  assert.equal(requestUrl, "https://generativelanguage.googleapis.com/v1beta/interactions");
  assert.equal(requestBody.model, "gemini-nano-banana-2.1");
  assert.equal(requestBody.input[1].data, "YQ==");
  assert.equal(requestBody.input[1].mime_type, "image/jpeg");
  assert.equal(result.mimeType, "image/png");
  assert.equal(result.data, "aW1n");
});
