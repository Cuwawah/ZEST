export default async () => {
  const base = process.env.URL || process.env.APP_URL;
  try {
    const res = await fetch(`${base}/api/reminders`, {
      headers: { "x-kuda-secret": process.env.KUDA_POLL_SECRET },
    });
    const body = await res.text();
    console.log(`booking-reminders: ${res.status} ${body.slice(0, 200)}`);
  } catch (err) {
    console.error("booking-reminders failed:", err.message);
  }
  return new Response("ok");
};

export const config = {
  schedule: "0 * * * *",
};