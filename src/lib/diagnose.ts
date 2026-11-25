import { type DiseaseId, type Severity } from "../data/diseases";
import { CROPS, type Crop, type Lang } from "../i18n/translations";

const MAX_EDGE = 960;
const CROP_SET = new Set<string>(CROPS);

export type DiagnosisErrorKind =
  | "api-unavailable"
  | "image-not-leaf"
  | "crop-mismatch"
  | "gemini-not-configured"
  | "gemini-rate-limited"
  | "gemini-unavailable"
  | "invalid-image"
  | "model-error";

export class DiagnosisError extends Error {
  readonly kind: DiagnosisErrorKind;

  constructor(kind: DiagnosisErrorKind) {
    super(kind);
    this.name = "DiagnosisError";
    this.kind = kind;
  }
}

export interface DiagnosisInput {
  imageName: string;
  crop?: Crop | null;
  issue: string;
  language: Lang;
}

export type LeafHealthStatus = "healthy" | "diseased" | "uncertain";

export interface Diagnosis {
  diseaseId: DiseaseId;
  modelLabel?: string;
  modelSummary?: string;
  symptoms?: string[];
  careAdvice?: string[];
  healthStatus?: LeafHealthStatus;
  confidence: number;
  severity: Severity;
  imageDataUrl: string;
  imageName: string;
  crop: Crop | null;
  createdAt: number;
}

export type PredictionBand = "good" | "average" | "bad";

export function getPredictionBand(diagnosis: Diagnosis): PredictionBand {
  if (
    diagnosis.healthStatus === "healthy" ||
    (!diagnosis.healthStatus && diagnosis.severity === "healthy")
  ) {
    return "good";
  }
  if (diagnosis.healthStatus === "diseased") return "bad";
  if (diagnosis.healthStatus === "uncertain") return "average";
  if (diagnosis.diseaseId === "unclassified-disease") return "average";
  return "bad";
}

export type DiagnosisStatus = "healthy" | "uncertain" | "diseased";

export function getDiagnosisStatus(diagnosis: Diagnosis): DiagnosisStatus {
  const band = getPredictionBand(diagnosis);
  return band === "good" ? "healthy" : band === "bad" ? "diseased" : "uncertain";
}

interface GeminiDiagnosisResponse {
  crop: string;
  healthStatus: LeafHealthStatus;
  condition: string;
  confidence: number;
  severity: Severity;
  summary: string;
  symptoms: string[];
  careAdvice: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCrop(value: unknown): value is Crop {
  return typeof value === "string" && CROP_SET.has(value);
}

function isDiagnosisErrorKind(value: unknown): value is DiagnosisErrorKind {
  return (
    value === "api-unavailable" ||
    value === "image-not-leaf" ||
    value === "crop-mismatch" ||
    value === "gemini-not-configured" ||
    value === "gemini-rate-limited" ||
    value === "gemini-unavailable" ||
    value === "invalid-image"
  );
}

function isGeminiDiagnosisResponse(value: unknown): value is GeminiDiagnosisResponse {
  if (!isRecord(value)) return false;
  return (
    (value.crop === "unknown" || (typeof value.crop === "string" && CROP_SET.has(value.crop))) &&
    (value.healthStatus === "healthy" ||
      value.healthStatus === "diseased" ||
      value.healthStatus === "uncertain") &&
    typeof value.condition === "string" &&
    typeof value.confidence === "number" &&
    Number.isFinite(value.confidence) &&
    value.confidence >= 0 &&
    value.confidence <= 100 &&
    (value.severity === "healthy" ||
      value.severity === "mild" ||
      value.severity === "moderate" ||
      value.severity === "critical" ||
      value.severity === "unknown") &&
    typeof value.summary === "string" &&
    Array.isArray(value.symptoms) &&
    value.symptoms.every((item) => typeof item === "string") &&
    Array.isArray(value.careAdvice) &&
    value.careAdvice.every((item) => typeof item === "string")
  );
}

export async function diagnoseLeaf(
  input: DiagnosisInput,
  imageDataUrl: string,
): Promise<Diagnosis> {
  if (input.crop && !CROP_SET.has(input.crop)) throw new DiagnosisError("model-error");

  let response: Response;
  try {
    response = await fetch("/api/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageDataUrl,
        crop: input.crop ?? null,
        issue: input.issue,
        language: input.language,
      }),
    });
  } catch {
    throw new DiagnosisError("api-unavailable");
  }

  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new DiagnosisError("api-unavailable");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new DiagnosisError("model-error");
  }

  if (!response.ok) {
    const errorCode = isRecord(payload) ? payload.error : undefined;
    throw new DiagnosisError(
      isDiagnosisErrorKind(errorCode)
        ? errorCode
        : response.status === 413
          ? "invalid-image"
          : "model-error",
    );
  }
  if (!isGeminiDiagnosisResponse(payload)) throw new DiagnosisError("model-error");

  const healthy = payload.healthStatus === "healthy";
  const crop = isCrop(payload.crop) ? payload.crop : null;

  return {
    diseaseId: healthy ? "healthy-leaf" : "unclassified-disease",
    modelLabel: payload.condition,
    modelSummary: payload.summary,
    symptoms: payload.symptoms,
    careAdvice: payload.careAdvice,
    healthStatus: payload.healthStatus,
    confidence: Math.round(payload.confidence),
    severity: healthy ? "healthy" : payload.severity,
    imageDataUrl,
    imageName: input.imageName,
    crop,
    createdAt: Date.now(),
  };
}

/**
 * Read a File and return a downscaled JPEG dataURL (max 960px on the long
 * edge). Downscaling keeps per-account history storage compact, including
 * photos captured at full phone-camera resolution.
 */
export function fileToImageData(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
        if (scale === 1 && !file.type.startsWith("image/")) {
          reject(new Error("not-an-image"));
          return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(url);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => reject(new Error("not-an-image"));
      img.src = url;
    };
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(file);
  });
}
