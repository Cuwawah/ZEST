import { NextResponse } from "next/server";
import { pollOnce, kudaEnabled } from "@/lib/kuda/poller";
import { checkCronAuth } from "@/lib/cronAuth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = checkCronAuth(request.headers);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!kudaEnabled()) {
    return NextResponse.json({ error: "kuda not enabled" }, { status: 400 });
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