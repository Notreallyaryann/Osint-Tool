import { FootprintResult } from "../types";
import { withPage } from "../playwright-pool";

export async function checkFacebook(email: string): Promise<FootprintResult> {
  const show_url = "https://www.facebook.com";

  try {
    const result = await withPage(async (page) => {
      // 1. Navigate to the Facebook account recovery / identify page
      await page.goto(
        "https://www.facebook.com/login/identify/?ctx=recover&ars=facebook_login&from_login_screen=0",
        { waitUntil: "networkidle", timeout: 30000 }
      );

      // 2. Find the email/phone input and fill it
      const inputSelector =
        'input[name="email"], input[id="identify_email"], input[placeholder*="email" i], input[type="text"]:visible';
      await page.waitForSelector(inputSelector, { timeout: 15000 });
      await page.fill(inputSelector, email);

      // 3. Intercept the identify AJAX response
      let responseBody = "";
      const responsePromise = page
        .waitForResponse(
          (res) =>
            res.url().includes("/ajax/login/help/identify") ||
            res.url().includes("/recover") ||
            res.url().includes("identify"),
          { timeout: 15000 }
        )
        .then(async (res) => {
          try { responseBody = await res.text(); } catch {}
        })
        .catch(() => {});

      // 4. Submit
      await page.keyboard.press("Enter");

      await Promise.race([
        responsePromise,
        page.waitForNavigation({ timeout: 12000 }).catch(() => {}),
        page.waitForTimeout(8000),
      ]);

      if (!responseBody) {
        responseBody = await page.content();
      }

      // 5. Try to extract name + avatar from the DOM on the resulting page
      //    Facebook's account recovery result page shows:
      //    - A profile picture (img with the user's face)
      //    - The user's name in a heading or paragraph
      const extracted = await page.evaluate(() => {
        // Name: look for the most prominent text near a profile image
        const nameSelectors = [
          "[data-testid='account_recovery_person_name']",
          ".uiHeaderTitle",
          "._9ay7 span",
          "h2", "h3",
        ];
        let displayName: string | null = null;
        for (const sel of nameSelectors) {
          const el = document.querySelector(sel);
          const txt = el?.textContent?.trim();
          if (txt && txt.length > 1 && txt.length < 100 && !/facebook|password|email/i.test(txt)) {
            displayName = txt;
            break;
          }
        }

        // Avatar: profile picture
        const avatarSelectors = [
          "img[data-testid='account_recovery_profile_pic']",
          ".profilePicThumb img",
          "._50lt img",
          // Catch any non-icon image bigger than 40×40
        ];
        let avatarUrl: string | null = null;
        for (const sel of avatarSelectors) {
          const img = document.querySelector<HTMLImageElement>(sel);
          if (img?.src && !img.src.includes("static") && !img.src.includes("logo")) {
            avatarUrl = img.src;
            break;
          }
        }
        if (!avatarUrl) {
          // Fallback: find any profile-looking image
          const imgs = Array.from(document.querySelectorAll<HTMLImageElement>("img"));
          const profileImg = imgs.find(
            (img) =>
              img.naturalWidth > 40 &&
              img.src &&
              (img.src.includes("fbcdn") || img.src.includes("facebook")) &&
              !img.src.includes("logo") &&
              !img.src.includes("icon")
          );
          if (profileImg) avatarUrl = profileImg.src;
        }

        return { displayName, avatarUrl };
      });

      // 6. Parse result from body text
      const taken =
        responseBody.includes("These accounts matched your search") ||
        responseBody.includes("redirectPageTo") ||
        responseBody.includes("account_recovery") ||
        responseBody.includes("Send code") ||
        responseBody.includes("send_code") ||
        responseBody.includes("Confirm your identity") ||
        responseBody.includes("We found your account");

      const notFound =
        responseBody.includes("No search results") ||
        responseBody.includes("Your search did not return any results") ||
        responseBody.includes("couldn't find your account") ||
        responseBody.includes("No account found") ||
        responseBody.includes("no accounts match");

      // Check URL-based fallback
      const finalUrl = page.url();
      const urlTaken = finalUrl.includes("recover") && !finalUrl.includes("identify");

      if (notFound) {
        return { source: "facebook", status: "available" as const, url: show_url, message: null };
      }

      if (taken || urlTaken) {
        return {
          source: "facebook",
          status: "taken" as const,
          url: show_url,
          message: null,
          displayName: extracted.displayName || undefined,
          avatarUrl: extracted.avatarUrl || undefined,
        };
      }

      return {
        source: "facebook",
        status: "error" as const,
        url: null,
        message: "Could not determine result from Facebook response",
      };
    });

    return result as FootprintResult;
  } catch (e) {
    return {
      source: "facebook",
      status: "error",
      url: null,
      message: `Playwright error: ${(e as Error).message}`,
    };
  }
}
