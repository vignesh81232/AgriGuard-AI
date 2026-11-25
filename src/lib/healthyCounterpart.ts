import type { Crop } from "../i18n/translations";

export type HealthyCounterpartErrorKind =
  | "api-unavailable"
  | "gemini-not-configured"
  | "image-generation-rate-limited"
  | "image-generation-unavailable";

export class HealthyCounterpartError extends Error {
  readonly kind: HealthyCounterpartErrorKind;

  constructor(kind: HealthyCounterpartErrorKind) {
    super(kind);
    this.name = "HealthyCounterpartError";
    this.kind = kind;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHealthyCounterpartErrorKind(value: unknown): value is HealthyCounterpartErrorKind {
  return (
    value === "api-unavailable" ||
    value === "gemini-not-configured" ||
    value === "image-generation-rate-limited" ||
    value === "image-generation-unavailable"
  );
}

export async function generateHealthyCounterpart(
  imageDataUrl: string,
  crop: Crop | null,
): Promise<string> {
  let response: Response;
  try {
    response = await fetch("/api/healthy-counterpart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageDataUrl, crop }),
    });
  } catch {
    throw new HealthyCounterpartError("api-unavailable");
  }

  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new HealthyCounterpartError("api-unavailable");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new HealthyCounterpartError("image-generation-unavailable");
  }

  if (!response.ok) {
    const errorCode = isRecord(payload) ? payload.error : undefined;
    throw new HealthyCounterpartError(
      isHealthyCounterpartErrorKind(errorCode)
        ? errorCode
        : "image-generation-unavailable",
    );
  }

  if (
    !isRecord(payload) ||
    typeof payload.imageDataUrl !== "string" ||
    !/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(payload.imageDataUrl)
  ) {
    throw new HealthyCounterpartError("image-generation-unavailable");
  }
  return payload.imageDataUrl;
}
