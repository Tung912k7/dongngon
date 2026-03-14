import { describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import WelcomeNotification from "@/components/WelcomeNotification";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("WelcomeNotification", () => {
  it("renders the welcome onboarding copy", () => {
    const html = renderToStaticMarkup(React.createElement(WelcomeNotification));

    expect(html).toContain("Chào mừng bạn đến với");
    expect(html).toContain("Tận hưởng những trải nghiệm tuyệt vời tại đây nhé!!!");
    expect(html).toContain("Bắt đầu");
    expect(html).toContain("Hướng dẫn sử dụng");
  });
});
