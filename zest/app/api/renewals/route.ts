import { NextResponse } from "next/server";
import { runRenewalSweep } from "@/lib/subscription";
import { checkCronAuth } from "@/lib/cronAuth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = checkCronAuth(request.headers);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const counts = await runRenewalSweep();
    return NextResponse.json(counts);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "renewal sweep failed" },
      { status: 500 }
    );
  }
}
