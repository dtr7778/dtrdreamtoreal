declare namespace Express {
  interface Request {
    cspNonce?: string;
    rawBody?: string;
  }
}
