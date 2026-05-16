// scripts/dev.js — Run this instead of "npm run dev"
// It starts Next.js AND opens Chrome in --app mode (no browser UI, standalone window)
// Usage: node scripts/dev.js
//
// Drop into: scripts/dev.js (at your project root, same level as frontend/)

const { spawn, exec } = require("child_process");
const http = require("http");
const path = require("path");
const os   = require("os");

const PORT   = 3000;
const URL    = `http://localhost:${PORT}`;
const TITLE  = "FIFA World Cup 2026";

// ── Detect Chrome/Edge path by OS ──
function getBrowserCmd() {
  const platform = os.platform();

  if (platform === "win32") {
    // Windows: try Chrome then Edge
    const opts = [
      `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"`,
      `"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"`,
      `"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"`,
      `"C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"`,
    ];
    return { cmd: opts[0], args: [`--app=${URL}`, `--window-size=1400,900`, `--window-position=60,40`] };
  }

  if (platform === "darwin") {
    // macOS
    return {
      cmd: "open",
      args: ["-a", "Google Chrome", "--args", `--app=${URL}`, "--window-size=1400,900"],
    };
  }

  // Linux
  return {
    cmd: "google-chrome",
    args: [`--app=${URL}`, "--window-size=1400,900"],
  };
}

// ── Wait for Next.js to be ready, then open browser ──
function waitAndOpen(retries = 30) {
  http.get(URL, () => {
    console.log(`\n✅ App ready — opening ${TITLE} in standalone window...\n`);
    const { cmd, args } = getBrowserCmd();
    const proc = spawn(cmd, args, { detached: true, stdio: "ignore", shell: process.platform === "win32" });
    proc.unref();
  }).on("error", () => {
    if (retries > 0) {
      setTimeout(() => waitAndOpen(retries - 1), 1000);
    } else {
      console.log(`\n⚠️  Could not auto-open browser. Manually go to: ${URL}\n`);
    }
  });
}

// ── Start Next.js dev server ──
console.log("🚀 Starting FIFA World Cup 2026 AI Companion...\n");

const frontendDir = path.join(__dirname, "..", "frontend");

const isWin = process.platform === "win32";
const next = spawn(
  "npm",
  ["run", "dev"],
  { cwd: frontendDir, stdio: "inherit", shell: isWin }
);

next.on("error", err => {
  console.error("Failed to start Next.js:", err.message);
  process.exit(1);
});

// Give Next.js 2 seconds head-start, then poll until ready
setTimeout(() => waitAndOpen(), 2000);

// ── Graceful shutdown ──
process.on("SIGINT",  () => { next.kill(); process.exit(0); });
process.on("SIGTERM", () => { next.kill(); process.exit(0); });
