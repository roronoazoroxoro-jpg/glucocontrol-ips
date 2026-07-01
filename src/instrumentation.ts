export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.DATABASE_URL?.includes("/tmp")) {
    const { execSync } = await import("child_process");
    try {
      execSync("npx prisma db push --skip-generate", { stdio: "pipe" });
    } catch {
      // DB init on cold start
    }
  }
}
