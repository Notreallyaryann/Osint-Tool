import { FootprintResult } from "../types";
import { withPage } from "../playwright-pool";

async function extractInstagramUsername(
  email: string,
  csrf: string,
  cookies: { name: string; value: string }[]
): Promise<{ username?: string; avatarUrl?: string; profileUrl?: string }> {
  return withPage(async (page) => {
    // Set the cookies we already have from the main check
    await page.context().addCookies(
      cookies.map((c) => ({ name: c.name, value: c.value, domain: ".instagram.com", path: "/" }))
    );

    let resetResponse: any = null;

    // Intercept the password reset API call
    await page.route("**/accounts/account_recovery_send_ajax/**", async (route) => {
      const response = await route.fetch();
      try { resetResponse = await response.json(); } catch { }
      await route.fulfill({ response });
    });

    await page.route("**/send_password_reset/**", async (route) => {
      const response = await route.fetch();
      try { resetResponse = await response.json(); } catch { }
      await route.fulfill({ response });
    });

    await page.goto("https://www.instagram.com/accounts/password/reset/", {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });

    // Fill email
    try {
      await page.waitForSelector('input[name="email"], input[type="email"], input[aria-label*="email" i]', {
        timeout: 8000,
      });
      await page.fill('input[name="email"], input[type="email"], input[aria-label*="email" i]', email);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(4000);
    } catch { }

    // Try to find username or profile image in the DOM after submission
    const info = await page.evaluate(() => {
      // Look for username patterns in the page text
      const text = document.body.innerText || "";
      const usernameMatch =
        text.match(/@([A-Za-z0-9._]{1,30})/) ||
        text.match(/username[:\s]+([A-Za-z0-9._]{1,30})/i);

      // Look for any profile image that appeared (not Instagram's static assets)
      const imgs = Array.from(document.querySelectorAll("img"));
      const profileImg = imgs.find(
        (img) =>
          img.src &&
          img.src.includes("cdninstagram") &&
          !img.src.includes("logo")
      );

      return {
        usernameFromText: usernameMatch ? usernameMatch[1] : null,
        avatarUrl: profileImg?.src || null,
      };
    });

    const result: { username?: string; avatarUrl?: string; profileUrl?: string } = {};
    if (info.usernameFromText) {
      result.username = info.usernameFromText;
      result.profileUrl = `https://www.instagram.com/${info.usernameFromText}/`;
    }
    if (info.avatarUrl) {
      result.avatarUrl = info.avatarUrl;
    }

    // Also check if the reset API response included any user data
    if (resetResponse) {
      const body =
        resetResponse.body || resetResponse.message || resetResponse.title || "";
      const match = String(body).match(/@?([A-Za-z0-9._]{1,30})/);
      if (match && !result.username) {
        result.username = match[1];
        result.profileUrl = `https://www.instagram.com/${match[1]}/`;
      }
    }

    return result;
  });
}

export async function checkInstagram(email: string): Promise<FootprintResult> {
  const show_url = "https://www.instagram.com";

  try {
    const result = await withPage(async (page) => {
      // 1. Load Instagram — lets JS run and sets real cookies (csrftoken etc.)
      await page.goto("https://www.instagram.com/", {
        waitUntil: "networkidle",
        timeout: 30000,
      });

      // 2. Pull csrftoken from the browser cookie store
      const cookies = await page.context().cookies("https://www.instagram.com");
      const csrfCookie = cookies.find((c) => c.name === "csrftoken");

      if (!csrfCookie) {
        return {
          source: "instagram",
          status: "error" as const,
          url: null,
          message: "CSRF token not found after JS render (IP may be flagged)",
        };
      }

      const csrf = csrfCookie.value;

      // 3. POST the email-check API using fetch() inside the real browser context
      const data = await page.evaluate(
        async ({ email, csrf }: { email: string; csrf: string }) => {
          const body = new URLSearchParams({ email, sign_up_code: "" });
          const res = await fetch("https://www.instagram.com/api/v1/users/check_email/", {
            method: "POST",
            credentials: "include",
            headers: {
              "content-type": "application/x-www-form-urlencoded",
              "x-csrftoken": csrf,
              "x-ig-app-id": "936619743392459",
              "x-requested-with": "XMLHttpRequest",
              origin: "https://www.instagram.com",
              referer: "https://www.instagram.com/",
            },
            body: body.toString(),
          });
          const status = res.status;
          let json: any = null;
          try { json = await res.json(); } catch { }
          return { status, json };
        },
        { email, csrf }
      );

      // 4. Handle the check result
      if (data.status === 200) {
        if (data.json?.error_type === "email_is_taken") {
          // Email is registered — try to extract the username too
          const extra = await extractInstagramUsername(email, csrf, cookies).catch(() => null);
          return {
            source: "instagram",
            status: "taken" as const,
            url: extra?.profileUrl || show_url,
            profileUrl: extra?.profileUrl,
            username: extra?.username,
            avatarUrl: extra?.avatarUrl,
            message: null,
          };
        } else if (data.json?.available === true) {
          return { source: "instagram", status: "available" as const, url: show_url, message: null };
        }
        return {
          source: "instagram",
          status: "error" as const,
          url: null,
          message: `Unexpected 200 body: ${JSON.stringify(data.json)}`,
        };
      }

      if (data.status === 400 && data.json?.spam === true) {
        return { source: "instagram", status: "available" as const, url: show_url, message: null };
      }

      if (data.status === 429) {
        return { source: "instagram", status: "error" as const, url: null, message: "Rate limited (429)" };
      }

      return {
        source: "instagram",
        status: "error" as const,
        url: null,
        message: `HTTP ${data.status}: ${JSON.stringify(data.json)}`,
      };
    });

    return result as FootprintResult;
  } catch (e) {
    return {
      source: "instagram",
      status: "error",
      url: null,
      message: `Playwright error: ${(e as Error).message}`,
    };
  }
}
