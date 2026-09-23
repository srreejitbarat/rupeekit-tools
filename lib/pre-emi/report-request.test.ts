import { describe, expect, it } from "vitest";
import { createDefaultPlan } from "./engine";
import { parseReportRequest } from "./report-request";

const request = (
  body: string,
  headers: Record<string, string> = { "content-type": "application/json" },
) =>
  new Request("https://www.rupeekit.co.in/api/pre-emi/report", {
    method: "POST",
    headers,
    body,
  });
describe("PDF request boundary", () => {
  it("accepts a versioned plan and strips unknown fields", async () => {
    const parsed = await parseReportRequest(
      request(
        JSON.stringify({
          version: 1,
          mode: "pre-emi",
          input: { ...createDefaultPlan(), unexpected: "discard" },
        }),
      ),
    );
    expect(parsed.mode).toBe("pre-emi");
    expect(parsed.input.loanAmount).toBe(6000000);
    expect("unexpected" in parsed.input).toBe(false);
  });
  it("rejects wrong media types, malformed JSON, invalid modes and invalid inputs", async () => {
    await expect(
      parseReportRequest(request("{}", { "content-type": "text/plain" })),
    ).rejects.toMatchObject({ status: 415 });
    for (const body of [
      "{",
      "null",
      JSON.stringify({
        version: 1,
        mode: "unknown",
        input: createDefaultPlan(),
      }),
      JSON.stringify({ version: 1, mode: "pre-emi", input: {} }),
    ])
      await expect(parseReportRequest(request(body))).rejects.toMatchObject({
        status: 400,
      });
  });
  it("rejects oversized bodies even when Content-Length is absent or understated", async () => {
    const cases: Record<string, string>[] = [
      { "content-type": "application/json" },
      { "content-type": "application/json", "content-length": "2" },
      { "content-type": "application/json", "content-length": "40000" },
    ];
    for (const headers of cases)
      await expect(
        parseReportRequest(request(" ".repeat(33000), headers)),
      ).rejects.toMatchObject({ status: 413 });
  });
});
