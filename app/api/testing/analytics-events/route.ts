import { NextResponse } from "next/server";

import {
  getAnalyticsTestEvents,
  resetAnalyticsTestEvents
} from "@/lib/analytics/track";

export const dynamic = "force-dynamic";

function isAnalyticsTestModeEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.ANALYTICS_TEST_MODE === "1";
}

export async function GET() {
  if (!isAnalyticsTestModeEnabled()) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    data: {
      events: getAnalyticsTestEvents()
    }
  });
}

export async function DELETE() {
  if (!isAnalyticsTestModeEnabled()) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  resetAnalyticsTestEvents();
  return NextResponse.json({
    ok: true,
    data: {
      cleared: true
    }
  });
}
