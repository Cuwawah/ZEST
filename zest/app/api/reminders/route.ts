import { NextResponse } from "next/server";
import { sendReminders } from "@/lib/reminders";
import { checkCronAuth } from "@/lib/cronAuth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = checkCronAuth(request.headers);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
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