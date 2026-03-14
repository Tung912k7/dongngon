import { describe, expect, it } from "vitest";

import { resolveGlobalModalQueue } from "@/components/ClientGlobalWrappers";

describe("resolveGlobalModalQueue", () => {
  it("hides both modals while profile state is still loading", () => {
    const visibility = resolveGlobalModalQueue({
      hasUser: true,
      hasAcknowledgedWelcomeMessage: true,
      isWelcomeEnabled: true,
      suppressWelcomeForSession: false,
      isUiStateLoading: true,
    });

    expect(visibility.queue).toEqual([]);
    expect(visibility.activeModal).toBeNull();
    expect(visibility.shouldShowWelcome).toBe(false);
    expect(visibility.shouldShowChangelog).toBe(false);
  });

  it("prioritizes welcome over changelog for new users", () => {
    const visibility = resolveGlobalModalQueue({
      hasUser: true,
      hasAcknowledgedWelcomeMessage: false,
      isWelcomeEnabled: true,
      suppressWelcomeForSession: false,
      isUiStateLoading: false,
    });

    expect(visibility.queue).toEqual(["welcome", "changelog"]);
    expect(visibility.activeModal).toBe("welcome");
    expect(visibility.shouldShowWelcome).toBe(true);
    expect(visibility.shouldShowChangelog).toBe(false);
  });

  it("shows changelog only after welcome is not shown", () => {
    const visibility = resolveGlobalModalQueue({
      hasUser: true,
      hasAcknowledgedWelcomeMessage: true,
      isWelcomeEnabled: true,
      suppressWelcomeForSession: false,
      isUiStateLoading: false,
    });

    expect(visibility.queue).toEqual(["changelog"]);
    expect(visibility.activeModal).toBe("changelog");
    expect(visibility.shouldShowWelcome).toBe(false);
    expect(visibility.shouldShowChangelog).toBe(true);
  });
});
