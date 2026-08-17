import { NextResponse } from "next/server";
import { sendReminders } from "@/lib/reminders";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  const secret = process.env.KUDA_POLL_SECRET;
  if (secret && !isVercelCron) {
    const provided = request.headers.get("x-kuda-secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    const res = await sendReminders();
    return NextResponse.json(res);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "reminder sweep failed" },
      { status: 500 }
    );
  }
}