import { FootprintResult } from "../types";

export async function checkInstagram(email: string): Promise<FootprintResult> {
  const show_url = "https://instagram.com";
  const user_agent =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

  try {
    const res = await fetch("https://www.instagram.com/", {
      headers: { "user-agent": user_agent },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });

    let csrf = "";

    // Attempt to extract CSRF token from cookies
    const setCookies = res.headers.getSetCookie();
    const cookieString = setCookies.map((c) => c.split(";")[0]).join("; ");
    
    for (const cookie of setCookies) {
      const match = cookie.match(/csrftoken=([^;]+)/);
      if (match) {
        csrf = match[1];
        break;
      }
    }

    if (!csrf) {
      const text = await res.text();
      const match = text.match(/["']csrf_token["']\s*:\s*["']([^"']+)["']/);
      if (match) {
        csrf = match[1];
      }
    }

    if (!csrf) {
      return {
        source: "instagram",
        status: "error",
        url: null,
        message: "CSRF token not found (IP may be flagged)",
      };
    }

    const headers: Record<string, string> = {
      "x-csrftoken": csrf,
      "x-ig-app-id": "936619743392459",
      "x-requested-with": "XMLHttpRequest",
      origin: "https://www.instagram.com",
      referer: "https://www.instagram.com/",
      accept: "*/*",
      "content-type": "application/x-www-form-urlencoded",
      "user-agent": user_agent,
    };

    if (cookieString) {
      headers["cookie"] = cookieString;
    }

    const body = new URLSearchParams({ email, sign_up_code: "" });

    const response = await fetch("https://www.instagram.com/api/v1/users/check_email/", {
      method: "POST",
      headers,
      body: body.toString(),
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 200) {
      const data = await response.json();
      if (data.error_type === "email_is_taken") {
        return { source: "instagram", status: "taken", url: show_url, message: null };
      } else if (data.available === true) {
        return { source: "instagram", status: "available", url: show_url, message: null };
      }
      return {
        source: "instagram",
        status: "error",
        url: null,
        message: "Unexpected 200 response body",
      };
    }

    if (response.status === 400) {
      const data = await response.json();
      if (data.spam === true) {
        // Instagram often blocks enumeration of non-existing emails with 'spam': true
        return { source: "instagram", status: "available", url: show_url, message: null };
      }
      return {
        source: "instagram",
        status: "error",
        url: null,
        message: "Unexpected 400 response body",
      };
    }

    if (response.status === 429) {
      return { source: "instagram", status: "error", url: null, message: "Rate limited (429)" };
    }

    return {
      source: "instagram",
      status: "error",
      url: null,
      message: `HTTP ${response.status}`,
    };
  } catch (e) {
    if ((e as Error).name === "TimeoutError") {
      return { source: "instagram", status: "error", url: null, message: "Connection timed out" };
    }
    return {
      source: "instagram",
      status: "error",
      url: null,
      message: `Unexpected Exception: ${(e as Error).message}`,
    };
  }
}
