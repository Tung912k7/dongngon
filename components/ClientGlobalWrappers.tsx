"use client";

import dynamic from "next/dynamic";
import { ReactNode, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

import { LazyMotion } from "framer-motion";

const WelcomeNotification = dynamic(() => import("@/components/WelcomeNotification"), { ssr: false });
const SmoothScroll = dynamic(() => import("@/components/SmoothScroll"), { ssr: false });
const ChangelogModal = dynamic(() => import("@/components/ChangelogModal"), { ssr: false });
const loadFeatures = () => import("@/lib/framer-features").then(res => res.default);
const AUTO_LOGOUT_INACTIVE_DAYS = 30;
const AUTO_LOGOUT_INACTIVE_MS = AUTO_LOGOUT_INACTIVE_DAYS * 24 * 60 * 60 * 1000;
const LAST_ACTIVE_AT_KEY = "dongngon:last-active-at";

type ModalVisibilityInput = {
  hasUser: boolean;
  hasAcknowledgedWelcomeMessage: boolean;
  isWelcomeEnabled: boolean;
  suppressWelcomeForSession: boolean;
  isUiStateLoading: boolean;
};

type GlobalModalKey = "welcome" | "changelog";

export function resolveGlobalModalQueue({
  hasUser,
  hasAcknowledgedWelcomeMessage,
  isWelcomeEnabled,
  suppressWelcomeForSession,
  isUiStateLoading,
}: ModalVisibilityInput) {
  const queue: GlobalModalKey[] = [];

  if (!isUiStateLoading) {
    const shouldQueueWelcome =
      !suppressWelcomeForSession &&
      hasAcknowledgedWelcomeMessage === false &&
      isWelcomeEnabled;

    const shouldQueueChangelog = hasUser;

    if (shouldQueueWelcome) {
      queue.push("welcome");
    }

    if (shouldQueueChangelog) {
      queue.push("changelog");
    }
  }

  const activeModal = queue[0] ?? null;
  const shouldShowWelcome = activeModal === "welcome";
  const shouldShowChangelog = activeModal === "changelog";

  return {
    queue,
    activeModal,
    shouldShowWelcome,
    shouldShowChangelog,
  };
}

export function ClientGlobalWrappers({ 
  children 
}: { 
  children: ReactNode 
}) {
  const [hasAcknowledgedWelcomeMessage, setHasAcknowledgedWelcomeMessage] = useState(true);
  const [lastSeenChangelog, setLastSeenChangelog] = useState<string | null>(null);
  const [hasUser, setHasUser] = useState(false);
  const [isWelcomeEnabled, setIsWelcomeEnabled] = useState(true);
  const [suppressWelcomeForSession, setSuppressWelcomeForSession] = useState(false);
  const [isUiStateLoading, setIsUiStateLoading] = useState(true);
  const { shouldShowWelcome, shouldShowChangelog } = resolveGlobalModalQueue({
    hasUser,
    hasAcknowledgedWelcomeMessage,
    isWelcomeEnabled,
    suppressWelcomeForSession,
    isUiStateLoading,
  });

  useEffect(() => {
    const supabase = createClient();

    const loadUiState = async (userOverride?: { id: string } | null) => {
      setIsUiStateLoading(true);

      const currentUser = userOverride === undefined
        ? (await supabase.auth.getSession()).data.session?.user ?? null
        : userOverride;

      if (!currentUser) {
        setHasUser(false);
        setHasAcknowledgedWelcomeMessage(true);
        setLastSeenChangelog(null);
        setIsWelcomeEnabled(true);
        setSuppressWelcomeForSession(false);
        setIsUiStateLoading(false);
        return;
      }

      setHasUser(true);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("has_acknowledged_welcome_message, last_seen_changelog")
        .eq("id", currentUser.id)
        .single();

      const { data: flagsData } = await supabase
        .from("app_config")
        .select("key, value")
        .in("key", ["onboarding_welcome_enabled"]);

      const welcomeFlag = Array.isArray(flagsData)
        ? flagsData.find((item) => item.key === "onboarding_welcome_enabled")
        : null;
      const welcomeEnabled =
        welcomeFlag &&
        typeof welcomeFlag.value === "object" &&
        welcomeFlag.value !== null &&
        "enabled" in welcomeFlag.value
          ? Boolean((welcomeFlag.value as { enabled?: unknown }).enabled === true)
          : true;

      setIsWelcomeEnabled(welcomeEnabled);

      if (error) {
        console.error("[ClientGlobalWrappers] Profile fetch error:", error.code, error.message);
        setHasAcknowledgedWelcomeMessage(true);
        setLastSeenChangelog(null);
        setIsUiStateLoading(false);
        return;
      }

      setHasAcknowledgedWelcomeMessage(profile?.has_acknowledged_welcome_message ?? true);
      setLastSeenChangelog(profile?.last_seen_changelog ?? null);
      setIsUiStateLoading(false);
    };

    loadUiState();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadUiState(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!hasUser) {
      localStorage.removeItem(LAST_ACTIVE_AT_KEY);
      return;
    }

    const supabase = createClient();
    const now = Date.now();
    const rawLastActiveAt = localStorage.getItem(LAST_ACTIVE_AT_KEY);
    const parsedLastActiveAt = rawLastActiveAt ? Number(rawLastActiveAt) : NaN;
    const hasValidLastActiveAt = Number.isFinite(parsedLastActiveAt) && parsedLastActiveAt > 0;

    if (hasValidLastActiveAt && now - parsedLastActiveAt > AUTO_LOGOUT_INACTIVE_MS) {
      void (async () => {
        await supabase.auth.signOut();
        localStorage.removeItem(LAST_ACTIVE_AT_KEY);
        window.location.href = "/dang-nhap?reason=inactive-days";
      })();
      return;
    }

    const persistLastActiveAt = () => {
      localStorage.setItem(LAST_ACTIVE_AT_KEY, String(Date.now()));
    };

    persistLastActiveAt();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        persistLastActiveAt();
      }
    };

    const handlePageHide = () => {
      persistLastActiveAt();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [hasUser]);

  const handleOnboardingSeen = () => {
    setHasAcknowledgedWelcomeMessage(true);
    setSuppressWelcomeForSession(true);
  };

  const handleWelcomeDeferred = () => {
    setSuppressWelcomeForSession(true);
  };

  return (
    <LazyMotion features={loadFeatures} strict>
      <SmoothScroll>
        {children}
        {shouldShowWelcome && (
          <WelcomeNotification
            onOnboardingSeen={handleOnboardingSeen}
            onDeferred={handleWelcomeDeferred}
          />
        )}
        {shouldShowChangelog && <ChangelogModal lastSeenVersion={lastSeenChangelog ?? null} />}
      </SmoothScroll>
    </LazyMotion>
  );
}
