export async function register() {
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.KUDA_IN_PROCESS_POLL === "1"
  ) {
    const { startKudaPoller } = await import("./lib/kuda/poller");
    startKudaPoller();
  }
}