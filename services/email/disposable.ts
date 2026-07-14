// Small built-in list for the MVP. Swap for a maintained package
// (e.g. "disposable-email-domains") or a hosted list later.
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "10minutemail.com",
  "guerrillamail.com",
  "tempmail.com",
  "yopmail.com",
  "trashmail.com",
  "getnada.com",
  "sharklasers.com",
]);

export function checkDisposable(domain: string) {
  return { disposable: DISPOSABLE_DOMAINS.has(domain.toLowerCase()) };
}
