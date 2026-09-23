import { MODES, parsePlan, type PaymentMode } from "./engine";

export class ReportRequestError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export async function parseReportRequest(request: Request) {
  if (
    request.headers.get("content-type")?.split(";")[0].trim() !==
    "application/json"
  )
    throw new ReportRequestError("Send a JSON plan.", 415);
  const limit = 32000;
  const length = Number(request.headers.get("content-length"));
  if (length > limit) throw new ReportRequestError("Plan is too large.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new ReportRequestError("Missing plan.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new ReportRequestError("Plan is too large.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  let raw: unknown;
  try {
    raw = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw new ReportRequestError("Invalid JSON plan.");
  }
  if (!raw || typeof raw !== "object")
    throw new ReportRequestError("Invalid plan.");
  const data = raw as { version?: unknown; mode?: unknown; input?: unknown };
  if (data.version !== 1 || !MODES.includes(data.mode as PaymentMode))
    throw new ReportRequestError("Unsupported plan version or payment mode.");
  try {
    return { input: parsePlan(data.input), mode: data.mode as PaymentMode };
  } catch {
    throw new ReportRequestError(
      "The plan contains invalid inputs. Please check the calculator.",
    );
  }
}
