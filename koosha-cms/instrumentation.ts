export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { seedDemoData } = await import("./src/lib/seed");
    try {
      seedDemoData();
      // eslint-disable-next-line no-console
      console.log("[koosha-cms] Database ready.");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[koosha-cms] Seeding failed:", err);
    }
  }
}
