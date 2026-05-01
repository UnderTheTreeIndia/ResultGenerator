import puppeteer, { type Browser } from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

const CHROMIUM_PACK_URL =
  process.env.CHROMIUM_PACK_URL ||
  "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar";

export interface BrowserHandle {
  browser: Browser;
  close(): Promise<void>;
}

function isServerless(): boolean {
  return !!process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME != null;
}

async function findLocalChrome(): Promise<string | null> {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const { existsSync } = await import("node:fs");
  const candidates = [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

export async function launchBrowser(): Promise<BrowserHandle> {
  let browser: Browser;
  if (isServerless()) {
    browser = (await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(CHROMIUM_PACK_URL),
      headless: chromium.headless,
    })) as unknown as Browser;
  } else {
    const exec = await findLocalChrome();
    if (!exec) {
      throw new Error(
        "Local Chrome/Chromium not found. Install Chrome or set CHROME_PATH.",
      );
    }
    browser = await puppeteer.launch({
      executablePath: exec,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return { browser, close: () => browser.close() };
}

export async function renderPdf(
  browser: Browser,
  html: string,
): Promise<Buffer> {
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}
