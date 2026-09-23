import { renderToBuffer } from "@react-pdf/renderer";
import PreEmiReport from "@/components/pre-emi/PreEmiReport";
import {
  parseReportRequest,
  ReportRequestError,
} from "@/lib/pre-emi/report-request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Bound expensive rendering per Node process. No plans or identifiers are cached.
let activeReports = 0;
const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function POST(request: Request) {
  let rendering = false;
  try {
    const plan = await parseReportRequest(request);
    // Reserve a render slot only after the body has arrived and passed validation.
    if (activeReports >= 2)
      return Response.json(
        { error: "Report service busy. Please retry shortly." },
        { status: 503, headers: { ...privateHeaders, "Retry-After": "5" } },
      );
    activeReports += 1;
    rendering = true;
    const buffer = await renderToBuffer(PreEmiReport(plan));
    return new Response(new Uint8Array(buffer), {
      headers: {
        ...privateHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="RupeeKit-pre-EMI-plan.pdf"',
      },
    });
  } catch (error) {
    if (error instanceof ReportRequestError)
      return Response.json(
        { error: error.message },
        { status: error.status, headers: privateHeaders },
      );
    return Response.json(
      { error: "Could not generate the report. Please try again." },
      { status: 500, headers: privateHeaders },
    );
  } finally {
    if (rendering) activeReports -= 1;
  }
}
