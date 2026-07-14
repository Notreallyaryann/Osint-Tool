import tls from "node:tls";

export async function getSslInfo(domain: string): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    const socket = tls.connect(
      { host: domain, port: 443, servername: domain, timeout: 8000 },
      () => {
        const cert = socket.getPeerCertificate();
        socket.end();
        resolve({
          available: true,
          issuer: cert.issuer,
          subject: cert.subject,
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          protocol: socket.getProtocol(),
        });
      }
    );

    socket.on("error", (e) => {
      resolve({ available: false, error: e.message });
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve({ available: false, error: "Connection timed out" });
    });
  });
}
