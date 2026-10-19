import { describe, expect, it, vi } from "vitest";
import { contactLink, openContact } from "./contact";

describe("WhatsApp contact", () => {
  it("uses the official phone number", () => {
    expect(new URL(contactLink()).pathname).toBe("/5511941750989");
  });

  it("retains the user's name and company in the message", () => {
    const message = new URL(contactLink("Otavio Toledo", "Blink")).searchParams.get("text");
    expect(message).toContain("Sou Otavio Toledo, da Blink.");
  });

  it("opens outside the embedded page without default iframe navigation", () => {
    const open = vi.fn();
    vi.stubGlobal("window", { open });
    try {
      const preventDefault = vi.fn();
      const href = contactLink("Otavio Toledo");
      openContact({ preventDefault, currentTarget: { href } });
      expect(preventDefault).toHaveBeenCalledOnce();
      expect(open).toHaveBeenCalledWith(href, "_blank", "noopener,noreferrer");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});