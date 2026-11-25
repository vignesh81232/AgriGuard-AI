import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Card, SectionHeading } from "../i18n";
import { useI18n } from "../i18n";
import { getDisease, getLocalized } from "../data/diseases";
import { getPredictionBand, type Diagnosis, type PredictionBand } from "../lib/diagnose";
import type { TranslationKey } from "../i18n/translations";
import {
  generateHealthyCounterpart,
  HealthyCounterpartError,
  type HealthyCounterpartErrorKind,
} from "../lib/healthyCounterpart";
import {
  CheckCircleIcon,
  DropletIcon,
  FlaskIcon,
  LeafIcon,
  ListCheckIcon,
  SproutIcon,
} from "./icons";

/**
 * Full results dashboard: model score, leaf comparison, curated remedies and
 * a prevention checklist.
 */

const SEVERITY_TRACK = [
  { key: "mild", color: "var(--color-severity-mild)", label: "severityMild" },
  { key: "moderate", color: "var(--color-severity-mild)", label: "severityModerate" },
  { key: "critical", color: "var(--color-severity-mild)", label: "severityCritical" },
] as const;

const PREDICTION_BAND_LABELS: Record<PredictionBand, TranslationKey> = {
  good: "predictionGood",
  average: "predictionAverage",
  bad: "predictionBad",
};

/** Illustrative overlay used only for older saved diagnoses with known severity. */
function affectedOverlay(seed: string): CSSProperties {
  const layers = Array.from({ length: 5 }, (_, i) => {
    const cx = 20 + ((seed.charCodeAt(i % seed.length) * 37 + i * 61) % 60);
    const cy = 12 + ((seed.charCodeAt(i % seed.length) * 53 + i * 41) % 70);
    return `radial-gradient(circle at ${cx}% ${cy}%, rgb(20 140 70 / 0.4) 0%, rgb(20 140 70 / 0.14) 45%, transparent 72%)`;
  });
  return { background: layers.join(", ") };
}

function SeverityMeter({ diagnosis }: { diagnosis: Diagnosis }) {
  const { t } = useI18n();
  const segWidth = 100 / 3;
  const band = getPredictionBand(diagnosis);
  const severityPosition =
    diagnosis.severity === "mild"
      ? "16.667%"
      : diagnosis.severity === "moderate"
        ? "50%"
        : diagnosis.severity === "critical"
          ? "83.333%"
          : null;
  const bandLabel = PREDICTION_BAND_LABELS[band];
  const scoreColor = band === "bad" ? "bg-severity-critical" : "bg-severity-mild";
  const scoreTextColor = band === "bad" ? "text-severity-critical" : "text-severity-mild";

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-heading text-base text-foreground">{t("modelScoreLabel")}</h3>
        <span className="font-heading text-2xl font-bold text-foreground">
          {diagnosis.confidence}%
        </span>
      </div>

      <div
        className="mt-4 h-3 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={diagnosis.confidence}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("modelScoreLabel")}
      >
        <div
          className={`h-full rounded-full ${scoreColor}`}
          style={{ width: `${Math.max(0, Math.min(100, diagnosis.confidence))}%` }}
        />
      </div>
      <p className={`mt-2 text-sm font-semibold ${scoreTextColor}`}>
        {t(bandLabel)}
      </p>

      {diagnosis.severity === "unknown" ? (
        <p className="mt-3 text-sm text-foreground/65">{t("severityUnknown")}</p>
      ) : null}

      {severityPosition ? (
        <>
          <div
            className="relative mt-4 flex h-3 overflow-hidden rounded-full"
            role="img"
            aria-label={t("severityLabel")}
          >
            {SEVERITY_TRACK.map((s) => (
              <div
                key={s.key}
                className="h-full"
                style={{ width: `${segWidth}%`, backgroundColor: s.color, opacity: 0.3 }}
              />
            ))}
            <span
              className="absolute top-0 h-full w-1 -translate-x-1/2 rounded bg-foreground"
              style={{ left: severityPosition }}
            />
          </div>
          <div className="mt-2 flex">
          {SEVERITY_TRACK.map((s) => (
            <div
              key={s.key}
              className="text-center text-[11px] font-semibold text-foreground/60"
              style={{ width: `${segWidth}%` }}
            >
              {t(s.label)}
            </div>
          ))}
          </div>
        </>
      ) : null}

      {diagnosis.severity === "healthy" ? (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-severity-mild/10 px-3 py-2.5 text-sm font-medium text-severity-mild">
          <CheckCircleIcon size={16} className="mt-0.5 shrink-0" />
          {t("healthyNote")}
        </p>
      ) : null}
    </Card>
  );
}

function LeafComparison({ diagnosis }: { diagnosis: Diagnosis }) {
  const { t } = useI18n();
  const showAffectedOverlay = diagnosis.severity !== "healthy" && diagnosis.severity !== "unknown";
  const overlay = affectedOverlay(diagnosis.diseaseId + String(diagnosis.confidence));
  const [counterpartImage, setCounterpartImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] =
    useState<HealthyCounterpartErrorKind | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    requestId.current += 1;
    setCounterpartImage(null);
    setGenerationError(null);
    setIsGenerating(false);
  }, [diagnosis.crop, diagnosis.imageDataUrl]);

  const generateCounterpart = async () => {
    const activeRequest = ++requestId.current;
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const image = await generateHealthyCounterpart(diagnosis.imageDataUrl, diagnosis.crop);
      if (requestId.current === activeRequest) setCounterpartImage(image);
    } catch (error) {
      if (requestId.current === activeRequest) {
        setGenerationError(
          error instanceof HealthyCounterpartError
            ? error.kind
            : "image-generation-unavailable",
        );
      }
    } finally {
      if (requestId.current === activeRequest) setIsGenerating(false);
    }
  };

  const generationErrorMessage =
    generationError === "api-unavailable"
      ? t("apiUnavailableError")
      : generationError === "gemini-not-configured"
        ? t("geminiNotConfiguredError")
        : generationError === "image-generation-rate-limited"
          ? t("healthyCounterpartRateLimited")
          : generationError
            ? t("healthyCounterpartError")
            : null;

  return (
    <section aria-label={t("leafCompareAria")}>
      <SectionHeading icon={<LeafIcon size={20} />} title={t("leafCompareTitle")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <figure className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={diagnosis.imageDataUrl}
              alt={t("yourLeafLabel")}
              className="h-full w-full object-cover"
            />
            {showAffectedOverlay ? (
              <div
                className="absolute inset-0 mix-blend-multiply"
                style={overlay}
                aria-hidden="true"
              />
            ) : null}
            <span className="absolute left-2.5 top-2.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur">
              {t("yourLeafLabel")}
            </span>
          </div>
          {showAffectedOverlay ? (
            <figcaption className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-severity-mild">
              <DropletIcon size={13} />
              {t("affectedHint")}
            </figcaption>
          ) : null}
        </figure>

        <figure className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="relative aspect-square overflow-hidden bg-muted">
            {counterpartImage ? (
              <>
                <img
                  src={counterpartImage}
                  alt={t("generatedCounterpartLabel")}
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-2.5 top-2.5 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur">
                  {t("generatedCounterpartLabel")}
                </span>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-foreground/60">
                <LeafIcon size={40} className="text-primary-700" />
                <p className="text-sm">{t("healthyReferenceUnavailable")}</p>
                <button
                  type="button"
                  aria-busy={isGenerating}
                  onClick={generateCounterpart}
                  disabled={isGenerating}
                  className="rounded-xl bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-800 disabled:cursor-wait disabled:opacity-70"
                >
                  {isGenerating
                    ? t("generatingHealthyCounterpart")
                    : t("generateHealthyCounterpart")}
                </button>
                {generationErrorMessage ? (
                  <p role="alert" className="max-w-xs text-sm text-severity-critical">
                    {generationErrorMessage}
                  </p>
                ) : null}
              </div>
            )}
          </div>
          <figcaption className="space-y-2 px-3.5 py-2.5 text-xs leading-relaxed text-foreground/60">
            <p>{t("healthyCounterpartDisclaimer")}</p>
            {counterpartImage ? (
              <>
                <button
                  type="button"
                  aria-busy={isGenerating}
                  onClick={generateCounterpart}
                  disabled={isGenerating}
                  className="font-semibold text-primary-800 underline-offset-2 hover:underline disabled:cursor-wait disabled:opacity-60"
                >
                  {isGenerating
                    ? t("generatingHealthyCounterpart")
                    : t("regenerateHealthyCounterpart")}
                </button>
                {generationErrorMessage ? (
                  <p role="alert" className="text-severity-critical">
                    {generationErrorMessage}
                  </p>
                ) : null}
              </>
            ) : null}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function Remedies({ diagnosis }: { diagnosis: Diagnosis }) {
  const { t, lang } = useI18n();
  const disease = getDisease(diagnosis.diseaseId);
  const block = getLocalized(disease, lang);
  const healthy = diagnosis.severity === "healthy";

  if (diagnosis.careAdvice?.length) {
    return (
      <section>
        <SectionHeading icon={<SproutIcon size={20} />} title={t("aiCareTitle")} />
        <Card>
          <ul className="space-y-3">
            {diagnosis.careAdvice.map((step, index) => (
              <li key={`${step}-${index}`} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-200/60 text-xs font-bold text-primary-800">
                  {index + 1}
                </span>
                <p className="text-[15px] leading-relaxed text-foreground/85">{step}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-foreground/50">
            {t("aiCareDisclaimer")}
          </p>
        </Card>
      </section>
    );
  }

  if (diagnosis.crop === "tomato" || disease.id === "unclassified-disease") {
    return (
      <section>
        <SectionHeading icon={<SproutIcon size={20} />} title={t("organicTitle")} />
        <Card>
          <p className="text-[15px] leading-relaxed text-foreground/80">
            {t("modelAdviceUnavailable")}
          </p>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <SectionHeading icon={<SproutIcon size={20} />} title={t("organicTitle")} />
      <Card>
        <ul className="space-y-3">
          {block.organic.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-200/60 text-xs font-bold text-primary-800">
                {i + 1}
              </span>
              <p className="text-[15px] leading-relaxed text-foreground/85">{step}</p>
            </li>
          ))}
        </ul>

        <div className="mt-5 border-t border-border pt-4">
          <h4 className="flex items-center gap-2 font-heading text-base text-foreground">
            <FlaskIcon size={17} className="text-primary-700" />
            {t("chemicalTitle")}
          </h4>
          {healthy ? (
            <p className="mt-2 rounded-xl bg-severity-mild/10 px-3.5 py-2.5 text-sm font-medium text-severity-mild">
              {block.chemical.product}
            </p>
          ) : (
            <dl className="mt-2.5 space-y-2 rounded-xl bg-muted px-4 py-3.5">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-foreground/55">
                  {t("productLabel")}
                </dt>
                <dd className="text-[15px] font-semibold text-foreground">
                  {block.chemical.product}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-foreground/55">
                  {t("dosageLabel")}
                </dt>
                <dd className="text-[15px] text-foreground/85">{block.chemical.dose}</dd>
              </div>
            </dl>
          )}
          <p className="mt-3 text-xs leading-relaxed text-foreground/50">{t("remedyDisclaimer")}</p>
        </div>
      </Card>
    </section>
  );
}

function PreventionChecklist({ diagnosis }: { diagnosis: Diagnosis }) {
  const { t, lang } = useI18n();
  const block = getLocalized(getDisease(diagnosis.diseaseId), lang);
  const storeKey = `agriguard:check:${diagnosis.diseaseId}`;

  const [done, setDone] = useState<boolean[]>(() => block.prevention.map(() => false));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storeKey);
      const saved = raw ? (JSON.parse(raw) as boolean[]) : [];
      if (Array.isArray(saved) && saved.length === block.prevention.length) setDone(saved);
    } catch {
      /* ignore */
    }
  }, [storeKey, block.prevention.length]);

  const toggle = (i: number) => {
    setDone((prev) => {
      const next = prev.map((v, idx) => (idx === i ? !v : v));
      try {
        localStorage.setItem(storeKey, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <section>
      <SectionHeading
        icon={<ListCheckIcon size={20} />}
        title={t("preventionTitle")}
        hint={t("preventionHint")}
      />
      <Card>
        <ul className="space-y-2">
          {block.prevention.map((step, i) => {
            const checked = done[i];
            return (
              <li key={i}>
                <button
                  type="button"
                  aria-pressed={checked}
                  onClick={() => toggle(i)}
                  className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-150 active:scale-[0.98] ${
                    checked
                      ? "border-severity-mild/40 bg-severity-mild/10"
                      : "border-border bg-white hover:border-primary-300 hover:bg-primary-200/20"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                      checked
                        ? "border-severity-mild bg-severity-mild text-white"
                        : "border-foreground/25 bg-white"
                    }`}
                  >
                    {checked ? <CheckCircleIcon size={14} /> : null}
                  </span>
                  <span
                    className={`text-[15px] leading-relaxed ${
                      checked ? "text-foreground/45 line-through" : "text-foreground/85"
                    }`}
                  >
                    {step}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Card>
    </section>
  );
}

export default function ResultsDashboard({ diagnosis }: { diagnosis: Diagnosis }) {
  return (
    <div className="mt-8 space-y-8">
      <SeverityMeter diagnosis={diagnosis} />
      <LeafComparison diagnosis={diagnosis} />
      <Remedies diagnosis={diagnosis} />
      <PreventionChecklist diagnosis={diagnosis} />
    </div>
  );
}