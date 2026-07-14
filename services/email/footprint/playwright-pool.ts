import { chromium, Browser, BrowserContext, Page } from "playwright";

// ─── Stealth launch args ──────────────────────────────────────────────────────
// These mimic a real Chrome installation and defeat common fingerprinting checks.
const STEALTH_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-blink-features=AutomationControlled",
  "--disable-infobars",
  "--disable-dev-shm-usage",
  "--disable-accelerated-2d-canvas",
  "--no-first-run",
  "--no-zygote",
  "--disable-gpu",
  "--window-size=1280,800",
  "--lang=en-US,en",
];

let _browser: Browser | null = null;
let _launching = false;
let _launchQueue: Array<(b: Browser) => void> = [];

async function getBrowser(): Promise<Browser> {
  if (_browser && _browser.isConnected()) return _browser;

  if (_launching) {
    return new Promise((resolve) => _launchQueue.push(resolve));
  }

  _launching = true;
  _browser = await chromium.launch({
    headless: true,
    args: STEALTH_ARGS,
  });

  _launching = false;
  const waiting = _launchQueue.splice(0);
  for (const resolve of waiting) resolve(_browser!);

  return _browser;
}

// ─── Stealth init script ──────────────────────────────────────────────────────
// Patches navigator.webdriver and other automation signals.
const STEALTH_SCRIPT = `
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
  Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
  window.chrome = { runtime: {} };
`;

/**
 * Run an async function with a fresh isolated browser context + page.
 * The context (and all its cookies/storage) is destroyed after `fn` returns.
 */
export async function withPage<T>(
  fn: (page: Page) => Promise<T>
): Promise<T> {
  const browser = await getBrowser();
  let context: BrowserContext | null = null;
  try {
    context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 },
      locale: "en-US",
      timezoneId: "America/New_York",
      extraHTTPHeaders: {
        "accept-language": "en-US,en;q=0.9",
      },
    });

    // Patch automation signals on every new page
    await context.addInitScript(STEALTH_SCRIPT);

    const page = await context.newPage();
    return await fn(page);
  } finally {
    if (context) {
      await context.close().catch(() => {});
    }
  }
}

/**
 * Gracefully close the shared browser (call on process exit if needed).
 */
export async function closeBrowser(): Promise<void> {
  if (_browser) {
    await _browser.close().catch(() => {});
    _browser = null;
  }
}
