import { useEffect, useRef, useState } from "react";
import { GlobeIcon, LeafIcon, UserIcon } from "./icons";
import { LANGUAGES } from "../i18n/translations";
import { useI18n } from "../i18n";

interface Props {
  username?: string | null;
  onSignOut?: () => void;
}

/** Sticky top bar: brand + language switcher. */
export default function TopBar({ username, onSignOut }: Props) {
  const { lang, setLang, t } = useI18n();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !profileRef.current?.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [profileOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-on-primary shadow-sm">
            <LeafIcon size={20} />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate font-heading text-lg text-foreground">
              {t("brand")}
            </p>
            <p className="hidden truncate text-xs text-foreground/55 sm:block">
              {t("tagline")}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <label className="flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-2 text-sm font-semibold text-foreground">
            <GlobeIcon size={16} className="text-primary-600" />
            <span className="sr-only">{t("language")}</span>
            <select
              aria-label={t("language")}
              value={lang}
              onChange={(e) => setLang(e.target.value as typeof lang)}
              className="cursor-pointer appearance-none bg-transparent text-sm font-semibold text-foreground focus-visible:outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>

          {username ? (
            <div ref={profileRef} className="relative">
              <button
                type="button"
                aria-label={t("profileTitle")}
                aria-expanded={profileOpen}
                aria-controls="profile-menu"
                onClick={() => setProfileOpen((open) => !open)}
                className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-primary-300 bg-primary-200/50 text-primary-800 transition-colors hover:bg-primary-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                <UserIcon size={20} />
              </button>
              {profileOpen ? (
                <div
                  id="profile-menu"
                  role="dialog"
                  aria-label={t("profileTitle")}
                  className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-border bg-white p-4 shadow-xl"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground/45">
                    {t("profileTitle")}
                  </p>
                  <p className="mt-1 truncate font-heading text-lg text-foreground">{username}</p>
                  <p className="mt-2 text-xs leading-relaxed text-foreground/55">{t("profileLocal")}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onSignOut?.();
                    }}
                    className="mt-3 min-h-10 w-full cursor-pointer rounded-xl border border-border px-3 py-2 text-sm font-bold text-foreground hover:bg-muted"
                  >
                    {t("profileSignOut")}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}