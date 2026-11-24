import { useState, type FormEvent } from "react";
import { Card } from "../i18n";
import { useI18n } from "../i18n";
import {
  AccountError,
  registerLocalAccount,
  signInLocalAccount,
  type AccountErrorKind,
} from "../lib/localAccounts";
import type { TranslationKey } from "../i18n/translations";

interface Props {
  onAuthenticated: (username: string) => Promise<void>;
}

const ERROR_KEYS: Record<AccountErrorKind, TranslationKey> = {
  "username-invalid": "authUsernameInvalid",
  "password-short": "authPasswordShort",
  "password-mismatch": "authPasswordMismatch",
  "username-taken": "authUsernameTaken",
  "invalid-credentials": "authInvalidCredentials",
  "storage-unavailable": "authStorageError",
};

export default function AuthScreen({ onAuthenticated }: Props) {
  const { t } = useI18n();
  const [creating, setCreating] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<TranslationKey | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const signedInUsername = creating
        ? await registerLocalAccount(username, password, confirmPassword)
        : await signInLocalAccount(username, password);
      await onAuthenticated(signedInUsername);
    } catch (reason) {
      setError(reason instanceof AccountError ? ERROR_KEYS[reason.kind] : "authStorageError");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setCreating((value) => !value);
    setError(null);
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center px-4 py-10">
      <Card className="w-full !p-6 sm:!p-8">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary-200/60 text-primary-700">
            <span className="font-heading text-2xl font-bold">A</span>
          </span>
          <h1 className="font-heading text-2xl text-foreground">
            {creating ? t("authCreateTitle") : t("authLoginTitle")}
          </h1>
          <p className="mt-2 text-sm text-foreground/65">{t("authSubtitle")}</p>
        </div>

        <form onSubmit={(event) => void submit(event)} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-foreground">{t("authUsername")}</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              minLength={3}
              maxLength={24}
              required
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-foreground"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-foreground">{t("authPassword")}</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={creating ? "new-password" : "current-password"}
              minLength={creating ? 8 : undefined}
              required
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-foreground"
            />
          </label>

          {creating ? (
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-foreground">
                {t("authConfirmPassword")}
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-foreground"
              />
            </label>
          ) : null}

          {error ? (
            <p role="alert" className="rounded-xl bg-severity-critical/10 px-3 py-2.5 text-sm text-severity-critical">
              {t(error)}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-primary-600 px-4 py-3 font-bold text-on-primary transition-colors hover:bg-primary-700 disabled:cursor-wait disabled:opacity-60"
          >
            {submitting
              ? t("authWorking")
              : creating
                ? t("authCreateAccount")
                : t("authLogin")}
          </button>
        </form>

        <button
          type="button"
          onClick={toggleMode}
          className="mt-4 w-full cursor-pointer rounded-lg py-2 text-sm font-semibold text-primary-700 hover:bg-primary-200/30"
        >
          {creating ? t("authSwitchToLogin") : t("authSwitchToCreate")}
        </button>

        <p className="mt-5 border-t border-border pt-4 text-center text-xs leading-relaxed text-foreground/55">
          {t("authLocalNotice")}
        </p>
      </Card>
    </main>
  );
}
