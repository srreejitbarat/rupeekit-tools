// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PreEmiPlanner from "./PreEmiPlanner";

vi.mock("@/lib/analytics", () => ({ trackAnalyticsEvent: vi.fn() }));
const seenKey = "rupeekit:pre-emi:tour:v1";
const planKey = "rupeekit:pre-emi:plan:v1";
const originalDialog = {
  showModal: Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal"),
  close: Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "close"),
};
const originalElement = {
  scrollIntoView: Object.getOwnPropertyDescriptor(Element.prototype, "scrollIntoView"),
  scrollTo: Object.getOwnPropertyDescriptor(Element.prototype, "scrollTo"),
};
let observers: IntersectionObserverCallback[];

beforeEach(() => {
  localStorage.clear();
  observers = [];
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { observers.push(callback); }
    observe() {}
    disconnect() {}
  });
  // jsdom has no native top layer or layout. These shims exercise our lifecycle;
  // actual native focus containment and positioning require a browser check.
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value(this: HTMLDialogElement) { this.setAttribute("open", ""); },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value(this: HTMLDialogElement) { this.removeAttribute("open"); },
  });
  for (const name of ["scrollIntoView", "scrollTo"]) {
    Object.defineProperty(Element.prototype, name, { configurable: true, value: vi.fn() });
  }
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  for (const [name, descriptor] of Object.entries(originalDialog)) {
    if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
  }
  for (const [name, descriptor] of Object.entries(originalElement)) {
    if (descriptor) Object.defineProperty(Element.prototype, name, descriptor);
    else Reflect.deleteProperty(Element.prototype, name);
  }
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function revealPlanner() {
  act(() => observers[0]?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
}

describe("Optional Pre-EMI onboarding", () => {
  it("offers the first-visit invitation in view, remembers Skip, and allows reopening", async () => {
    const user = userEvent.setup();
    const page = render(<PreEmiPlanner initialMonth="2026-10" />);
    expect(screen.queryByRole("dialog")).toBeNull();
    revealPlanner();
    const invitation = await screen.findByRole("complementary", { name: "First-visit tour invitation" });
    expect(within(invitation).getByRole("button", { name: "Start tour" })).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect((screen.getByLabelText("Sanctioned loan") as HTMLInputElement).disabled).toBe(false);
    await user.click(within(invitation).getByRole("button", { name: "Skip tour" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(localStorage.getItem(seenKey)).toBe("seen");
    expect(localStorage.getItem(planKey)).toBeNull();
    page.unmount();
    observers = [];
    render(<PreEmiPlanner initialMonth="2026-10" />);
    expect(observers).toHaveLength(0);
    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Quick tour" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("walks forward and back through all sections without changing or saving the plan", async () => {
    const user = userEvent.setup();
    render(<PreEmiPlanner initialMonth="2026-10" />);
    await user.clear(screen.getByLabelText("Interest rate"));
    await user.type(screen.getByLabelText("Interest rate"), "9.25");
    await user.click(screen.getByRole("button", { name: "Quick tour" }));
    await user.click(screen.getByRole("button", { name: "Show me around" }));
    await waitFor(() => expect(document.activeElement?.id).toBe("pe-tour-title"));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByLabelText("Monthly take-home income")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect((screen.getByLabelText("Interest rate") as HTMLInputElement).value).toBe("9.25");
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("When does the builder get paid?")).toBeTruthy();
    for (let index = 0; index < 4; index++) {
      await user.click(screen.getByRole("button", { name: "Next" }));
    }
    expect(screen.getByRole("dialog").textContent).toContain("STEP 7 OF 7");
    await user.click(screen.getByRole("button", { name: "Finish tour" }));
    await waitFor(() => expect(document.activeElement?.id).toBe("pe-loanAmount"));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect((screen.getByLabelText("Interest rate") as HTMLInputElement).value).toBe("9.25");
    expect(localStorage.getItem(seenKey)).toBe("seen");
    expect(localStorage.getItem(planKey)).toBeNull();
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("handles Escape, restores the previous input tab and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<PreEmiPlanner initialMonth="2026-10" />);
    await user.click(screen.getByRole("button", { name: /Your cash/ }));
    const trigger = screen.getByRole("button", { name: "Quick tour" });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Show me around" }));
    expect(screen.getByLabelText("Sanctioned loan")).toBeTruthy();
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true }));
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    expect(screen.getByLabelText("Monthly take-home income")).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(localStorage.getItem(seenKey)).toBe("seen");
  });

  it("does not interrupt a person who starts typing before the automatic invitation", async () => {
    const user = userEvent.setup();
    render(<PreEmiPlanner initialMonth="2026-10" />);
    revealPlanner();
    await user.click(screen.getByLabelText("Sanctioned loan"));
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 700)); });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement?.id).toBe("pe-loanAmount");
    expect(localStorage.getItem(seenKey)).toBeNull();
  });

  it("keeps the manual tour usable when browser storage is blocked", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    const user = userEvent.setup();
    render(<PreEmiPlanner initialMonth="2026-10" />);
    expect(observers).toHaveLength(0);
    await user.click(screen.getByRole("button", { name: "Quick tour" }));
    await user.click(screen.getByRole("button", { name: "Close tour" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.getByLabelText("Sanctioned loan")).toBeTruthy();
  });

  it("explains unavailable results without silently repairing invalid inputs", async () => {
    const user = userEvent.setup();
    render(<PreEmiPlanner initialMonth="2026-10" />);
    await user.clear(screen.getByLabelText("Sanctioned loan"));
    await user.click(screen.getByRole("button", { name: "Quick tour" }));
    await user.click(screen.getByRole("button", { name: "Show me around" }));
    for (let index = 0; index < 3; index++) {
      await user.click(screen.getByRole("button", { name: "Next" }));
    }
    expect(await screen.findByText(/This section appears once your inputs are valid/)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Skip tour" }));
    expect((screen.getByLabelText("Sanctioned loan") as HTMLInputElement).value).toBe("");
    expect(screen.getByRole("alert").textContent).toContain("fix these inputs");
  });
});
