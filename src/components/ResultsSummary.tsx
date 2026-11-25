import { useI18n } from "../i18n";
import { Pill } from "../i18n";
import { getDisease, getLocalized } from "../data/diseases";
import type { Crop, TranslationKey } from "../i18n/translations";
import { getDiagnosisStatus, type Diagnosis } from "../lib/diagnose";
import { AlertTriangleIcon, CheckCircleIcon } from "./icons";

const CROP_NAME_KEYS: Record<Crop, TranslationKey> = {
  tomato: "cropTomato",
  corn: "cropCorn",
  potato: "cropPotato",
  rice: "cropRice",
  wheat: "cropWheat",
  apple: "cropApple",
  grape: "cropGrape",
};

/**
 * Compact summary of a finished model prediction. The full dashboard renders below it.
 */
export default function ResultsSummary({ diagnosis }: { diagnosis: Diagnosis }) {
  const { t, lang } = useI18n();
  const disease = getDisease(diagnosis.diseaseId);
  const block = getLocalized(disease, lang);
  const status = getDiagnosisStatus(diagnosis);
  const healthy = status === "healthy";
  const statusStyles = {
    healthy: {
      border: "border-severity-mild/40",
      background: "bg-severity-mild/10",
      icon: "bg-severity-mild/20 text-severity-mild",
      score: "bg-severity-mild",
    },
    uncertain: {
      border: "border-severity-moderate/50",
      background: "bg-severity-moderate/15",
      icon: "bg-severity-moderate/20 text-severity-moderate",
      score: "bg-severity-moderate",
    },
    diseased: {
      border: "border-severity-critical/40",
      background: "bg-severity-critical/10",
      icon: "bg-severity-critical/15 text-severity-critical",
      score: "bg-severity-critical",
    },
  }[status];

  const familyKey =
    disease.family === "fungal"
      ? t("familyFungal")
      : disease.family === "bacterial"
        ? t("familyBacterial")
        : disease.family === "viral"
          ? t("familyViral")
          : disease.family === "pest"
            ? t("familyPest")
            : disease.family === "unknown"
              ? t("familyUnknown")
            : t("familyNone");

  const severityTone =
    diagnosis.severity === "critical"
      ? ("critical" as const)
      : diagnosis.severity === "moderate"
        ? ("moderate" as const)
        : diagnosis.severity === "mild"
          ? ("mild" as const)
          : ("neutral" as const);

  const severityLabel =
    diagnosis.severity === "healthy"
      ? t("severityHealthy")
      : diagnosis.severity === "mild"
        ? t("severityMild")
        : diagnosis.severity === "moderate"
          ? t("severityModerate")
          : diagnosis.severity === "critical"
            ? t("severityCritical")
            : t("severityUnknown");

  const diseaseName = diagnosis.modelLabel ?? block.name;

  return (
    <section aria-label={t("resultsTitle")}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-heading text-xl text-foreground">{t("resultsTitle")}</h2>
      </div>

      <div className={`overflow-hidden rounded-2xl border ${statusStyles.border} bg-white shadow-sm`}>
        <div
          className={`flex items-start gap-4 p-5 ${statusStyles.background}`}
        >
          <span
            className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${statusStyles.icon}`}
          >
            {healthy ? <CheckCircleIcon size={26} /> : <AlertTriangleIcon size={26} />}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading text-xl leading-tight text-foreground">{diseaseName}</h3>
              <Pill tone={severityTone}>{severityLabel}</Pill>
            </div>
            <p className="mt-0.5 text-sm font-medium text-foreground/70">
              {t("familyLabel")}: {familyKey}
            </p>
            <p className="mt-0.5 text-sm font-medium text-foreground/70">
              {t("cropDetectedLabel")}:{" "}
              {diagnosis.crop ? t(CROP_NAME_KEYS[diagnosis.crop]) : t("cropUnknown")}
            </p>
          </div>
        </div>

        <p className="px-5 pt-4 text-[15px] leading-relaxed text-foreground/80">
          {diagnosis.modelSummary ?? block.description}
        </p>
        {diagnosis.symptoms?.length ? (
          <div className="px-5 pt-3">
            <h4 className="text-sm font-semibold text-foreground">{t("symptomsTitle")}</h4>
            <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-foreground/75">
              {diagnosis.symptoms.map((symptom, index) => (
                <li key={`${symptom}-${index}`}>{symptom}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <p className="px-5 pt-2 text-xs leading-relaxed text-foreground/55">
          {t("modelPredictionDisclaimer")}
        </p>

        {healthy ? (
          <p className="px-5 pt-2 text-sm font-medium text-severity-mild">{t("healthyNote")}</p>
        ) : null}

        <div className="mt-4 flex items-center gap-3 border-t border-border px-5 py-4">
          <div className="text-sm font-semibold text-foreground/60">{t("confidenceLabel")}</div>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              role="progressbar"
              aria-valuenow={diagnosis.confidence}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t("confidenceLabel")}
              className={`h-full rounded-full transition-all duration-700 ease-out ${statusStyles.score}`}
              style={{ width: `${diagnosis.confidence}%` }}
            />
          </div>
          <div className="font-heading text-lg font-bold text-foreground">
            {t("confidenceMatch", { confidence: diagnosis.confidence })}
          </div>
        </div>
      </div>
    </section>
  );
}