import { FootprintResult } from "../types";
import { withPage } from "../playwright-pool";

export async function checkGithub(email: string): Promise<FootprintResult> {
  const showUrl = "https://github.com";

  try {
    const result = await withPage(async (page) => {
      // 1. Intercept the email_validity_checks response *before* navigating
      let interceptedResponse: any = null;
      await page.route("**/email_validity_checks**", async (route) => {
        // Let the real request go through
        const response = await route.fetch();
        try {
          interceptedResponse = await response.json();
        } catch {
          interceptedResponse = await response.text();
        }
        await route.fulfill({ response });
      });

      // 2. Load the GitHub signup page — JS renders and sets session cookies
      await page.goto("https://github.com/signup", {
        waitUntil: "networkidle",
        timeout: 30000,
      });

      // 3. Find the email input on the signup flow and type the email
      //    GitHub's signup uses a multi-step wizard; the email field is first
      const emailInput = page.locator(
        'input[type="email"], input[name="user[email]"], input[autocomplete="email"], #email'
      ).first();

      await emailInput.waitFor({ state: "visible", timeout: 15000 });
      await emailInput.fill(email);

      // 4. Trigger email validation by pressing Tab or clicking Continue
      //    GitHub sends the validation request on blur / after typing
      await emailInput.press("Tab");

      // 5. Wait for the intercepted response (GitHub fires it within ~2s)
      await page.waitForTimeout(3000);

      // If interception didn't fire, try submitting the form step
      if (!interceptedResponse) {
        const continueBtn = page.locator('button:has-text("Continue"), [type="submit"]').first();
        await continueBtn.click({ timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(3000);
      }

      if (!interceptedResponse) {
        // Last resort: check the page for inline error/success messages
        const pageText = await page.content();
        if (pageText.includes("already associated with an account")) {
          return { source: "github", status: "taken" as const, url: showUrl, message: null };
        }
        if (pageText.includes("Email is available")) {
          return { source: "github", status: "available" as const, url: showUrl, message: null };
        }
        return {
          source: "github",
          status: "error" as const,
          url: null,
          message: "No response intercepted from GitHub email validation",
        };
      }

      // 6. Parse the intercepted JSON response
      const body =
        typeof interceptedResponse === "string"
          ? interceptedResponse
          : JSON.stringify(interceptedResponse);

      if (body.includes("already associated with an account")) {
        return { source: "github", status: "taken" as const, url: showUrl, message: null };
      }

      if (body.includes("Email is available")) {
        return { source: "github", status: "available" as const, url: showUrl, message: null };
      }

      return {
        source: "github",
        status: "error" as const,
        url: null,
        message: `Unexpected GitHub response: ${body.slice(0, 200)}`,
      };
    });

    return result as FootprintResult;
  } catch (e) {
    return {
      source: "github",
      status: "error",
      url: null,
      message: `Playwright error: ${(e as Error).message}`,
    };
  }
}
