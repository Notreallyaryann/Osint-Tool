const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_\`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function checkSyntax(email: string) {
  const valid = EMAIL_REGEX.test(email);
  const [local, domain] = email.split("@");
  return {
    valid,
    local: local ?? null,
    domain: domain ?? null,
  };
}
