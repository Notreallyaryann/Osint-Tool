import crypto from "node:crypto";

export async function checkGravatar(email: string) {
  const hash = crypto
    .createHash("md5")
    .update(email.trim().toLowerCase())
    .digest("hex");

  const url = `https://www.gravatar.com/avatar/${hash}?d=404`;

  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(6000) });
    return { hasGravatar: res.status === 200, avatarUrl: res.status === 200 ? url : null };
  } catch (e) {
    return { hasGravatar: false, avatarUrl: null, error: (e as Error).message };
  }
}
