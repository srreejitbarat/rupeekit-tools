// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PreEmiPlanner from "./PreEmiPlanner";

vi.mock("@/lib/analytics", () => ({ trackAnalyticsEvent: vi.fn() }));
beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("Pre-EMI planner user journeys", () => {
  it("switches strategies and shows the cash reserve trade-off", async () => {
    const user = userEvent.setup();
    render(<PreEmiPlanner initialMonth="2026-10" />);
    expect(
      screen.getByRole("heading", { name: "Your lowest cash balance" }),
    ).toBeTruthy();
    await user.click(
      screen.getByRole("button", { name: /EMI on full sanction/ }),
    );
    expect(
      screen.getByRole("heading", { name: "Your largest reserve shortfall" }),
    ).toBeTruthy();
    expect(screen.getAllByText("₹2,66,735").length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: /Pre-EMI first/ }));
    await user.click(screen.getByRole("button", { name: /\+6 months/ }));
    expect(screen.getByText("Possession: Apr 2029")).toBeTruthy();
  });
  it("pauses results and exports for invalid loan values, then recovers", async () => {
    const user = userEvent.setup();
    render(<PreEmiPlanner initialMonth="2026-10" />);
    const loan = screen.getByLabelText("Sanctioned loan");
    await user.clear(loan);
    expect(screen.getByRole("alert").textContent).toContain("fix these inputs");
    expect(
      screen.queryByRole("button", { name: "Download PDF report" }),
    ).toBeNull();
    await user.type(loan, "6000000");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Download PDF report" }),
    ).toBeTruthy();
  });
  it("validates tranche totals after removing a stage and supports repairing the schedule", async () => {
    const user = userEvent.setup();
    render(<PreEmiPlanner initialMonth="2026-10" />);
    await user.click(screen.getByRole("button", { name: /Tranches/ }));
    await user.click(screen.getByRole("button", { name: "Remove tranche 1" }));
    expect(screen.getByRole("alert").textContent).toContain("100%");
    const percentage = screen.getAllByLabelText("Loan drawn")[0];
    await user.clear(percentage);
    await user.type(percentage, "40");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText("Allocated: 100.0%")).toBeTruthy();
  });
  it("saves only on request and restores a plan after resetting the example", async () => {
    const user = userEvent.setup();
    render(<PreEmiPlanner initialMonth="2026-10" />);
    const rate = screen.getByLabelText("Interest rate");
    await user.clear(rate);
    await user.type(rate, "9.5");
    expect(localStorage.length).toBe(0);
    await user.click(
      screen.getByRole("button", { name: "Save on this browser" }),
    );
    expect(localStorage.length).toBe(1);
    await user.click(screen.getByRole("button", { name: "Reset example" }));
    await user.click(screen.getByRole("button", { name: "Reset inputs" }));
    expect(
      (screen.getByLabelText("Interest rate") as HTMLInputElement).value,
    ).toBe("8.5");
    await user.click(
      screen.getByRole("button", { name: "Restore saved plan" }),
    );
    expect(
      (screen.getByLabelText("Interest rate") as HTMLInputElement).value,
    ).toBe("9.5");
    await user.click(screen.getByRole("button", { name: "Clear saved copy" }));
    expect(localStorage.length).toBe(0);
  });
  it("can combine a rate rise and an income interruption", async () => {
    const user = userEvent.setup();
    render(<PreEmiPlanner initialMonth="2026-10" />);
    await user.click(screen.getByRole("button", { name: /\+1% rate rise/ }));
    await user.click(
      screen.getByRole("button", { name: /3 months without income/ }),
    );
    expect(
      screen.getByText(/Active: 0 months’ delay · \+1% points/).textContent,
    ).toContain("3 months without income");
    expect(
      screen
        .getByRole("button", { name: /\+1% rate rise/ })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });
  it("handles a busy report service without losing the plan or leaving export disabled", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<PreEmiPlanner initialMonth="2026-10" />);
    await user.click(
      screen.getByRole("button", { name: "Download PDF report" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toContain(
        "service is busy",
      ),
    );
    expect(
      (
        screen.getByRole("button", {
          name: "Download PDF report",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.version).toBe(1);
    expect(body.input.loanAmount).toBe(6000000);
    expect(
      screen.getByRole("heading", { name: "Your lowest cash balance" }),
    ).toBeTruthy();
  });
});
