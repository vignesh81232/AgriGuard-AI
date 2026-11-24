import { useEffect, useState } from "react";
import TopBar from "./components/TopBar";
import CaptureCard from "./components/CaptureCard";
import AuthScreen from "./components/AuthScreen";
import ResultsSummary from "./components/ResultsSummary";
import ResultsDashboard from "./components/ResultsDashboard";
import StoreLocator from "./components/StoreLocator";
import { getDisease, getLocalized } from "./data/diseases";
import type { Crop, TranslationKey } from "./i18n/translations";
import type { Diagnosis } from "./lib/diagnose";
import {
  getLocalSession,
  loadDiagnosisHistory,
  saveDiagnosisForAccount,
  signOutLocalAccount,
  type DiagnosisHistoryEntry,
} from "./lib/localAccounts";
import { useI18n } from "./i18n";
import { WifiOffIcon, ArrowDownIcon, EditIcon, LeafIcon } from "./components/icons";

const CROP_KEYS: Record<Crop, TranslationKey> = {
  tomato: "cropTomato",
  corn: "cropCorn",
  potato: "cropPotato",
  rice: "cropRice",
};

/**
 * AgriGuard AI — mobile-first leaf disease diagnoser (hackathon MVP).
 * Diagnose path: capture → simulated engine → summary → dashboard → remedies
 * store locator. Accounts and history are kept in this browser.
 */
export default function App() {
  const { t, lang } = useI18n();
  const [username, setUsername] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [history, setHistory] = useState<DiagnosisHistoryEntry[]>([]);
  const [historySaveError, setHistorySaveError] = useState(false);
  const [captureKey, setCaptureKey] = useState(0);
  const [offline, setOffline] = useState<boolean>(() => !navigator.onLine);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const signedInUser = await getLocalSession();
        if (!signedInUser) return;
        const entries = await loadDiagnosisHistory(signedInUser);
        if (!active) return;
        setUsername(signedInUser);
        setHistory(entries);
        setDiagnosis(entries[0]?.diagnosis ?? null);
      } catch {
        if (active) setStorageError(true);
      } finally {
        if (active) setAuthReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const handleAuthenticated = async (signedInUser: string) => {
    const entries = await loadDiagnosisHistory(signedInUser);
    setUsername(signedInUser);
    setHistory(entries);
    setDiagnosis(entries[0]?.diagnosis ?? null);
    setStorageError(false);
  };

  const handleDiagnose = async (result: Diagnosis) => {
    if (!username) return;
    setDiagnosis(result);
    setOffline(false);
    setHistorySaveError(false);
    try {
      const entry = await saveDiagnosisForAccount(username, result);
      setHistory((previous) => [entry, ...previous]);
    } catch {
      setHistorySaveError(true);
    }
  };

  const handleSignOut = () => {
    try {
      signOutLocalAccount();
      setUsername(null);
      setHistory([]);
      setDiagnosis(null);
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  };

  return (
    <div className="bg-canvas min-h-screen">
      <TopBar username={username} onSignOut={handleSignOut} />

      {!authReady ? (
        <main className="mx-auto max-w-md px-4 py-16 text-center text-sm text-foreground/60">
          {t("authLoading")}
        </main>
      ) : !username ? (
        <>
          {storageError ? (
            <p role="alert" className="mx-auto mt-4 max-w-md px-4 text-sm text-severity-critical">
              {t("authStorageError")}
            </p>
          ) : null}
          <AuthScreen onAuthenticated={handleAuthenticated} />
        </>
      ) : (
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 pb-12 pt-5 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="h-fit max-h-[calc(100vh-6rem)] overflow-y-auto py-3 lg:sticky lg:top-20">
            <nav aria-label={t("siteNavigation")} className="space-y-1">
              <a
                href="#app-home"
                className="flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-bold text-foreground/70 transition-colors hover:bg-muted"
              >
                {t("navHome")}
              </a>
              <button
                type="button"
                onClick={() => {
                  setDiagnosis(null);
                  setHistorySaveError(false);
                  setCaptureKey((key) => key + 1);
                  document.getElementById("app-home")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex min-h-11 w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left text-sm font-semibold text-foreground/80 transition-colors hover:bg-muted"
              >
                <EditIcon size={17} className="mr-2 shrink-0" />
                {t("navNewConversation")}
              </button>
            </nav>

            <section className="mt-5 pt-1" aria-labelledby="recents-heading">
              <h2
                id="recents-heading"
                className="mb-2 px-3 text-xs font-bold uppercase tracking-wide text-foreground/50"
              >
                {t("navRecents")}
              </h2>
              {history.length === 0 ? (
                <p className="px-3 py-2 text-sm leading-relaxed text-foreground/55">{t("historyEmpty")}</p>
              ) : (
                <ul className="space-y-1">
                  {history.map((entry) => {
                    const disease = getLocalized(getDisease(entry.diagnosis.diseaseId), lang);
                    const cropLabel = entry.diagnosis.crop
                      ? t(CROP_KEYS[entry.diagnosis.crop])
                      : t("historyCropUnknown");
                    const date = new Intl.DateTimeFormat(lang, {
                      dateStyle: "medium",
                    }).format(entry.createdAt);
                    return (
                      <li key={entry.id}>
                        <button
                          type="button"
                          aria-label={`${t("historyOpen")}: ${disease.name}`}
                          aria-pressed={diagnosis === entry.diagnosis}
                          onClick={() => {
                            setDiagnosis(entry.diagnosis);
                            document.getElementById("app-home")?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className={`w-full cursor-pointer border-l-2 px-3 py-2 text-left transition-colors ${
                            diagnosis === entry.diagnosis
                              ? "border-primary text-primary-800"
                              : "border-transparent text-foreground/75 hover:border-border hover:text-foreground"
                          }`}
                        >
                          <span className="block truncate text-sm font-semibold">{disease.name}</span>
                          <span className="mt-0.5 block truncate text-xs text-foreground/50">
                            {cropLabel} · {date}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </aside>

          <main id="app-home" className="mx-auto w-full max-w-2xl min-w-0 px-0 pb-8 pt-1">
            {!diagnosis ? (
              <section className="mb-6 text-center">
                <p className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary-300 bg-primary-200/50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-800">
                  <LeafIcon size={14} />
                  {t("heroBadge")}
                </p>
                <h1 className="font-heading text-3xl leading-tight text-foreground">{t("heroTitle")}</h1>
                <p className="mx-auto mt-2 max-w-md text-base text-foreground/70">{t("heroSubtitle")}</p>
              </section>
            ) : null}

            {offline && diagnosis ? (
              <div
                role="status"
                className="mb-5 flex items-start gap-3 rounded-2xl border border-severity-moderate/40 bg-severity-moderate/10 px-4 py-3 text-sm text-foreground"
              >
                <WifiOffIcon size={18} className="mt-0.5 shrink-0 text-severity-moderate" />
                <p>
                  <strong className="font-semibold">{t("offlineTitle")}.</strong>{" "}
                  {t("offlineBody")}
                </p>
              </div>
            ) : null}

            {historySaveError ? (
              <p role="alert" className="mb-4 rounded-xl bg-severity-critical/10 px-4 py-3 text-sm text-severity-critical">
                {t("historySaveError")}
              </p>
            ) : null}

            {!diagnosis ? (
              <CaptureCard
                key={captureKey}
                busy={!!offline}
                onDiagnose={(result) => void handleDiagnose(result)}
              />
            ) : null}

            {diagnosis ? (
              <div className="mt-2">
                <ResultsSummary diagnosis={diagnosis} />
                <ResultsDashboard diagnosis={diagnosis} />
                <StoreLocator crop={diagnosis.crop} />
              </div>
            ) : (
              <section className="mt-8">
                <div className="mb-4 flex items-center gap-2 text-foreground/45">
                  <ArrowDownIcon size={16} />
                  <h2 className="font-heading text-sm uppercase tracking-widest">{t("resultsTitle")}</h2>
                </div>
                <div className="rounded-2xl border border-border bg-white p-10 text-center shadow-sm">
                  <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary-200/50 text-primary-700">
                    <LeafIcon size={24} />
                  </span>
                  <h3 className="font-heading text-lg text-foreground">{t("emptyTitle")}</h3>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-foreground/60">{t("emptyBody")}</p>
                </div>
              </section>
            )}

            {!diagnosis ? (
              <footer className="mt-12 border-t border-border pt-6 text-center text-xs text-foreground/55">
                <p className="font-semibold">{t("footerNote")}</p>
                <p className="mx-auto mt-1 max-w-md">{t("footerDisclaimer")}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-primary-600">
                  <WifiOffIcon size={14} />
                  {t("worksOffline")}
                </p>
              </footer>
            ) : null}
          </main>
        </div>
      )}
    </div>
  );
}