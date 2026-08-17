import { NextResponse } from "next/server";
import { pollOnce, kudaEnabled } from "@/lib/kuda/poller";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!kudaEnabled()) {
    return NextResponse.json({ error: "kuda not enabled" }, { status: 400 });
  }

  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  const secret = process.env.KUDA_POLL_SECRET;
  if (secret && !isVercelCron) {
    const provided = request.headers.get("x-kuda-secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    const res = await pollOnce();
    return NextResponse.json(res);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "poll failed" },
      { status: 500 }
    );
  }
}