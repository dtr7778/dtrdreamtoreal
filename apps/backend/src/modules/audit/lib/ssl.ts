import tls from "node:tls";

export interface SslCertificateInfo {
  valid: boolean;
  validFrom: string | null;
  validTo: string | null;
  daysUntilExpiry: number | null;
  issuer: string | null;
  subject: string | null;
  protocol: string | null;
  error: string | null;
}

function firstString(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export async function inspectCertificate(
  hostname: string,
  port = 443,
  timeoutMs = 10_000
): Promise<SslCertificateInfo> {
  return new Promise((resolve) => {
    let settled = false;

    const finish = (info: SslCertificateInfo) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(info);
    };

    const socket = tls.connect(
      {
        host: hostname,
        port,
        servername: hostname,
        rejectUnauthorized: false,
        timeout: timeoutMs,
      },
      () => {
        try {
          const certificate = socket.getPeerCertificate();
          const protocol = socket.getProtocol();
          const validTo = certificate.valid_to ?? null;
          const validFrom = certificate.valid_from ?? null;
          const expiry = validTo ? new Date(validTo) : null;
          const daysUntilExpiry = expiry
            ? Math.floor((expiry.getTime() - Date.now()) / 86_400_000)
            : null;

          finish({
            valid: socket.authorized,
            validFrom,
            validTo,
            daysUntilExpiry,
            issuer:
              firstString(certificate.issuer?.O) ??
              firstString(certificate.issuer?.CN),
            subject: firstString(certificate.subject?.CN),
            protocol,
            error: socket.authorized
              ? null
              : (socket.authorizationError?.toString() ?? "untrusted"),
          });
        } catch (err) {
          finish({
            valid: false,
            validFrom: null,
            validTo: null,
            daysUntilExpiry: null,
            issuer: null,
            subject: null,
            protocol: null,
            error: err instanceof Error ? err.message : "certificate error",
          });
        }
      }
    );

    socket.on("error", (err) => {
      finish({
        valid: false,
        validFrom: null,
        validTo: null,
        daysUntilExpiry: null,
        issuer: null,
        subject: null,
        protocol: null,
        error: err.message,
      });
    });

    socket.on("timeout", () => {
      finish({
        valid: false,
        validFrom: null,
        validTo: null,
        daysUntilExpiry: null,
        issuer: null,
        subject: null,
        protocol: null,
        error: "TLS handshake timed out",
      });
    });
  });
}
